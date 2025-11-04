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

    // HIGH QUALITY SETTINGS
    const finalSize = 1080;
    const borderWidth = 60;       // White polaroid border
    const frameBorder = 2;        // Colored frame (thin!)
    const bottomSpace = 150;      // Space for caption at bottom

    // Calculate available space for the photo
    const availableWidth = finalSize - (borderWidth * 2) - (frameBorder * 2);
    const availableHeight = finalSize - (borderWidth * 2) - (frameBorder * 2) - bottomSpace;

    // Get original image dimensions
    let imgWidth = uploadedImage.width;
    let imgHeight = uploadedImage.height;

    // Scale to fit available space while maintaining aspect ratio
    const scale = Math.min(
        availableWidth / imgWidth,
        availableHeight / imgHeight
    );

    imgWidth = Math.floor(imgWidth * scale);
    imgHeight = Math.floor(imgHeight * scale);

    // Set canvas to ACTUAL high resolution
    canvas.width = finalSize;
    canvas.height = finalSize;

    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Draw white polaroid background (fills entire canvas)
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, finalSize, finalSize);

    // 2. Draw colored frame (inside white border)
    ctx.fillStyle = borderColor.value;
    ctx.fillRect(
        borderWidth,
        borderWidth,
        finalSize - (borderWidth * 2),
        finalSize - (borderWidth * 2)
    );

    // 3. Draw the photo (centered in the top area, leaving bottom for caption)
    const photoX = borderWidth + frameBorder + ((availableWidth - imgWidth) / 2);
    const photoY = borderWidth + frameBorder;

    ctx.drawImage(
        uploadedImage,
        photoX,
        photoY,
        imgWidth,
        imgHeight
    );

    // 4. Draw white space at bottom for caption
    ctx.fillStyle = 'white';
    ctx.fillRect(
        borderWidth + frameBorder,
        finalSize - borderWidth - bottomSpace,
        availableWidth,
        bottomSpace
    );

    // 5. Draw caption text in the white bottom space
    if (captionText.value) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            captionText.value,
            finalSize / 2,
            finalSize - borderWidth - (bottomSpace / 2) + 10
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
    link.download = filename + '.png';  // ✅ FIXED! Now uses the filename variable
    link.href = canvas.toDataURL('image/png', 1.0);  // Maximum quality
    link.click();
});
