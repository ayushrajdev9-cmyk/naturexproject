import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_KEY = process.env.OPENAI;

  if (!OPENAI_KEY) {
    console.error("❌ OPENAI env variable missing!");
    return res.status(500).json({ error: "Server misconfigured: missing API key" });
  }

  try {
    const { image_base64 } = req.body;
    if (!image_base64) {
      return res.status(400).json({ error: "Missing image_base64 in body" });
    }

    // Debug logs
    console.log("Received base64 length:", image_base64.length);

    const body = {
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Analyze this plant and tell if it’s healthy or not, and suggest remedies."
            },
            { type: "input_image", image_data: image_base64 }
          ]
        }
      ]
    };

    const apiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const rawText = await apiRes.text();
    console.log("OpenAI raw response:", rawText);

    // Try to parse JSON safely
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      console.error("❌ Failed to parse JSON:", err);
      return res.status(500).json({ error: "Invalid JSON from OpenAI", raw: rawText });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error("❌ analyze.js error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
