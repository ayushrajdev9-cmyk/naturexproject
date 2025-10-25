import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const OPENAI_KEY = process.env.OPENAI;
  
  if (!OPENAI_KEY) return res.status(500).json({ error: "Server misconfigured: missing API key" });

  try {
    const { image_base64 } = req.body;
    if (!image_base64) return res.status(400).json({ error: "Missing image_base64 in body" });

    const body = {
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "Analyze this plant and tell if it’s healthy or not, and suggest remedies." },
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

    if (!apiRes.ok) {
      const txt = await apiRes.text();
      return res.status(apiRes.status).send(txt);
    }

    const data = await apiRes.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error("analyze error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

