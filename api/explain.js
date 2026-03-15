export default async function handler(req, res) {
  // 1. Get the topic from the frontend
  const { topic } = req.body;
  
  // 2. Access your Secret Key (Ensure it is named GEMINI_API_KEY in Vercel)
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ explanation: "Configuration Error: API Key is missing in Vercel." });
  }

  try {
    // 3. The "Handshake" with Google Gemini 3 Flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: `Provide a brief, academic, and respectful explanation of the Quranic concept of '${topic}' for a university research project.` 
          }]
        }],
        // 4. Safety Settings: This tells Google not to block religious research topics
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      })
    });

    const data = await response.json();

    // 5. If Google sends an error, this will tell you exactly why
    if (data.error) {
      return res.status(500).json({ explanation: `Google API Error: ${data.error.message}` });
    }

    // 6. Return the successful answer to your website
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
      res.status(200).json({ explanation: data.candidates[0].content.parts[0].text });
    } else {
      res.status(500).json({ explanation: "The AI received the request but didn't provide an answer. Try a different topic." });
    }

  } catch (error) {
    res.status(500).json({ explanation: "Server Connection Error: " + error.message });
  }
}
