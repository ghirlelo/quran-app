export default async function handler(req, res) {
  const { topic } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ explanation: "Configuration Error: GEMINI_API_KEY is missing in Vercel." });
  }

  try {
    // UPDATED: Using the most stable 2026 endpoint (v1beta instead of v1)
    // AND: Using the 'gemini-1.5-flash' model which is the most reliable free tier
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: `Explain the Quranic concept of '${topic}' for an academic university project. Please be brief and respectful.` 
          }]
        }],
        // CRITICAL: Updated safety categories to match the 2026 API requirements
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      })
    });

    const data = await response.json();

    // Debugging: If Google sends an error object, show it clearly
    if (data.error) {
      return res.status(500).json({ explanation: `Google says: ${data.error.message}` });
    }

    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
      res.status(200).json({ explanation: data.candidates[0].content.parts[0].text });
    } else {
      // This happens if the filters STILL block it
      res.status(200).json({ explanation: "The AI could not generate a response for this specific topic due to safety filters. Try a different word like 'Zakat' or 'Patience'." });
    }

  } catch (error) {
    res.status(500).json({ explanation: "Connection Error: " + error.message });
  }
}
