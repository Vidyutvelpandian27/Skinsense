import cv2
import numpy as np
import os

# ============================================================
# SKINSENSE - OILINESS / SKIN SHINE DETECTION
# Traditional Digital Image Processing
#
# Techniques:
# 1. Face Detection
# 2. Skin Region Extraction
# 3. HSV Color Space
# 4. LAB Color Space
# 5. Thresholding
# 6. Morphological Operations
# 7. Connected Component Analysis
# 8. Rule-Based Oiliness Classification
# ============================================================


# ------------------------------------------------------------
# 1. INPUT IMAGE
# ------------------------------------------------------------

IMAGE_PATH = "face.jpg"

image = cv2.imread(IMAGE_PATH)

if image is None:
    print("ERROR: Image not found!")
    print("Please place face.jpg in the same folder as this program.")
    exit()


# Resize image while maintaining reasonable processing size
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
# 2. FACE DETECTION
# ------------------------------------------------------------

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades +
    "haarcascade_frontalface_default.xml"
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


# Select the largest detected face
face = max(
    faces,
    key=lambda rect: rect[2] * rect[3]
)

x, y, w, h = face

print("\nFace detected")
print("Face position:", x, y, w, h)


# ------------------------------------------------------------
# 3. CREATE FACE / SKIN REGION
# ------------------------------------------------------------

face_roi = image[y:y+h, x:x+w]

face_display = face_roi.copy()


# ------------------------------------------------------------
# 4. CONVERT TO HSV
# ------------------------------------------------------------

hsv = cv2.cvtColor(
    face_roi,
    cv2.COLOR_BGR2HSV
)

H, S, V = cv2.split(hsv)


# ------------------------------------------------------------
# 5. CONVERT TO LAB
# ------------------------------------------------------------

lab = cv2.cvtColor(
    face_roi,
    cv2.COLOR_BGR2LAB
)

L, A, B = cv2.split(lab)


# ------------------------------------------------------------
# 6. SKIN COLOR MASK
# ------------------------------------------------------------
#
# This removes some non-skin areas.
#
# HSV:
# H -> Color
# S -> Saturation
# V -> Brightness
#
# LAB:
# A/B -> Color information
#
# Thresholds are approximate and should be calibrated
# according to the camera and lighting conditions.
# ------------------------------------------------------------


skin_hsv = cv2.inRange(
    hsv,
    np.array([0, 20, 40]),
    np.array([25, 255, 255])
)


# LAB based skin condition
skin_lab = cv2.inRange(
    lab,
    np.array([30, 120, 110]),
    np.array([255, 180, 180])
)


# Combine the two masks
skin_mask = cv2.bitwise_and(
    skin_hsv,
    skin_lab
)


# ------------------------------------------------------------
# 7. MORPHOLOGICAL CLEANING OF SKIN MASK
# ------------------------------------------------------------

kernel_skin = cv2.getStructuringElement(
    cv2.MORPH_ELLIPSE,
    (7, 7)
)

skin_mask = cv2.morphologyEx(
    skin_mask,
    cv2.MORPH_CLOSE,
    kernel_skin
)

skin_mask = cv2.morphologyEx(
    skin_mask,
    cv2.MORPH_OPEN,
    kernel_skin
)


# ------------------------------------------------------------
# 8. SPECULAR / SHINY REGION DETECTION
# ------------------------------------------------------------
#
# Oiliness is estimated from visible skin shine.
#
# We look for:
#
# High brightness (V)
# +
# Relatively high luminance (L)
# +
# Skin region
#
# ------------------------------------------------------------


# HSV brightness threshold
_, bright_mask = cv2.threshold(
    V,
    200,
    255,
    cv2.THRESH_BINARY
)


# LAB luminance threshold
_, lab_bright_mask = cv2.threshold(
    L,
    210,
    255,
    cv2.THRESH_BINARY
)


# ------------------------------------------------------------
# 9. COMBINE HSV + LAB SHINE
# ------------------------------------------------------------

shine_mask = cv2.bitwise_and(
    bright_mask,
    lab_bright_mask
)


# Only retain shiny pixels belonging to skin
shine_mask = cv2.bitwise_and(
    shine_mask,
    skin_mask
)


# ------------------------------------------------------------
# 10. MORPHOLOGICAL FILTERING
# ------------------------------------------------------------

kernel_shine = cv2.getStructuringElement(
    cv2.MORPH_ELLIPSE,
    (5, 5)
)


# Remove tiny noise
shine_mask = cv2.morphologyEx(
    shine_mask,
    cv2.MORPH_OPEN,
    kernel_shine
)


# Connect nearby shiny pixels
shine_mask = cv2.morphologyEx(
    shine_mask,
    cv2.MORPH_CLOSE,
    kernel_shine
)


# ------------------------------------------------------------
# 11. CONNECTED COMPONENT ANALYSIS
# ------------------------------------------------------------

num_labels, labels, stats, centroids = \
    cv2.connectedComponentsWithStats(
        shine_mask,
        connectivity=8
    )


# Result image
result = face_roi.copy()

shiny_area = 0

detected_regions = []


# ------------------------------------------------------------
# 12. FILTER SHINY REGIONS
# ------------------------------------------------------------

for i in range(1, num_labels):

    area = stats[i, cv2.CC_STAT_AREA]

    sx = stats[i, cv2.CC_STAT_LEFT]
    sy = stats[i, cv2.CC_STAT_TOP]

    sw = stats[i, cv2.CC_STAT_WIDTH]
    sh = stats[i, cv2.CC_STAT_HEIGHT]


    # Ignore very small noise
    if area < 30:
        continue


    # Ignore extremely large regions
    if area > 10000:
        continue


    shiny_area += area

    cx, cy = centroids[i]

    detected_regions.append(
        (int(cx), int(cy), area, sw, sh)
    )


# ------------------------------------------------------------
# 13. CALCULATE SKIN AREA
# ------------------------------------------------------------

total_skin_area = cv2.countNonZero(
    skin_mask
)


# Avoid division by zero
if total_skin_area == 0:

    print("Unable to identify skin region.")
    exit()


# ------------------------------------------------------------
# 14. CALCULATE SHINE PERCENTAGE
# ------------------------------------------------------------

shine_percentage = (
    shiny_area / total_skin_area
) * 100


# ------------------------------------------------------------
# 15. RULE-BASED OILINESS CLASSIFICATION
# ------------------------------------------------------------
#
# These values are example project thresholds.
# They should be calibrated using your own dataset.
#
# ------------------------------------------------------------

if shine_percentage < 5:

    oiliness = "LOW"

elif shine_percentage < 15:

    oiliness = "NORMAL"

elif shine_percentage < 25:

    oiliness = "OILY"

else:

    oiliness = "VERY OILY"


# ------------------------------------------------------------
# 16. DRAW CIRCLES AROUND SHINY REGIONS
# ------------------------------------------------------------

for cx, cy, area, sw, sh in detected_regions:

    # Calculate radius from bounding box
    radius = max(
        int(max(sw, sh) / 2),
        5
    )

    cv2.circle(
        result,
        (cx, cy),
        radius,
        (0, 0, 255),
        2
    )


# ------------------------------------------------------------
# 17. ADD INFORMATION TO RESULT
# ------------------------------------------------------------

cv2.putText(
    result,
    "Oiliness: " + oiliness,
    (20, 35),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.9,
    (0, 255, 0),
    2
)


cv2.putText(
    result,
    f"Shine: {shine_percentage:.2f}%",
    (20, 70),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.8,
    (0, 255, 0),
    2
)


cv2.putText(
    result,
    f"Regions: {len(detected_regions)}",
    (20, 105),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.8,
    (0, 255, 0),
    2
)


# ------------------------------------------------------------
# 18. PUT RESULT BACK INTO ORIGINAL IMAGE
# ------------------------------------------------------------

output = image.copy()

output[y:y+h, x:x+w] = result


# Draw face boundary
cv2.rectangle(
    output,
    (x, y),
    (x+w, y+h),
    (255, 255, 0),
    2
)


# ------------------------------------------------------------
# 19. PRINT RESULTS
# ------------------------------------------------------------

print("\n===================================")
print("       SKINSENSE ANALYSIS")
print("===================================")

print("Skin Area       :", total_skin_area)
print("Shiny Area      :", shiny_area)
print(
    "Shine Percentage:",
    round(shine_percentage, 2),
    "%"
)

print(
    "Shiny Regions   :",
    len(detected_regions)
)

print(
    "Oiliness Level  :",
    oiliness
)

print("===================================")


# ------------------------------------------------------------
# 20. SAVE OUTPUT
# ------------------------------------------------------------

output_path = "oiliness_result.jpg"

cv2.imwrite(
    output_path,
    output
)

print("\nResult saved as:", output_path)


# ------------------------------------------------------------
# 21. DISPLAY RESULTS
# ------------------------------------------------------------

cv2.imshow(
    "Original Image",
    image
)

cv2.imshow(
    "Skin Mask",
    skin_mask
)

cv2.imshow(
    "Shine Mask",
    shine_mask
)

cv2.imshow(
    "Oiliness Detection",
    output
)


cv2.waitKey(0)

cv2.destroyAllWindows()