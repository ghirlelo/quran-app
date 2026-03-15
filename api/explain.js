// api/explain.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { ayah } = req.body;
  if (!ayah) return res.status(400).json({ error: "Ayah is required" });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: `Explain this Quran verse simply in Urdu: ${ayah}` }
        ]
      })
    });

    const data = await response.json();
    const explanation = data.choices[0].message.content;

    res.status(200).json({ explanation });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get explanation" });
  }
}
