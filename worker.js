export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Access-Pin",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional access PIN check (set ACCESS_PIN in Cloudflare Variables if you want to restrict access)
    if (env.ACCESS_PIN) {
      const providedPin = request.headers.get("X-Access-Pin") || "";
      if (providedPin !== env.ACCESS_PIN) {
        return new Response(JSON.stringify({ error: "Invalid or missing Access PIN" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (!env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Server missing GEMINI_API_KEY secret" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const { model = "gemini-2.5-flash", prompt } = await request.json();
      if (!prompt) {
        return new Response(JSON.stringify({ error: "Missing prompt" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const allowedModels = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"];
      const safeModel = allowedModels.includes(model) ? model : "gemini-2.5-flash";

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(safeModel)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;

      const geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      const data = await geminiRes.json();
      return new Response(JSON.stringify(data), {
        status: geminiRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || "Proxy error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};
