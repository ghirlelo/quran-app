export default async function handler(req, res) {
  const { topic } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ explanation: "Error: API Key is missing in Vercel." });

  try {
    // UPDATED for March 2026: Using the new Gemini 3 Flash model
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Provide a brief, educational summary of the concept of ${topic} in the Quran for a student project.` }]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
        // This will tell you if your key is invalid or if the model is wrong
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
