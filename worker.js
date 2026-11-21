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

    if (env.ACCESS_PIN) {
      const providedPin = request.headers.get("X-Access-Pin") || "";
      if (providedPin !== env.ACCESS_PIN) {
        return new Response(JSON.stringify({ error: "Invalid or missing Access PIN" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (!env.AI) {
      return new Response(JSON.stringify({ error: "Workers AI binding (AI) is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const { model = "fast", prompt } = await request.json();
      if (!prompt) {
        return new Response(JSON.stringify({ error: "Missing prompt" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const cfModel = model === "fast"
        ? "@cf/meta/llama-3.1-8b-instruct-fast"
        : "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

      const aiRes = await env.AI.run(cfModel, {
        messages: [
          {
            role: "system",
            content: "You are an expert analyst. Produce thorough, specific, well-structured Markdown summaries of WhatsApp chats. Preserve exact project names, people's names, dates, links, and technical details. Translate any Roman Urdu/Hindi into clear English. Never be vague or repetitive.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 4096,
      });

      const text = aiRes?.response || "";
      return new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text }] } }],
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || "AI inference error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};
