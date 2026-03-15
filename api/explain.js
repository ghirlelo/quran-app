export default async function handler(req, res) {
  const { topic } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ explanation: "Error: API Key is missing in Vercel." });

  try {
    // Gemini 3 Flash with short, concise prompt
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `اس قرآنی موضوع "${topic}" کی مختصر اور واضح اردو میں تشریح کریں۔ صرف 1 یا 2 جملے لکھیں، آسان الفاظ میں۔`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ explanation: `Google Error: ${data.error.message}` });
    }

    if (data.candidates && data.candidates[0].content.parts[0].text) {
      res.status(200).json({ explanation: data.candidates[0].content.parts[0].text });
    } else {
      res.status(500).json({ explanation: "The AI did not return a response. Check your API settings." });
    }
  } catch (error) {
    res.status(500).json({ explanation: "Connection Error: " + error.message });
  }
}
