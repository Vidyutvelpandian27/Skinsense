import cv2
import numpy as np

# ============================================================
# FACIAL REDNESS DETECTION
#
# Five techniques:
# 1. CIELAB a* channel
# 2. HSV color segmentation
# 3. Excess Red (ExR)
# 4. Gaussian Blur + Morphological Filtering
# 5. Connected Component + Area/Shape Analysis
#
# Output:
# - Redness regions marked on face
# - Redness percentage
# - Severity
# ============================================================


IMAGE_PATH = "face.jpg"
OUTPUT_PATH = "redness_result.jpg"


# ============================================================
# 1. LOAD IMAGE
# ============================================================

image = cv2.imread(IMAGE_PATH)

if image is None:
    print("ERROR: face.jpg not found!")
    exit()

# Resize large images
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


# ============================================================
# 2. FACE DETECTION
# ============================================================

gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades +
    "haarcascade_frontalface_default.xml"
)

faces = face_cascade.detectMultiScale(
    gray,
    scaleFactor=1.1,
    minNeighbors=5,
    minSize=(120, 120)
)

if len(faces) == 0:
    print("No face detected.")
    exit()


# Select largest face
x, y, w, h = max(
    faces,
    key=lambda r: r[2] * r[3]
)

face = image[y:y+h, x:x+w]

result = original.copy()


# ============================================================
# 3. CREATE SKIN REGION
# ============================================================

face_hsv = cv2.cvtColor(face, cv2.COLOR_BGR2HSV)

H, S, V = cv2.split(face_hsv)


# Basic skin-color mask
skin_mask = cv2.inRange(
    face_hsv,
    np.array([0, 20, 40]),
    np.array([179, 255, 245])
)


# Elliptical inner face region
face_region = np.zeros((h, w), dtype=np.uint8)

cv2.ellipse(
    face_region,
    (w // 2, h // 2),
    (int(w * 0.40), int(h * 0.45)),
    0,
    0,
    360,
    255,
    -1
)


skin_mask = cv2.bitwise_and(
    skin_mask,
    face_region
)


# Remove noise
kernel = cv2.getStructuringElement(
    cv2.MORPH_ELLIPSE,
    (7, 7)
)

skin_mask = cv2.morphologyEx(
    skin_mask,
    cv2.MORPH_OPEN,
    kernel
)

skin_mask = cv2.morphologyEx(
    skin_mask,
    cv2.MORPH_CLOSE,
    kernel
)


# ============================================================
# 4. ALGORITHM 1 — CIELAB a*
# ============================================================

lab = cv2.cvtColor(
    face,
    cv2.COLOR_BGR2LAB
)

L, A, B = cv2.split(lab)

# Higher A = more reddish
#
# OpenCV A:
# 128 approximately neutral
# >128 increasingly red

lab_red = cv2.inRange(
    A,
    140,
    255
)


# ============================================================
# 5. ALGORITHM 2 — HSV
# ============================================================

# OpenCV Hue:
# Red is around 0 and 179

hsv_red1 = cv2.inRange(
    face_hsv,
    np.array([0, 35, 50]),
    np.array([12, 255, 255])
)

hsv_red2 = cv2.inRange(
    face_hsv,
    np.array([165, 35, 50]),
    np.array([179, 255, 255])
)

hsv_red = cv2.bitwise_or(
    hsv_red1,
    hsv_red2
)


# ============================================================
# 6. ALGORITHM 3 — EXCESS RED
# ============================================================

# Convert BGR → RGB
rgb = cv2.cvtColor(
    face,
    cv2.COLOR_BGR2RGB
)

R = rgb[:, :, 0].astype(np.float32)
G = rgb[:, :, 1].astype(np.float32)
B_rgb = rgb[:, :, 2].astype(np.float32)


# ExR = 2R - G - B

ExR = (
    2 * R
    - G
    - B_rgb
)

# Normalize
ExR_norm = cv2.normalize(
    ExR,
    None,
    0,
    255,
    cv2.NORM_MINMAX
).astype(np.uint8)


_, exr_red = cv2.threshold(
    ExR_norm,
    145,
    255,
    cv2.THRESH_BINARY
)


# ============================================================
# 7. COMBINE THREE REDNESS DETECTORS
# ============================================================

lab_vote = (lab_red > 0).astype(np.uint8)
hsv_vote = (hsv_red > 0).astype(np.uint8)
exr_vote = (exr_red > 0).astype(np.uint8)

red_votes = (
    lab_vote +
    hsv_vote +
    exr_vote
)


# At least TWO algorithms must agree

red_candidate = np.where(
    red_votes >= 2,
    255,
    0
).astype(np.uint8)


# Apply skin mask

red_candidate = cv2.bitwise_and(
    red_candidate,
    skin_mask
)


# ============================================================
# 8. ALGORITHM 4 — GAUSSIAN BLUR
# ============================================================

# This is important for distinguishing:
#
# Small isolated pimple → disappears/reduces
# Large diffuse redness → remains

blurred_redness = cv2.GaussianBlur(
    red_candidate,
    (21, 21),
    0
)


_, diffuse_redness = cv2.threshold(
    blurred_redness,
    35,
    255,
    cv2.THRESH_BINARY
)


# ============================================================
# 9. MORPHOLOGICAL FILTERING
# ============================================================

large_kernel = cv2.getStructuringElement(
    cv2.MORPH_ELLIPSE,
    (15, 15)
)

diffuse_redness = cv2.morphologyEx(
    diffuse_redness,
    cv2.MORPH_CLOSE,
    large_kernel
)

diffuse_redness = cv2.morphologyEx(
    diffuse_redness,
    cv2.MORPH_OPEN,
    large_kernel
)


diffuse_redness = cv2.bitwise_and(
    diffuse_redness,
    skin_mask
)


# ============================================================
# 10. ALGORITHM 5 — CONNECTED COMPONENT ANALYSIS
# ============================================================

num_labels, labels, stats, centroids = \
    cv2.connectedComponentsWithStats(
        diffuse_redness,
        connectivity=8
    )


# ============================================================
# 11. ANALYZE REDNESS REGIONS
# ============================================================

total_red_area = 0

redness_regions = []

for i in range(1, num_labels):

    area = stats[i, cv2.CC_STAT_AREA]

    x1 = stats[i, cv2.CC_STAT_LEFT]
    y1 = stats[i, cv2.CC_STAT_TOP]

    width = stats[i, cv2.CC_STAT_WIDTH]
    height = stats[i, cv2.CC_STAT_HEIGHT]


    # --------------------------------------------------------
    # REMOVE SMALL PIMPLE-SIZED REGIONS
    # --------------------------------------------------------

    if area < 800:
        continue


    # --------------------------------------------------------
    # REMOVE VERY LARGE FALSE REGIONS
    # --------------------------------------------------------

    if area > 30000:
        continue


    # --------------------------------------------------------
    # SHAPE ANALYSIS
    # --------------------------------------------------------

    aspect_ratio = width / float(height)

    if aspect_ratio > 6 or aspect_ratio < 0.16:
        continue


    # --------------------------------------------------------
    # CHECK REDNESS INTENSITY
    # --------------------------------------------------------

    region_mask = labels == i

    region_A = A[region_mask]

    if len(region_A) == 0:
        continue


    mean_A = np.mean(region_A)

    # Convert A channel to approximate redness level

    redness_value = mean_A - 128


    if redness_value < 10:
        continue


    # --------------------------------------------------------
    # ACCEPT REGION
    # --------------------------------------------------------

    total_red_area += area

    redness_regions.append(
        (
            i,
            area,
            x1,
            y1,
            width,
            height,
            redness_value
        )
    )


# ============================================================
# 12. CALCULATE SKIN AREA
# ============================================================

skin_area = cv2.countNonZero(
    skin_mask
)


if skin_area > 0:

    redness_percentage = (
        total_red_area /
        skin_area
    ) * 100

else:

    redness_percentage = 0


# ============================================================
# 13. CLASSIFY REDNESS
# ============================================================

if redness_percentage < 5:

    severity = "NORMAL"

elif redness_percentage < 12:

    severity = "MILD REDNESS"

elif redness_percentage < 20:

    severity = "MODERATE REDNESS"

else:

    severity = "HIGH REDNESS"


# ============================================================
# 14. MARK REDNESS REGIONS ON ORIGINAL IMAGE
# ============================================================

for (
    i,
    area,
    x1,
    y1,
    width,
    height,
    redness_value
) in redness_regions:

    # Convert coordinates to original image

    start_x = x + x1
    start_y = y + y1

    end_x = x + x1 + width
    end_y = y + y1 + height


    # --------------------------------------------------------
    # DRAW CONTOUR
    # --------------------------------------------------------

    component_mask = (
        labels == i
    ).astype(np.uint8) * 255


    contours, _ = cv2.findContours(
        component_mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )


    for contour in contours:

        contour[:, :, 0] += x
        contour[:, :, 1] += y

        cv2.drawContours(
            result,
            [contour],
            -1,
            (0, 0, 255),
            2
        )


    # --------------------------------------------------------
    # FIND CENTER
    # --------------------------------------------------------

    cx = x + int(
        centroids[i][0]
    )

    cy = y + int(
        centroids[i][1]
    )


    # --------------------------------------------------------
    # DRAW CENTER
    # --------------------------------------------------------

    cv2.circle(
        result,
        (cx, cy),
        5,
        (0, 255, 255),
        -1
    )


    # --------------------------------------------------------
    # LABEL
    # --------------------------------------------------------

    label = f"Redness: {redness_value:.1f}"

    cv2.putText(
        result,
        label,
        (start_x, max(start_y - 8, 20)),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (0, 0, 255),
        2,
        cv2.LINE_AA
    )


# ============================================================
# 15. DRAW FACE BOX
# ============================================================

cv2.rectangle(
    result,
    (x, y),
    (x + w, y + h),
    (0, 255, 0),
    2
)


# ============================================================
# 16. DISPLAY OVERALL RESULT
# ============================================================

cv2.rectangle(
    result,
    (10, 10),
    (370, 115),
    (0, 0, 0),
    -1
)


cv2.putText(
    result,
    f"Redness Regions: {len(redness_regions)}",
    (20, 38),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.6,
    (255, 255, 255),
    2
)


cv2.putText(
    result,
    f"Redness Area: {redness_percentage:.1f}%",
    (20, 68),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.6,
    (255, 255, 255),
    2
)


cv2.putText(
    result,
    f"Status: {severity}",
    (20, 98),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.6,
    (255, 255, 255),
    2
)


# ============================================================
# 17. SAVE RESULTS
# ============================================================

cv2.imwrite(
    OUTPUT_PATH,
    result
)

cv2.imwrite(
    "redness_mask.jpg",
    diffuse_redness
)

cv2.imwrite(
    "skin_mask.jpg",
    skin_mask
)


# ============================================================
# 18. PRINT RESULT
# ============================================================

print("\n========================================")
print("       FACIAL REDNESS ANALYSIS")
print("========================================")

print(
    f"Redness regions : {len(redness_regions)}"
)

print(
    f"Redness area    : {redness_percentage:.2f}%"
)

print(
    f"Severity        : {severity}"
)

print("\nAlgorithms used:")
print("1. CIELAB a*")
print("2. HSV")
print("3. Excess Red (ExR)")
print("4. Gaussian Blur + Morphology")
print("5. Connected Component Analysis")

print("\nSaved:")
print("redness_result.jpg")
print("redness_mask.jpg")
print("skin_mask.jpg")

print("========================================")


# ============================================================
# 19. SHOW RESULT
# ============================================================

cv2.imshow(
    "Facial Redness Detection",
    result
)

cv2.imshow(
    "Redness Mask",
    diffuse_redness
)

cv2.waitKey(0)
cv2.destroyAllWindows()