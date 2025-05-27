 const sizeRange = document.getElementById('sizeRange');
    const sizeInput = document.getElementById('sizeInput');
    const displaySize = document.getElementById('displaySize');
    const downloadBtn = document.getElementById('downloadBtn');
    const formatSelect = document.getElementById('format');

    function showDownloadButton() {
      if (parseInt(sizeInput.value) > 0) {
        downloadBtn.style.display = 'block';
      } else {
        downloadBtn.style.display = 'none';
      }
    }

    function syncSizeInputs(value) {
      sizeInput.value = value;
      sizeRange.value = value;
      displaySize.textContent = value;
      showDownloadButton();
    }

    sizeRange.addEventListener('input', (e) => {
      syncSizeInputs(e.target.value);
    });

    sizeInput.addEventListener('input', (e) => {
      const value = Math.max(0, Math.min(20480, e.target.value));
      syncSizeInputs(value);
    });

    downloadBtn.addEventListener('click', () => {
      const sizeMB = parseInt(sizeInput.value);
      const format = formatSelect.value;
      const byteSize = sizeMB * 1000 * 1000; // Use base-10 MB

      try {
        const content = new Uint8Array(byteSize);
        const blob = new Blob([content], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `sample.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        alert('Failed to create large file. Try a smaller size.');
      }
    });