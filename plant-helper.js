document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById('analyzeBtn');
  const resultDiv = document.getElementById('result');
  const fileInput = document.getElementById('plantImage');

  // Preview image
  const previewImg = document.createElement('img');
  previewImg.style.maxWidth = '250px';
  previewImg.style.marginTop = '15px';
  fileInput.parentNode.insertBefore(previewImg, resultDiv);

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) previewImg.src = URL.createObjectURL(file);
    else previewImg.src = '';
  });

  analyzeBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
      resultDiv.innerHTML = "<span class='text-warning'>⚠️ Please upload a plant image first!</span>";
      return;
    }

    resultDiv.innerHTML = "<span class='text-success'>🧠 Analyzing plant health... please wait.</span>";

    try {
      const base64Image = await toBase64(file);
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: base64Image.split(',')[1] })
      });

      const data = await res.json();
      if (res.ok) {
        resultDiv.innerHTML = `
          <div class="border border-success p-3 rounded bg-light text-success">
            <h5>🌿 Plant Analysis Result:</h5>
            <p>${data.output?.[0]?.content?.[0]?.text || "❌ Could not analyze image. Try again."}</p>
          </div>
        `;
      } else {
        resultDiv.innerHTML = `<span class='text-danger'>Error: ${data.error || JSON.stringify(data)}</span>`;
      }
    } catch (err) {
      console.error("Plant Helper Error:", err);
      resultDiv.innerHTML = "<span class='text-danger'>❌ Something went wrong. Check console.</span>";
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
