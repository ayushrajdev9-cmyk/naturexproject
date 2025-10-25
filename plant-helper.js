const analyzeBtn = document.getElementById('analyzeBtn');
const resultDiv = document.getElementById('result');

analyzeBtn.addEventListener('click', async () => {
  const fileInput = document.getElementById('plantImage');
  const file = fileInput.files[0];

  if (!file) {
    resultDiv.innerText = "⚠️ Please upload a plant image first!";
    return;
  }

  resultDiv.innerText = "🧠 Analyzing plant health... please wait.";

  const base64Image = await toBase64(file);

  const response = await fetch("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", {
    method: "POST",
    headers: {
      "Authorization": `Bearer YOUR_API_KEY`, // 👈 sirf yaha apni key daal
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "Analyze this plant and tell if it’s healthy or not, and suggest remedies." },
            { type: "input_image", image_data: base64Image }
          ]
        }
      ]
    })
  });

  const data = await response.json();
  resultDiv.innerText = data.output[0].content[0].text || "❌ Could not analyze image. Try again.";
});

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
}
