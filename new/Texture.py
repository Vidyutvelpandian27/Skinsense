import cv2
import numpy as np
import pywt

# ============================================================
# SKINSENSE - FACIAL TEXTURE ANALYSIS
#
# Algorithms:
# 1. LBP  - Local Binary Pattern
# 2. Gabor Filter
# 3. GLCM - Gray Level Co-occurrence Matrix
# 4. Laplacian Filter
# 5. Wavelet Transform
#
# Output:
# - Texture map
# - High-texture regions marked on face
# - Texture statistics
# - Rule-based texture classification
# ============================================================


# ------------------------------------------------------------
# 1. LOAD IMAGE
# ------------------------------------------------------------

IMAGE_PATH = "face.jpg"

image = cv2.imread(IMAGE_PATH)

if image is None:
    print("ERROR: face.jpg not found!")
    exit()


# ------------------------------------------------------------
# 2. RESIZE IMAGE
# ------------------------------------------------------------

MAX_WIDTH = 800

height, width = image.shape[:2]

if width > MAX_WIDTH:

    scale = MAX_WIDTH / width

    image = cv2.resize(
        image,
        (int(width * scale), int(height * scale))
    )


original = image.copy()


# ------------------------------------------------------------
# 3. FACE DETECTION
# ------------------------------------------------------------

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades +
    "haarcascade_frontalface_default.xml"
)

gray_full = cv2.cvtColor(
    image,
    cv2.COLOR_BGR2GRAY
)

faces = face_cascade.detectMultiScale(
    gray_full,
    scaleFactor=1.1,
    minNeighbors=5,
    minSize=(100, 100)
)


if len(faces) == 0:

    print("No face detected.")
    exit()


# Select largest face

x, y, w, h = max(
    faces,
    key=lambda r: r[2] * r[3]
)


face = image[
    y:y+h,
    x:x+w
].copy()


# ------------------------------------------------------------
# 4. GRAYSCALE
# ------------------------------------------------------------

gray = cv2.cvtColor(
    face,
    cv2.COLOR_BGR2GRAY
)


# ------------------------------------------------------------
# 5. CONTRAST ENHANCEMENT
# ------------------------------------------------------------

clahe = cv2.createCLAHE(
    clipLimit=2.0,
    tileGridSize=(8, 8)
)

enhanced = clahe.apply(gray)


# ============================================================
# ALGORITHM 1: LBP
# ============================================================

def calculate_lbp(image):

    rows, cols = image.shape

    lbp = np.zeros(
        (rows, cols),
        dtype=np.uint8
    )

    for i in range(1, rows - 1):

        for j in range(1, cols - 1):

            center = image[i, j]

            neighbors = [
                image[i-1, j-1],
                image[i-1, j],
                image[i-1, j+1],
                image[i, j+1],
                image[i+1, j+1],
                image[i+1, j],
                image[i+1, j-1],
                image[i, j-1]
            ]

            code = 0

            for k, pixel in enumerate(neighbors):

                if pixel >= center:
                    code |= (1 << k)

            lbp[i, j] = code

    return lbp


lbp = calculate_lbp(enhanced)


# Calculate local LBP variation

lbp_float = lbp.astype(np.float32)

mean_lbp = cv2.blur(
    lbp_float,
    (9, 9)
)

mean_square = cv2.blur(
    lbp_float * lbp_float,
    (9, 9)
)

lbp_variance = (
    mean_square -
    mean_lbp * mean_lbp
)

lbp_variance = np.maximum(
    lbp_variance,
    0
)

lbp_map = cv2.normalize(
    lbp_variance,
    None,
    0,
    255,
    cv2.NORM_MINMAX
).astype(np.uint8)


# ============================================================
# ALGORITHM 2: GABOR FILTER
# ============================================================

gabor_map = np.zeros_like(
    enhanced,
    dtype=np.float32
)


angles = [
    0,
    np.pi / 4,
    np.pi / 2,
    3 * np.pi / 4
]


for theta in angles:

    kernel = cv2.getGaborKernel(
        (21, 21),
        sigma=4,
        theta=theta,
        lambd=10,
        gamma=0.5,
        psi=0,
        ktype=cv2.CV_32F
    )

    filtered = cv2.filter2D(
        enhanced,
        cv2.CV_32F,
        kernel
    )

    filtered = np.abs(filtered)

    gabor_map = np.maximum(
        gabor_map,
        filtered
    )


gabor_map = cv2.normalize(
    gabor_map,
    None,
    0,
    255,
    cv2.NORM_MINMAX
).astype(np.uint8)


# ============================================================
# ALGORITHM 3: GLCM
# ============================================================

# Reduce grayscale levels for GLCM

gray_small = cv2.resize(
    enhanced,
    (150, 150)
)

levels = 16

quantized = (
    gray_small / 256 * levels
).astype(np.uint8)

quantized[
    quantized >= levels
] = levels - 1


# Create GLCM

glcm = np.zeros(
    (levels, levels),
    dtype=np.float64
)


# Horizontal neighboring pixels

for i in range(
    quantized.shape[0]
):

    for j in range(
        quantized.shape[1] - 1
    ):

        a = quantized[i, j]
        b = quantized[i, j + 1]

        glcm[a, b] += 1


# Make symmetric

glcm = glcm + glcm.T


# Normalize

if glcm.sum() > 0:

    glcm = glcm / glcm.sum()


# ------------------------------------------------------------
# GLCM FEATURES
# ------------------------------------------------------------

contrast = 0
energy = 0
homogeneity = 0
correlation = 0


for i in range(levels):

    for j in range(levels):

        probability = glcm[i, j]

        contrast += (
            (i - j) ** 2
        ) * probability

        energy += (
            probability ** 2
        )

        homogeneity += (
            probability /
            (1 + abs(i - j))
        )


# GLCM correlation

mean_i = sum(
    i * glcm[i, j]
    for i in range(levels)
    for j in range(levels)
)

mean_j = sum(
    j * glcm[i, j]
    for i in range(levels)
    for j in range(levels)
)

std_i = np.sqrt(
    sum(
        ((i - mean_i) ** 2) *
        glcm[i, j]
        for i in range(levels)
        for j in range(levels)
    )
)

std_j = np.sqrt(
    sum(
        ((j - mean_j) ** 2) *
        glcm[i, j]
        for i in range(levels)
        for j in range(levels)
    )
)


if std_i > 0 and std_j > 0:

    correlation = sum(
        (
            (i - mean_i) *
            (j - mean_j) *
            glcm[i, j]
        )
        for i in range(levels)
        for j in range(levels)
    ) / (
        std_i * std_j
    )


# ============================================================
# ALGORITHM 4: LAPLACIAN
# ============================================================

laplacian = cv2.Laplacian(
    enhanced,
    cv2.CV_64F
)

laplacian = np.abs(
    laplacian
)

laplacian_map = cv2.normalize(
    laplacian,
    None,
    0,
    255,
    cv2.NORM_MINMAX
).astype(np.uint8)


# ============================================================
# ALGORITHM 5: WAVELET TRANSFORM
# ============================================================

# Convert image to floating point

wavelet_image = enhanced.astype(
    np.float32
) / 255.0


# Perform 2D Haar Wavelet Transform

coefficients = pywt.dwt2(
    wavelet_image,
    "haar"
)


LL, (LH, HL, HH) = coefficients


# High-frequency components contain fine texture

wavelet_texture = (
    np.abs(LH) +
    np.abs(HL) +
    np.abs(HH)
)


wavelet_texture = cv2.normalize(
    wavelet_texture,
    None,
    0,
    255,
    cv2.NORM_MINMAX
).astype(np.uint8)


# Resize to original face size

wavelet_map = cv2.resize(
    wavelet_texture,
    (gray.shape[1], gray.shape[0])
)


# ============================================================
# NORMALIZE ALL FEATURE MAPS
# ============================================================

lbp_norm = cv2.normalize(
    lbp_map,
    None,
    0,
    255,
    cv2.NORM_MINMAX
).astype(np.float32)


gabor_norm = cv2.normalize(
    gabor_map,
    None,
    0,
    255,
    cv2.NORM_MINMAX
).astype(np.float32)


laplacian_norm = cv2.normalize(
    laplacian_map,
    None,
    0,
    255,
    cv2.NORM_MINMAX
).astype(np.float32)


wavelet_norm = cv2.normalize(
    wavelet_map,
    None,
    0,
    255,
    cv2.NORM_MINMAX
).astype(np.float32)


# ============================================================
# COMBINE FIVE TEXTURE ALGORITHMS
# ============================================================

# Weighted combination
#
# LBP      -> 25%
# Gabor    -> 25%
# GLCM     -> global feature
# Laplacian-> 20%
# Wavelet  -> 30%
#

texture_map = (
    0.25 * lbp_norm +
    0.25 * gabor_norm +
    0.20 * laplacian_norm +
    0.30 * wavelet_norm
)


texture_map = cv2.normalize(
    texture_map,
    None,
    0,
    255,
    cv2.NORM_MINMAX
).astype(np.uint8)


# ============================================================
# SMOOTH TEXTURE MAP
# ============================================================

texture_smooth = cv2.GaussianBlur(
    texture_map,
    (7, 7),
    0
)


# ============================================================
# FIND HIGH TEXTURE REGIONS
# ============================================================

# Calculate adaptive threshold

mean_texture = np.mean(
    texture_smooth
)

std_texture = np.std(
    texture_smooth
)


threshold_value = (
    mean_texture +
    0.8 * std_texture
)


threshold_value = np.clip(
    threshold_value,
    80,
    180
)


_, texture_mask = cv2.threshold(
    texture_smooth,
    threshold_value,
    255,
    cv2.THRESH_BINARY
)


# ============================================================
# MORPHOLOGICAL CLEANING
# ============================================================

kernel = cv2.getStructuringElement(
    cv2.MORPH_ELLIPSE,
    (5, 5)
)


texture_mask = cv2.morphologyEx(
    texture_mask,
    cv2.MORPH_OPEN,
    kernel
)

texture_mask = cv2.morphologyEx(
    texture_mask,
    cv2.MORPH_CLOSE,
    kernel
)


# ============================================================
# CONNECTED COMPONENT ANALYSIS
# ============================================================

num_labels, labels, stats, centroids = \
    cv2.connectedComponentsWithStats(
        texture_mask,
        connectivity=8
    )


final_mask = np.zeros_like(
    texture_mask
)

regions = []


for i in range(1, num_labels):

    area = stats[
        i,
        cv2.CC_STAT_AREA
    ]

    width_component = stats[
        i,
        cv2.CC_STAT_WIDTH
    ]

    height_component = stats[
        i,
        cv2.CC_STAT_HEIGHT
    ]


    # Remove tiny regions

    if area < 80:
        continue


    # Remove extremely large regions

    if area > 15000:
        continue


    final_mask[
        labels == i
    ] = 255


    cx, cy = centroids[i]


    regions.append(
        (
            int(cx),
            int(cy),
            width_component,
            height_component,
            area
        )
    )


# ============================================================
# DRAW TEXTURE REGIONS ON FACE
# ============================================================

result = face.copy()


contours, _ = cv2.findContours(
    final_mask,
    cv2.RETR_EXTERNAL,
    cv2.CHAIN_APPROX_SIMPLE
)


for contour in contours:

    area = cv2.contourArea(
        contour
    )

    if area < 80:
        continue


    # Bounding rectangle

    rx, ry, rw, rh = cv2.boundingRect(
        contour
    )


    # Minimum enclosing circle

    (cx, cy), radius = \
        cv2.minEnclosingCircle(
            contour
        )


    center = (
        int(cx),
        int(cy)
    )


    radius = max(
        int(radius),
        5
    )


    # Draw circle

    cv2.circle(
        result,
        center,
        radius,
        (0, 0, 255),
        2
    )


# ============================================================
# TEXTURE SCORE
# ============================================================

high_texture_pixels = cv2.countNonZero(
    final_mask
)

total_pixels = (
    final_mask.shape[0] *
    final_mask.shape[1]
)


texture_percentage = (
    high_texture_pixels /
    total_pixels
) * 100


# ============================================================
# RULE-BASED CLASSIFICATION
# ============================================================

if texture_percentage < 5:

    texture_level = "SMOOTH"

elif texture_percentage < 12:

    texture_level = "NORMAL"

elif texture_percentage < 20:

    texture_level = "ROUGH"

else:

    texture_level = "HIGH TEXTURE"


# ============================================================
# ADD RESULTS TO IMAGE
# ============================================================

cv2.putText(
    result,
    "Texture: " + texture_level,
    (15, 30),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.7,
    (0, 255, 0),
    2
)


cv2.putText(
    result,
    "Texture Area: {:.2f}%".format(
        texture_percentage
    ),
    (15, 60),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.65,
    (0, 255, 0),
    2
)


# ============================================================
# PUT FACE RESULT BACK INTO IMAGE
# ============================================================

output = image.copy()


output[
    y:y+h,
    x:x+w
] = result


# Face boundary

cv2.rectangle(
    output,
    (x, y),
    (x+w, y+h),
    (255, 255, 0),
    2
)


# ============================================================
# PRINT ANALYSIS
# ============================================================

print("\n============================================")
print("        SKINSENSE TEXTURE ANALYSIS")
print("============================================")

print(
    "LBP Texture       : Calculated"
)

print(
    "Gabor Texture     : Calculated"
)

print(
    "GLCM Contrast     :",
    round(contrast, 4)
)

print(
    "GLCM Energy       :",
    round(energy, 4)
)

print(
    "GLCM Homogeneity  :",
    round(homogeneity, 4)
)

print(
    "GLCM Correlation  :",
    round(correlation, 4)
)

print(
    "Laplacian         : Calculated"
)

print(
    "Wavelet           : Calculated"
)

print(
    "High Texture Area :",
    round(texture_percentage, 2),
    "%"
)

print(
    "Texture Level     :",
    texture_level
)

print("============================================")


# ============================================================
# SAVE OUTPUT FILES
# ============================================================

cv2.imwrite(
    "texture_result.jpg",
    output
)

cv2.imwrite(
    "texture_map.jpg",
    texture_map
)

cv2.imwrite(
    "texture_mask.jpg",
    final_mask
)


# ============================================================
# DISPLAY
# ============================================================

cv2.imshow(
    "Original Face",
    image
)

cv2.imshow(
    "LBP Texture",
    lbp_map
)

cv2.imshow(
    "Gabor Texture",
    gabor_map
)

cv2.imshow(
    "Laplacian",
    laplacian_map
)

cv2.imshow(
    "Wavelet Texture",
    wavelet_map
)

cv2.imshow(
    "Combined Texture Map",
    texture_map
)

cv2.imshow(
    "High Texture Mask",
    final_mask
)

cv2.imshow(
    "SkinSense Texture Result",
    output
)


cv2.waitKey(0)

cv2.destroyAllWindows()