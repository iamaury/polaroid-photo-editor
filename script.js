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

    // Polaroid dimensions
    const borderWidth = 40; // White border
    const frameBorder = 2; // Colored frame
    const bottomTextSpace = 80; // Extra space for text
    
    // Calculate canvas size
    const maxWidth = 500;
    let imgWidth = uploadedImage.width;
    let imgHeight = uploadedImage.height;
    
    // Resize if too large
    if (imgWidth > maxWidth) {
        imgHeight = (maxWidth / imgWidth) * imgHeight;
        imgWidth = maxWidth;
    }
    
    // Set canvas size (image + borders + text space)
    canvas.width = imgWidth + (borderWidth * 2) + (frameBorder * 2);
    canvas.height = imgHeight + (borderWidth * 2) + bottomTextSpace + (frameBorder * 2);
    
    // Draw colored frame (outer border)
    ctx.fillStyle = borderColor.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw white polaroid border
    ctx.fillStyle = 'white';
    ctx.fillRect(
        frameBorder, 
        frameBorder, 
        canvas.width - (frameBorder * 2), 
        canvas.height - (frameBorder * 2)
    );
    
    // Draw the image
    ctx.drawImage(
        uploadedImage,
        borderWidth + frameBorder,
        borderWidth + frameBorder,
        imgWidth,
        imgHeight
    );
    
    // Draw caption text
    if (captionText.value) {
        ctx.fillStyle = borderColor.value;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(
            captionText.value,
            canvas.width - borderWidth - frameBorder - 10,
            canvas.height - 30
        );
    }
}

// Download button
downloadBtn.addEventListener('click', function() {
    if (!uploadedImage) {
        alert('Please upload a photo first!');
        return;
    }
    
    const link = document.createElement('a');
    link.download = 'my-polaroid.png';
    link.href = canvas.toDataURL();
    link.click();
});
