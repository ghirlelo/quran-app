export default async function handler(req, res) {
  const { topic, ayah } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ explanation: "Error: GEMINI_API_KEY is missing." });

  try {
    // Current 2026 model version
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Provide a 3-sentence summary of '${topic}' from this verse: '${ayah}'. No bold stars.` }]
        }]
      })
    });

    const data = await response.json();
    if (data.candidates) {
      res.status(200).json({ explanation: data.candidates[0].content.parts[0].text });
    } else {
      res.status(200).json({ explanation: "Summary unavailable." });
    }
  } catch (error) {
    res.status(500).json({ explanation: "Server error." });
  }
}
