export default async function handler(req, res) {
  try {
    // Read raw body
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const rawBody = Buffer.concat(buffers).toString();

    // Parse JSON
    const { prompt, model, token } = JSON.parse(rawBody || "{}");

    if (!prompt || !model || !token) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Call HuggingFace
    const hfResponse = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      },
    );

    if (!hfResponse.ok) {
      const errText = await hfResponse.text();
      return res.status(500).json({ error: "HF error", details: errText });
    }

    const arrayBuffer = await hfResponse.arrayBuffer();

    res.setHeader("Content-Type", "audio/flac");
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy failed", details: err.message });
  }
}
