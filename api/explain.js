export default async function handler(req, res) {
  // 1. Get the topic from the frontend
  const { topic } = req.body;

  // 2. Check if the API key is actually there
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
      return res.status(500).json({ explanation: "Error: API Key is missing in Vercel settings." });
  }

  try {
    // 3. Call OpenAI directly (No libraries needed!)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant explaining Quranic concepts clearly." },
          { role: "user", content: `Explain the concept of ${topic} in the Quran.` }
        ]
      })
    });

    const data = await response.json();
    
    // 4. Send the answer back to your website
    if (data.choices && data.choices[0]) {
        res.status(200).json({ explanation: data.choices[0].message.content });
    } else {
        res.status(500).json({ explanation: "OpenAI returned an empty response. Check your credits." });
    }

  } catch (error) {
    res.status(500).json({ explanation: "Server Error: " + error.message });
  }
}
