document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById('analyzeBtn');
  const resultDiv = document.getElementById('result');
  const fileInput = document.getElementById('plantImage');

  // Show preview when file selected
  const previewImg = document.createElement('img');
  previewImg.style.maxWidth = '200px';
  previewImg.style.marginTop = '15px';
  fileInput.parentNode.insertBefore(previewImg, resultDiv);

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    previewImg.src = file ? URL.createObjectURL(file) : '';
  });

  analyzeBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
      resultDiv.innerHTML = "<span style='color:orange;'>⚠️ Please upload a plant image first!</span>";
      return;
    }

    resultDiv.innerHTML = "<span style='color:green;'>🧠 Analyzing plant health... please wait.</span>";

    const base64Image = await toBase64(file);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: base64Image.split(',')[1] })
      });

      let data;
      try {
        data = await res.json();
      } catch {
        resultDiv.innerHTML = "<span style='color:red;'>❌ OpenAI response invalid. Check console.</span>";
        console.error("OpenAI raw response:", await res.text());
        return;
      }

      if (res.ok) {
        resultDiv.innerHTML = `
          <div style="border:1px solid #28a745; padding:15px; border-radius:8px; background:#e6f4ea;">
            <h5>🌿 Plant Analysis Result:</h5>
            <p>${data.output?.[0]?.content?.[0]?.text || "❌ Could not analyze image. Try again."}</p>
          </div>
        `;
      } else {
        resultDiv.innerHTML = `<span style='color:red;'>Error: ${data.error || JSON.stringify(data)}</span>`;
      }
    } catch (err) {
      console.error("Plant Helper Error:", err);
      resultDiv.innerHTML = "<span style='color:red;'>❌ Something went wrong.</span>";
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
