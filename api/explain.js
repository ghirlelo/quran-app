export default async function handler(req, res) {
  const { topic } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
      return res.status(500).json({ explanation: "Error: Gemini API Key is missing." });
  }

  try {
    // This calls Google's Gemini Pro model for FREE
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Explain the Quranic concept of ${topic} clearly for a student.` }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content.parts[0].text) {
        res.status(200).json({ explanation: data.candidates[0].content.parts[0].text });
    } else {
        res.status(500).json({ explanation: "Gemini didn't return an answer. Check your key." });
    }

  } catch (error) {
    res.status(500).json({ explanation: "Server Error: " + error.message });
  }
}
