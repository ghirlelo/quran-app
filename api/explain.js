export default async function handler(req, res) {
  const { topic, ayah } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Verify API Key exists
  if (!apiKey) {
    return res.status(500).json({ explanation: "Error: GEMINI_API_KEY is missing in Vercel settings." });
  }

  try {
    // Calling the 2026 stable model
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: `Provide a strict 3-sentence summary of '${topic}' based on this verse: '${ayah}'. 
            1. Define the concept briefly. 
            2. Explain the message of this specific verse. 
            3. Give one practical daily lesson. 
            Do not use bold stars (**) or headers.` 
          }]
        }]
      })
    });

    const data = await response.json();

    // Error handling for API response
    if (data.error) {
      return res.status(500).json({ explanation: `Google Error: ${data.error.message}` });
    }

    if (data.candidates && data.candidates[0].content.parts[0].text) {
      res.status(200).json({ explanation: data.candidates[0].content.parts[0].text });
    } else {
      res.status(200).json({ explanation: "No summary available for this verse." });
    }
  } catch (error) {
    res.status(500).json({ explanation: "Connection error: " + error.message });
  }
}
