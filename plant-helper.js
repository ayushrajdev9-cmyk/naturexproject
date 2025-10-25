document.addEventListener("DOMContentLoaded", () => {
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

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: base64Image.split(',')[1] })
      });

      const data = await res.json();
      if (res.ok) {
        resultDiv.innerText = (data.output?.[0]?.content?.[0]?.text) || "❌ Could not analyze image. Try again.";
      } else {
        resultDiv.innerText = "Error: " + (data.error || JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
      resultDiv.innerText = "❌ Something went wrong.";
    }
  });

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });
  }
});
