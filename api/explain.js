export default async function handler(req, res) {
  const { topic } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ explanation: "Error: GEMINI_API_KEY is missing in Vercel settings." });
  }

  try {
    // Using the 'gemini-1.5-flash' model - it's the most stable for free-tier student accounts in 2026
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: `Definition for a student: What is the general meaning of '${topic}' in a historical or religious context? Keep it very brief.` 
          }]
        }],
        // These settings prevent Google from returning a 500 error due to 'Sensitive' topics
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      })
    });

    const data = await response.json();

    // If Google returns an error, this will show it on your screen so we can see the 'Real' reason
    if (data.error) {
      return res.status(500).json({ explanation: `Google API Error: ${data.error.message}` });
    }

    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
      res.status(200).json({ explanation: data.candidates[0].content.parts[0].text });
    } else {
      res.status(200).json({ explanation: "The AI is being extra careful with this topic. Try a simple word like 'Patience' or 'Charity'." });
    }

  } catch (error) {
    res.status(500).json({ explanation: "Connection Error: " + error.message });
  }
}
