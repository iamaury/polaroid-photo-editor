// ═══════════════════════════════════════════════════════════
// POLAROID TEMPLATE - EXACT DIMENSIONS
// Canvas: 1080×1080px
// ═══════════════════════════════════════════════════════════

const TEMPLATE = {
    CANVAS_SIZE: 1080,
    
    // White polaroid borders
    WHITE_BORDER: {
        top: 96,
        left: 74,
        right: 74,
        bottom: 285
    },
    
    // Colored frame (between white border and photo)
    COLORED_FRAME: {
        left: 74,
        top: 96,
        right: 1006,
        bottom: 795,
        thickness: {
            horizontal: 16,  // left/right
            vertical: 12     // top/bottom
        }
    },
    
    // Photo area
    PHOTO: {
        x: 90,
        y: 108,
        width: 900,
        height: 675
    },
    
    // Caption
    CAPTION: {
        fontSize: 28,
        baseline: 972,  // 1080 - 108
        rightEdge: 990, // 1080 - 90
        alignment: 'right'
    }
};

// ═══════════════════════════════════════════════════════════
// DOM ELEMENTS
// ═══════════════════════════════════════════════════════════

const uploadInput = document.getElementById('uploadInput');
const uploadArea = document.getElementById('uploadArea');
const canvas = document.getElementById('photoCanvas');
const ctx = canvas.getContext('2d', { 
    alpha: false,
    desynchronized: false 
});
const colorPicker = document.getElementById('colorPicker');
const captionInput = document.getElementById('captionInput');
const downloadBtn = document.getElementById('downloadBtn');

let uploadedImage = null;

// ═══════════════════════════════════════════════════════════
// CANVAS SETUP - HIGH QUALITY
// ═══════════════════════════════════════════════════════════

function setupCanvas() {
    canvas.width = TEMPLATE.CANVAS_SIZE;
    canvas.height = TEMPLATE.CANVAS_SIZE;
    
    // High quality rendering settings
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
}

// ═══════════════════════════════════════════════════════════
// FILE UPLOAD HANDLERS
// ═══════════════════════════════════════════════════════════

uploadArea.addEventListener('click', () => uploadInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#007AFF';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#ddd';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#ddd';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImage(file);
    }
});

uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        loadImage(file);
    }
});

// ═══════════════════════════════════════════════════════════
// IMAGE LOADING
// ═══════════════════════════════════════════════════════════

function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            uploadedImage = img;
            renderPolaroid();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ═══════════════════════════════════════════════════════════
// RENDER POLAROID WITH EXACT TEMPLATE
// ═══════════════════════════════════════════════════════════

function renderPolaroid() {
    if (!uploadedImage) return;
    
    setupCanvas();
    
    // 1. WHITE BACKGROUND (entire canvas)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, TEMPLATE.CANVAS_SIZE, TEMPLATE.CANVAS_SIZE);
    
    // 2. COLORED FRAME
    const frameColor = colorPicker.value;
    ctx.fillStyle = frameColor;
    ctx.fillRect(
        TEMPLATE.COLORED_FRAME.left,
        TEMPLATE.COLORED_FRAME.top,
        TEMPLATE.COLORED_FRAME.right - TEMPLATE.COLORED_FRAME.left,
        TEMPLATE.COLORED_FRAME.bottom - TEMPLATE.COLORED_FRAME.top
    );
    
    // 3. PHOTO (COVER MODE - fills area, maintains aspect ratio, crops if needed)
    const photo = TEMPLATE.PHOTO;
    const imgAspect = uploadedImage.width / uploadedImage.height;
    const photoAspect = photo.width / photo.height;
    
    let sourceX, sourceY, sourceWidth, sourceHeight;
    
    if (imgAspect > photoAspect) {
        // Image is wider - crop left/right
        sourceHeight = uploadedImage.height;
        sourceWidth = sourceHeight * photoAspect;
        sourceX = (uploadedImage.width - sourceWidth) / 2;
        sourceY = 0;
    } else {
        // Image is taller - crop top/bottom
        sourceWidth = uploadedImage.width;
        sourceHeight = sourceWidth / photoAspect;
        sourceX = 0;
        sourceY = (uploadedImage.height - sourceHeight) / 2;
    }
    
    ctx.drawImage(
        uploadedImage,
        sourceX, sourceY, sourceWidth, sourceHeight,  // Source crop
        photo.x, photo.y, photo.width, photo.height   // Destination
    );
    
    // 4. CAPTION (right-aligned, baseline at y=972)
    const caption = captionInput.value.trim();
    if (caption) {
        ctx.fillStyle = '#000000';
        ctx.font = `${TEMPLATE.CAPTION.fontSize}px Arial, sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'alphabetic';
        
        ctx.fillText(
            caption,
            TEMPLATE.CAPTION.rightEdge,
            TEMPLATE.CAPTION.baseline
        );
    }
}

// ═══════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════

colorPicker.addEventListener('input', renderPolaroid);
captionInput.addEventListener('input', renderPolaroid);

// ═══════════════════════════════════════════════════════════
// DOWNLOAD WITH CAPTION-BASED FILENAME
// ═══════════════════════════════════════════════════════════

downloadBtn.addEventListener('click', () => {
    // Generate filename from caption
    let filename = 'polaroid.png';
    const caption = captionInput.value.trim();
    
    if (caption) {
        // Convert caption to filename:
        // "Lyon2, Septembre 2025" → "lyon2_septembre_2025.png"
        filename = caption
            .toLowerCase()                          // lowercase
            .replace(/[^a-z0-9\s]/g, '')           // remove special chars
            .replace(/\s+/g, '_')                  // spaces to underscores
            .replace(/_+/g, '_')                   // collapse multiple underscores
            .replace(/^_|_$/g, '')                 // trim underscores
            + '.png';
        
        // Fallback if caption becomes empty after cleanup
        if (filename === '.png') {
            filename = 'polaroid.png';
        }
    }
    
    // Download with high quality
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 'image/png', 1.0);  // Maximum quality PNG
});

// ═══════════════════════════════════════════════════════════
// INITIALIZE
// ═══════════════════════════════════════════════════════════

setupCanvas();
