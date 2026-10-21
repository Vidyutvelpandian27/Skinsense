import cv2
import numpy as np
import math

# ============================================================
# DARK SPOT DETECTION USING 5 DIP ALGORITHMS
# 1. CIELAB
# 2. HSV
# 3. YCbCr
# 4. Black-hat Morphological Transform
# 5. Connected Component Analysis
# ============================================================

IMAGE_PATH = "face.jpg"
OUTPUT_PATH = "dark_spot_result.jpg"


# ------------------------------------------------------------
# 1. LOAD IMAGE
# ------------------------------------------------------------

image = cv2.imread(IMAGE_PATH)

if image is None:
    print("Error: Could not load image.")
    print("Make sure face.jpg is in the same folder.")
    exit()

# Resize if image is very large
max_width = 900

if image.shape[1] > max_width:
    scale = max_width / image.shape[1]
    image = cv2.resize(
        image,
        None,
        fx=scale,
        fy=scale,
        interpolation=cv2.INTER_AREA
    )

original = image.copy()

# ------------------------------------------------------------
# 2. FACE DETECTION
# ------------------------------------------------------------

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

faces = face_cascade.detectMultiScale(
    gray,
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
    key=lambda rect: rect[2] * rect[3]
)

face = image[y:y+h, x:x+w]

# ------------------------------------------------------------
# 3. CREATE INNER FACE REGION
# ------------------------------------------------------------
# Avoid hair, ears and face boundary

face_mask = np.zeros((h, w), dtype=np.uint8)

center = (w // 2, h // 2)

cv2.ellipse(
    face_mask,
    center,
    (int(w * 0.40), int(h * 0.45)),
    0,
    0,
    360,
    255,
    -1
)

# ------------------------------------------------------------
# 4. REMOVE EXTREME SHADOWS AND HIGHLIGHTS
# ------------------------------------------------------------

hsv = cv2.cvtColor(face, cv2.COLOR_BGR2HSV)

H, S, V = cv2.split(hsv)

# Remove extremely bright regions
valid_brightness = ((V > 35) & (V < 245)).astype(np.uint8) * 255

# ------------------------------------------------------------
# 5. ALGORITHM 1 — CIELAB
# ------------------------------------------------------------

lab = cv2.cvtColor(face, cv2.COLOR_BGR2LAB)

L, A, B = cv2.split(lab)

# OpenCV L ranges from 0-255
# Lower L = darker

# Dark region threshold
lab_dark = cv2.inRange(
    L,
    0,
    145
)

# ------------------------------------------------------------
# 6. ALGORITHM 2 — HSV
# ------------------------------------------------------------

# Dark regions have low V.
# We use saturation to avoid detecting gray shadows/noise.

hsv_dark = cv2.inRange(
    hsv,
    np.array([0, 20, 0]),
    np.array([179, 255, 150])
)

# ------------------------------------------------------------
# 7. ALGORITHM 3 — YCbCr
# ------------------------------------------------------------

ycrcb = cv2.cvtColor(face, cv2.COLOR_BGR2YCrCb)

Y, Cr, Cb = cv2.split(ycrcb)

# Y represents luminance.
# Lower Y = darker.

ycrcb_dark = cv2.inRange(
    Y,
    0,
    145
)

# ------------------------------------------------------------
# 8. ALGORITHM 4 — BLACK-HAT TRANSFORM
# ------------------------------------------------------------

gray_face = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)

# Large kernel detects dark regions surrounded by
# relatively brighter skin.

kernel_blackhat = cv2.getStructuringElement(
    cv2.MORPH_ELLIPSE,
    (21, 21)
)

blackhat = cv2.morphologyEx(
    gray_face,
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

# ------------------------------------------------------------
# 9. COMBINE THE FOUR DETECTION METHODS
# ------------------------------------------------------------

# Each algorithm votes for a pixel.

lab_vote = (lab_dark > 0).astype(np.uint8)
hsv_vote = (hsv_dark > 0).astype(np.uint8)
ycrcb_vote = (ycrcb_dark > 0).astype(np.uint8)
blackhat_vote = (blackhat_mask > 0).astype(np.uint8)

votes = (
    lab_vote +
    hsv_vote +
    ycrcb_vote +
    blackhat_vote
)

# Require at least 3 algorithms to agree

combined = np.where(
    votes >= 3,
    255,
    0
).astype(np.uint8)

# ------------------------------------------------------------
# 10. APPLY FACE MASK
# ------------------------------------------------------------

combined = cv2.bitwise_and(
    combined,
    face_mask
)

combined = cv2.bitwise_and(
    combined,
    valid_brightness
)

# ------------------------------------------------------------
# 11. MORPHOLOGICAL FILTERING
# ------------------------------------------------------------

small_kernel = cv2.getStructuringElement(
    cv2.MORPH_ELLIPSE,
    (3, 3)
)

combined = cv2.morphologyEx(
    combined,
    cv2.MORPH_OPEN,
    small_kernel
)

combined = cv2.morphologyEx(
    combined,
    cv2.MORPH_CLOSE,
    small_kernel
)

# ------------------------------------------------------------
# 12. ALGORITHM 5 — CONNECTED COMPONENT ANALYSIS
# ------------------------------------------------------------

num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(
    combined,
    connectivity=8
)

result = original.copy()

dark_spot_count = 0

dark_spot_values = []

# ------------------------------------------------------------
# 13. ANALYZE EACH DETECTED REGION
# ------------------------------------------------------------

for i in range(1, num_labels):

    area = stats[i, cv2.CC_STAT_AREA]

    x1 = stats[i, cv2.CC_STAT_LEFT]
    y1 = stats[i, cv2.CC_STAT_TOP]
    width = stats[i, cv2.CC_STAT_WIDTH]
    height = stats[i, cv2.CC_STAT_HEIGHT]

    # Ignore very small noise
    if area < 30:
        continue

    # Ignore extremely large regions
    if area > 5000:
        continue

    # Ignore very thin regions
    aspect_ratio = width / float(height)

    if aspect_ratio > 5 or aspect_ratio < 0.2:
        continue

    # --------------------------------------------------------
    # Extract region pixels
    # --------------------------------------------------------

    region_mask = labels == i

    region_L = L[region_mask]
    region_B = B[region_mask]
    region_Y = Y[region_mask]

    if len(region_L) == 0:
        continue

    # --------------------------------------------------------
    # Calculate darkness
    # --------------------------------------------------------

    mean_L = np.mean(region_L)

    mean_Y = np.mean(region_Y)

    # Convert OpenCV L to approximate L*
    L_star = mean_L * 100 / 255

    # Darkness score
    #
    # 0   = very light
    # 100 = very dark

    darkness = 100 - L_star

    # --------------------------------------------------------
    # Calculate local contrast
    # --------------------------------------------------------

    # Surrounding skin region

    padding = 8

    sx1 = max(0, x1 - padding)
    sy1 = max(0, y1 - padding)

    sx2 = min(w, x1 + width + padding)
    sy2 = min(h, y1 + height + padding)

    surrounding = L[sy1:sy2, sx1:sx2]

    surrounding_mean = np.mean(surrounding)

    contrast = surrounding_mean - mean_L

    # --------------------------------------------------------
    # Accept only sufficiently dark regions
    # --------------------------------------------------------

    if darkness < 25:
        continue

    if contrast < 8:
        continue

    # --------------------------------------------------------
    # Determine severity
    # --------------------------------------------------------

    if darkness >= 60:
        severity = "HIGH"

    elif darkness >= 45:
        severity = "MODERATE"

    elif darkness >= 30:
        severity = "MILD"

    else:
        severity = "LOW"

    dark_spot_count += 1

    dark_spot_values.append(darkness)

    # --------------------------------------------------------
    # FIND CENTER
    # --------------------------------------------------------

    cx = int(centroids[i][0])
    cy = int(centroids[i][1])

    # --------------------------------------------------------
    # DRAW CIRCLE
    # --------------------------------------------------------

    radius = max(
        int(max(width, height) / 2),
        8
    )

    cv2.circle(
        result,
        (x + cx, y + cy),
        radius,
        (0, 0, 255),
        2
    )

    # --------------------------------------------------------
    # DRAW CENTER POINT
    # --------------------------------------------------------

    cv2.circle(
        result,
        (x + cx, y + cy),
        3,
        (0, 255, 255),
        -1
    )

    # --------------------------------------------------------
    # LABEL
    # --------------------------------------------------------

    label = f"{darkness:.1f}% {severity}"

    text_x = x + x1
    text_y = y + max(y1 - 8, 15)

    # Background rectangle for text

    (tw, th), baseline = cv2.getTextSize(
        label,
        cv2.FONT_HERSHEY_SIMPLEX,
        0.45,
        1
    )

    cv2.rectangle(
        result,
        (text_x, text_y - th - baseline),
        (text_x + tw + 4, text_y + 2),
        (0, 0, 0),
        -1
    )

    cv2.putText(
        result,
        label,
        (text_x + 2, text_y),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.45,
        (255, 255, 255),
        1,
        cv2.LINE_AA
    )

# ------------------------------------------------------------
# 14. DRAW FACE BOX
# ------------------------------------------------------------

cv2.rectangle(
    result,
    (x, y),
    (x + w, y + h),
    (0, 255, 0),
    2
)

# ------------------------------------------------------------
# 15. OVERALL DARK SPOT SCORE
# ------------------------------------------------------------

if dark_spot_count == 0:

    overall_score = 0
    overall_status = "NO DARK SPOTS"

else:

    overall_score = np.mean(dark_spot_values)

    if overall_score >= 60:
        overall_status = "HIGH"

    elif overall_score >= 45:
        overall_status = "MODERATE"

    elif overall_score >= 30:
        overall_status = "MILD"

    else:
        overall_status = "LOW"

# ------------------------------------------------------------
# 16. DISPLAY OVERALL RESULT
# ------------------------------------------------------------

cv2.rectangle(
    result,
    (10, 10),
    (340, 100),
    (0, 0, 0),
    -1
)

cv2.putText(
    result,
    f"Dark Spots: {dark_spot_count}",
    (20, 40),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.65,
    (255, 255, 255),
    2
)

cv2.putText(
    result,
    f"Darkness: {overall_score:.1f}%",
    (20, 65),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.55,
    (255, 255, 255),
    1
)

cv2.putText(
    result,
    f"Severity: {overall_status}",
    (20, 88),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.55,
    (255, 255, 255),
    1
)

# ------------------------------------------------------------
# 17. SAVE OUTPUT
# ------------------------------------------------------------

cv2.imwrite(
    OUTPUT_PATH,
    result
)

cv2.imwrite(
    "dark_spot_mask.jpg",
    combined
)

cv2.imwrite(
    "dark_spot_blackhat.jpg",
    blackhat
)

# ------------------------------------------------------------
# 18. PRINT RESULTS
# ------------------------------------------------------------

print("\n==========================================")
print("       DARK SPOT ANALYSIS")
print("==========================================")

print(f"Dark Spots Detected : {dark_spot_count}")

if dark_spot_count > 0:
    print(f"Average Darkness    : {overall_score:.2f}%")
    print(f"Overall Severity    : {overall_status}")
else:
    print("No significant dark spots detected.")

print("\nAlgorithms Used:")
print("1. CIELAB")
print("2. HSV")
print("3. YCbCr")
print("4. Black-hat Transform")
print("5. Connected Component Analysis")

print("\nOutput files:")
print("dark_spot_result.jpg")
print("dark_spot_mask.jpg")
print("dark_spot_blackhat.jpg")

print("==========================================")

# ------------------------------------------------------------
# 19. SHOW RESULT
# ------------------------------------------------------------

cv2.imshow(
    "Dark Spot Detection Result",
    result
)

cv2.waitKey(0)
cv2.destroyAllWindows()