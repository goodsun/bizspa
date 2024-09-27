document.getElementById('upload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const maxWidth = 860;
        const scaleFactor = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scaleFactor;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);

	    alert('resize.jpgという名前でダウンロードします');
	    const link = document.createElement('a');
	    link.href = url;
	    link.download = 'resize.jpg'; // 明示的に .jpeg を指定
	    link.click();

            document.getElementById('result').src = url;
        }, 'image/jpeg', 0.8); // 0.8 は品質 (0.0〜1.0)
    };
});
