export default async function handler(req, res) {
  const { topic, ayah } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ explanation: "Error: GEMINI_API_KEY missing in Vercel." });
  }

  try {
    // Current stable 2026 endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: `Summarize the concept of '${topic}' using this verse: '${ayah}'. 
            Rules: 3 short sentences total. 
            1. Concept definition. 
            2. Verse meaning. 
            3. Life lesson. 
            No bold stars, no hashtags.` 
          }]
        }]
      })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return res.status(200).json({ explanation: data.candidates[0].content.parts[0].text });
    } else {
      return res.status(200).json({ explanation: "AI summary currently unavailable." });
    }
  } catch (error) {
    return res.status(500).json({ explanation: "Server Error: " + error.message });
  }
}
