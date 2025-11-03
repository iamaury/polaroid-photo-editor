// Get all the elements we need
const photoUpload = document.getElementById('photoUpload');
const borderColor = document.getElementById('borderColor');
const captionText = document.getElementById('captionText');
const canvas = document.getElementById('photoCanvas');
const downloadBtn = document.getElementById('downloadBtn');
const ctx = canvas.getContext('2d');

// Store the uploaded image
let uploadedImage = null;

// When user uploads a photo
photoUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            uploadedImage = new Image();
            uploadedImage.onload = function() {
                drawPolaroid();
            };
            uploadedImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// When user changes border color
borderColor.addEventListener('input', function() {
    if (uploadedImage) {
        drawPolaroid();
    }
});

// When user types caption
captionText.addEventListener('input', function() {
    if (uploadedImage) {
        drawPolaroid();
    }
});

// Main function to draw the polaroid
function drawPolaroid() {
    if (!uploadedImage) return;
    
    // TARGET SIZE: 1080×1080 final canvas
    const finalSize = 1080;
    const borderWidth = 60;      // White polaroid border
    const frameBorder = 3;       // Colored frame width
    const bottomTextSpace = 120; // Space for caption
    
    // Calculate image size (fits within the available space)
    const availableSpace = finalSize - (borderWidth * 2) - (frameBorder * 2);
    
    let imgWidth = uploadedImage.width;
    let imgHeight = uploadedImage.height;
    
    // Scale image to fit
    const scale = Math.min(
        availableSpace / imgWidth,
        (availableSpace - bottomTextSpace) / imgHeight
    );
    
    imgWidth = imgWidth * scale;
    imgHeight = imgHeight * scale;
    
    // Set canvas to exact final size
    canvas.width = finalSize;
    canvas.height = finalSize;
    
    // Draw white polaroid background (outermost)
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw colored frame (around the photo)
    ctx.fillStyle = borderColor.value;
    ctx.fillRect(
        borderWidth,
        borderWidth,
        canvas.width - (borderWidth * 2),
        canvas.height - (borderWidth * 2) - bottomTextSpace
    );
    
    // Draw the image (inside colored frame)
    const imgX = borderWidth + frameBorder;
    const imgY = borderWidth + frameBorder;
    
    ctx.drawImage(
        uploadedImage,
        imgX,
        imgY,
        imgWidth - (frameBorder * 2),
        imgHeight - (frameBorder * 2)
    );
    
    // Draw caption text
    if (captionText.value) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(
            captionText.value,
            canvas.width - borderWidth - 20,
            canvas.height - 50
        );
    }
}


// Download button
downloadBtn.addEventListener('click', function() {
    if (!uploadedImage) {
        alert('Please upload a photo first!');
        return;
    }

    // Create filename from caption
    let filename = 'my-polaroid'; // default name
    if (captionText.value) {
        filename = captionText.value
            .toLowerCase()                    // Convert to lowercase
            .replace(/[^a-z0-9\s]/g, '')     // Remove special characters
            .trim()                           // Remove extra spaces
            .replace(/\s+/g, '_');           // Replace spaces with underscores
    }
    
    const link = document.createElement('a');
    link.download = 'my-polaroid.png';
    link.href = canvas.toDataURL();
    link.click();
});
