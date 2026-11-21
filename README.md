# WhatsApp Chat Summarizer

A lightweight, privacy-friendly web form to upload WhatsApp exports (`.txt` or `.zip`) or paste chat text and generate structured summaries, Markdown downloads, and PDFs.

## Features
- **Upload `.txt` or `.zip`** WhatsApp exports (unzips in-browser using JSZip) or paste chat text directly.
- **Multiple summary formats:** Executive & Project Summary, Action Items & Decisions, Chronological Timeline, or Custom Instructions.
- **Export options:** Copy Markdown, Download `.md`, or Save as PDF (via clean print layout).
- **Privacy-first:** Runs 100% in your browser. Your Gemini API key is saved only in your browser's `localStorage` and chats are sent directly to the Gemini API—no intermediate server stores your messages.

## Deploy to Get a Live Link (GitHub Pages)
1. Create a new GitHub repository (e.g., `whatsapp-summarizer`).
2. Push `index.html` and `README.md` to the `main` branch.
3. Go to **Settings → Pages → Build and deployment → Source: Deploy from a branch (`main` / `/root`)**.
4. Open your live link at `https://<your-username>.github.io/whatsapp-summarizer/`.
