import cv2
import numpy as np
import os

# ============================================================
# SKINSENSE - WRINKLE DETECTION
# Traditional Digital Image Processing
#
# Algorithms:
# 1. Black-hat Morphological Transform
# 2. Gabor Filter
# 3. Canny Edge Detection
# 4. Laplacian Filter
# 5. Local Binary Pattern (LBP)
#
# Output:
# - Original image
# - Detected wrinkle lines marked on face
# - Wrinkle count
# - Wrinkle density
# ============================================================


# ------------------------------------------------------------
# 1. LOAD IMAGE
# ------------------------------------------------------------

IMAGE_PATH = "face.jpg"

image = cv2.imread(IMAGE_PATH)

if image is None:
    print("ERROR: face.jpg not found!")
    exit()

original = image.copy()


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

face = image[y:y+h, x:x+w].copy()


# ------------------------------------------------------------
# 4. GRAYSCALE
# ------------------------------------------------------------

gray = cv2.cvtColor(
    face,
    cv2.COLOR_BGR2GRAY
)


# ------------------------------------------------------------
# 5. GAUSSIAN FILTER
# ------------------------------------------------------------

# Reduce camera noise before wrinkle detection

blur = cv2.GaussianBlur(
    gray,
    (5, 5),
    0
)


# ------------------------------------------------------------
# 6. CLAHE
# ------------------------------------------------------------

# Improves local contrast

clahe = cv2.createCLAHE(
    clipLimit=2.0,
    tileGridSize=(8, 8)
)

enhanced = clahe.apply(blur)


# ============================================================
# ALGORITHM 1
# BLACK-HAT MORPHOLOGICAL TRANSFORM
# ============================================================

kernel_blackhat = cv2.getStructuringElement(
    cv2.MORPH_ELLIPSE,
    (15, 15)
)

blackhat = cv2.morphologyEx(
    enhanced,
    cv2.MORPH_BLACKHAT,
    kernel_blackhat
)


# Threshold black-hat response

_, blackhat_mask = cv2.threshold(
    blackhat,
    12,
    255,
    cv2.THRESH_BINARY
)


# ============================================================
# ALGORITHM 2
# GABOR FILTER
# ============================================================

gabor_response = np.zeros_like(
    enhanced,
    dtype=np.float32
)

# Multiple orientations
angles = [
    0,
    np.pi / 4,
    np.pi / 2,
    3 * np.pi / 4
]

for theta in angles:

    kernel_gabor = cv2.getGaborKernel(
        (21, 21),
        sigma=4.0,
        theta=theta,
        lambd=10.0,
        gamma=0.5,
        psi=0,
        ktype=cv2.CV_32F
    )

    filtered = cv2.filter2D(
        enhanced,
        cv2.CV_32F,
        kernel_gabor
    )

    filtered = np.abs(filtered)

    gabor_response = np.maximum(
        gabor_response,
        filtered
    )


# Normalize Gabor response

gabor_response = cv2.normalize(
    gabor_response,
    None,
    0,
    255,
    cv2.NORM_MINMAX
).astype(np.uint8)


# Threshold

_, gabor_mask = cv2.threshold(
    gabor_response,
    150,
    255,
    cv2.THRESH_BINARY
)


# ============================================================
# ALGORITHM 3
# CANNY EDGE DETECTION
# ============================================================

canny = cv2.Canny(
    enhanced,
    40,
    100
)


# Dilate slightly so thin edges become visible

kernel_edge = cv2.getStructuringElement(
    cv2.MORPH_ELLIPSE,
    (3, 3)
)

canny_mask = cv2.dilate(
    canny,
    kernel_edge,
    iterations=1
)


# ============================================================
# ALGORITHM 4
# LAPLACIAN FILTER
# ============================================================

laplacian = cv2.Laplacian(
    enhanced,
    cv2.CV_64F
)

laplacian = np.absolute(
    laplacian
)

laplacian = cv2.normalize(
    laplacian,
    None,
    0,
    255,
    cv2.NORM_MINMAX
).astype(np.uint8)


# Threshold

_, laplacian_mask = cv2.threshold(
    laplacian,
    40,
    255,
    cv2.THRESH_BINARY
)


# ============================================================
# ALGORITHM 5
# LOCAL BINARY PATTERN (LBP)
# ============================================================

def calculate_lbp(image):

    lbp = np.zeros_like(
        image,
        dtype=np.uint8
    )

    rows, cols = image.shape

    for i in range(1, rows - 1):

        for j in range(1, cols - 1):

            center = image[i, j]

            code = 0

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

            for k, pixel in enumerate(neighbors):

                if pixel >= center:
                    code |= (1 << k)

            lbp[i, j] = code

    return lbp


lbp = calculate_lbp(enhanced)


# ------------------------------------------------------------
# LBP TEXTURE MASK
# ------------------------------------------------------------

# Calculate local variance of LBP

lbp_float = lbp.astype(np.float32)

mean_lbp = cv2.blur(
    lbp_float,
    (7, 7)
)

mean_sq_lbp = cv2.blur(
    lbp_float * lbp_float,
    (7, 7)
)

variance_lbp = (
    mean_sq_lbp -
    mean_lbp * mean_lbp
)


variance_lbp = np.maximum(
    variance_lbp,
    0
)

variance_lbp = cv2.normalize(
    variance_lbp,
    None,
    0,
    255,
    cv2.NORM_MINMAX
).astype(np.uint8)


_, lbp_mask = cv2.threshold(
    variance_lbp,
    35,
    255,
    cv2.THRESH_BINARY
)


# ============================================================
# COMBINE ALL FIVE ALGORITHMS
# ============================================================

# Instead of requiring all five to agree,
# use a voting system.
#
# Each algorithm contributes one vote.
#
# 3 or more algorithms detecting the same region
# = wrinkle candidate.


score = np.zeros_like(
    gray,
    dtype=np.uint8
)


score += (blackhat_mask > 0).astype(np.uint8)

score += (gabor_mask > 0).astype(np.uint8)

score += (canny_mask > 0).astype(np.uint8)

score += (laplacian_mask > 0).astype(np.uint8)

score += (lbp_mask > 0).astype(np.uint8)


# Require at least 3 algorithms to agree

combined_mask = np.where(
    score >= 3,
    255,
    0
).astype(np.uint8)


# ============================================================
# MORPHOLOGICAL CLEANING
# ============================================================

kernel_clean = cv2.getStructuringElement(
    cv2.MORPH_ELLIPSE,
    (3, 3)
)


combined_mask = cv2.morphologyEx(
    combined_mask,
    cv2.MORPH_OPEN,
    kernel_clean
)

combined_mask = cv2.morphologyEx(
    combined_mask,
    cv2.MORPH_CLOSE,
    kernel_clean
)


# ============================================================
# REMOVE VERY SMALL REGIONS
# ============================================================

num_labels, labels, stats, centroids = \
    cv2.connectedComponentsWithStats(
        combined_mask,
        connectivity=8
    )


final_mask = np.zeros_like(
    combined_mask
)

wrinkle_count = 0

total_wrinkle_area = 0


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


    # Ignore tiny noise

    if area < 20:
        continue


    # Ignore extremely large regions

    if area > 5000:
        continue


    # Wrinkles generally have elongated structure

    aspect_ratio = (
        max(width_component, height_component) /
        max(min(width_component, height_component), 1)
    )


    if aspect_ratio >= 1.5:

        final_mask[
            labels == i
        ] = 255

        wrinkle_count += 1

        total_wrinkle_area += area


# ============================================================
# DRAW WRINKLE MARKINGS ON ORIGINAL FACE
# ============================================================

result = face.copy()


# Find final contours

contours, _ = cv2.findContours(
    final_mask,
    cv2.RETR_EXTERNAL,
    cv2.CHAIN_APPROX_SIMPLE
)


for contour in contours:

    area = cv2.contourArea(
        contour
    )

    if area < 20:
        continue


    # Get minimum enclosing ellipse/circle

    (cx, cy), radius = cv2.minEnclosingCircle(
        contour
    )

    center = (
        int(cx),
        int(cy)
    )

    radius = max(
        int(radius),
        4
    )


    # Draw circular marking

    cv2.circle(
        result,
        center,
        radius,
        (0, 0, 255),
        2
    )


# ============================================================
# WRINKLE DENSITY
# ============================================================

face_area = (
    face.shape[0] *
    face.shape[1]
)


wrinkle_density = (
    total_wrinkle_area /
    face_area
) * 100


# ============================================================
# RULE-BASED WRINKLE SEVERITY
# ============================================================

if wrinkle_density < 0.5:

    severity = "LOW"

elif wrinkle_density < 1.5:

    severity = "MILD"

elif wrinkle_density < 3:

    severity = "MODERATE"

else:

    severity = "HIGH"


# ============================================================
# DISPLAY INFORMATION
# ============================================================

cv2.putText(
    result,
    "Wrinkles: " + str(wrinkle_count),
    (15, 30),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.7,
    (0, 255, 0),
    2
)

cv2.putText(
    result,
    "Density: {:.2f}%".format(
        wrinkle_density
    ),
    (15, 60),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.7,
    (0, 255, 0),
    2
)

cv2.putText(
    result,
    "Level: " + severity,
    (15, 90),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.7,
    (0, 255, 0),
    2
)


# ============================================================
# PUT FACE RESULT BACK INTO FULL IMAGE
# ============================================================

output = image.copy()

output[
    y:y+h,
    x:x+w
] = result


# Draw face boundary

cv2.rectangle(
    output,
    (x, y),
    (x+w, y+h),
    (255, 255, 0),
    2
)


# ============================================================
# SAVE RESULTS
# ============================================================

cv2.imwrite(
    "wrinkle_result.jpg",
    output
)

cv2.imwrite(
    "wrinkle_mask.jpg",
    final_mask
)


# ============================================================
# PRINT RESULTS
# ============================================================

print("\n======================================")
print("        SKINSENSE WRINKLE ANALYSIS")
print("======================================")

print(
    "Wrinkle Count    :",
    wrinkle_count
)

print(
    "Wrinkle Area     :",
    total_wrinkle_area
)

print(
    "Wrinkle Density  :",
    round(wrinkle_density, 2),
    "%"
)

print(
    "Wrinkle Level    :",
    severity
)

print("======================================")


# ============================================================
# DISPLAY
# ============================================================

cv2.imshow(
    "Original Image",
    image
)

cv2.imshow(
    "Black Hat",
    blackhat_mask
)

cv2.imshow(
    "Gabor",
    gabor_mask
)

cv2.imshow(
    "Canny",
    canny_mask
)

cv2.imshow(
    "Laplacian",
    laplacian_mask
)

cv2.imshow(
    "LBP",
    lbp_mask
)

cv2.imshow(
    "Final Wrinkle Mask",
    final_mask
)

cv2.imshow(
    "Wrinkle Detection Result",
    output
)


cv2.waitKey(0)

cv2.destroyAllWindows()