import cv2
import numpy as np
import math

# ============================================================
# SKINSENSE - SKIN TONE DETECTION
# Traditional Digital Image Processing
#
# Algorithms / Techniques:
# 1. RGB Color Analysis
# 2. HSV Color Space
# 3. YCbCr Color Space
# 4. CIELAB Color Space
# 5. ITA (Individual Typology Angle)
#
# Output:
# - Detected skin region
# - Skin-tone classification
# - ITA value
# - Average RGB / HSV / YCbCr / LAB values
# - Result displayed on original image
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

gray_image = cv2.cvtColor(
    image,
    cv2.COLOR_BGR2GRAY
)

faces = face_cascade.detectMultiScale(
    gray_image,
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


# ============================================================
# 4. RGB COLOR ANALYSIS
# ============================================================

# OpenCV loads images as BGR,
# so convert BGR -> RGB

rgb = cv2.cvtColor(
    face,
    cv2.COLOR_BGR2RGB
)

R, G, B = cv2.split(rgb)


# ------------------------------------------------------------
# Average RGB values
# ------------------------------------------------------------

avg_R = np.mean(R)
avg_G = np.mean(G)
avg_B = np.mean(B)


# ============================================================
# 5. HSV COLOR SPACE
# ============================================================

hsv = cv2.cvtColor(
    face,
    cv2.COLOR_BGR2HSV
)

H, S, V = cv2.split(hsv)


avg_H = np.mean(H)
avg_S = np.mean(S)
avg_V = np.mean(V)


# ============================================================
# 6. YCbCr COLOR SPACE
# ============================================================

ycbcr = cv2.cvtColor(
    face,
    cv2.COLOR_BGR2YCrCb
)

Y, Cr, Cb = cv2.split(ycbcr)


avg_Y = np.mean(Y)
avg_Cr = np.mean(Cr)
avg_Cb = np.mean(Cb)


# ============================================================
# 7. CIELAB COLOR SPACE
# ============================================================

lab = cv2.cvtColor(
    face,
    cv2.COLOR_BGR2LAB
)

L_channel, A_channel, B_channel = cv2.split(lab)


# OpenCV LAB representation:
#
# L = 0 to 255
# A = 0 to 255
# B = 0 to 255
#
# Convert L to approximately 0-100
# Convert A/B to approximately -128 to +127


L_star = L_channel.astype(
    np.float32
) * (100.0 / 255.0)


a_star = (
    A_channel.astype(
        np.float32
    ) - 128
)


b_star = (
    B_channel.astype(
        np.float32
    ) - 128
)


# ============================================================
# 8. SKIN REGION EXTRACTION
# ============================================================

# ------------------------------------------------------------
# HSV skin mask
# ------------------------------------------------------------

hsv_skin = cv2.inRange(
    hsv,
    np.array([0, 20, 40]),
    np.array([25, 255, 255])
)


# ------------------------------------------------------------
# YCbCr skin mask
# ------------------------------------------------------------

ycbcr_skin = cv2.inRange(
    ycbcr,

    np.array([
        50,
        120,
        70
    ]),

    np.array([
        255,
        180,
        150
    ])
)


# ------------------------------------------------------------
# LAB skin mask
# ------------------------------------------------------------

lab_skin = cv2.inRange(
    lab,

    np.array([
        30,
        120,
        120
    ]),

    np.array([
        255,
        180,
        180
    ])
)


# ------------------------------------------------------------
# Combine skin masks
# ------------------------------------------------------------

skin_mask = cv2.bitwise_and(
    hsv_skin,
    ycbcr_skin
)

skin_mask = cv2.bitwise_and(
    skin_mask,
    lab_skin
)


# ============================================================
# 9. MORPHOLOGICAL CLEANING
# ============================================================

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
# 10. REMOVE EYES / MOUTH / HAIR APPROXIMATELY
# ============================================================

# We use a central face region for skin-tone estimation.
#
# This avoids some non-skin regions such as:
# eyes, lips, hair and face boundary.


mask_height, mask_width = skin_mask.shape

roi_mask = np.zeros_like(
    skin_mask
)


# Central region
roi_mask[
    int(mask_height * 0.15):
    int(mask_height * 0.85),

    int(mask_width * 0.15):
    int(mask_width * 0.85)
] = 255


skin_mask = cv2.bitwise_and(
    skin_mask,
    roi_mask
)


# ============================================================
# 11. CHECK SKIN PIXELS
# ============================================================

skin_pixels = cv2.countNonZero(
    skin_mask
)


if skin_pixels < 100:

    print(
        "Unable to obtain sufficient skin pixels."
    )

    exit()


# ============================================================
# 12. EXTRACT SKIN PIXELS
# ============================================================

L_values = L_star[
    skin_mask > 0
]

a_values = a_star[
    skin_mask > 0
]

b_values = b_star[
    skin_mask > 0
]


# Average LAB values

mean_L = np.mean(
    L_values
)

mean_a = np.mean(
    a_values
)

mean_b = np.mean(
    b_values
)


# ============================================================
# 13. ITA CALCULATION
# ============================================================

# ITA formula:
#
# ITA = atan((L* - 50) / b*) × 180/pi
#
# ------------------------------------------------------------

if abs(mean_b) < 0.001:

    ita = 90.0

else:

    ita = math.degrees(
        math.atan(
            (mean_L - 50) /
            mean_b
        )
    )


# ============================================================
# 14. ITA SKIN-TONE CLASSIFICATION
# ============================================================

if ita > 55:

    skin_tone = "VERY LIGHT"

elif ita > 41:

    skin_tone = "LIGHT"

elif ita > 28:

    skin_tone = "INTERMEDIATE"

elif ita > 10:

    skin_tone = "TAN"

elif ita > -30:

    skin_tone = "BROWN"

else:

    skin_tone = "DARK"


# ============================================================
# 15. SUPPORTING RGB ANALYSIS
# ============================================================

# Extract RGB values only from detected skin

R_skin = R[
    skin_mask > 0
]

G_skin = G[
    skin_mask > 0
]

B_skin = B[
    skin_mask > 0
]


mean_R = np.mean(R_skin)
mean_G = np.mean(G_skin)
mean_B = np.mean(B_skin)


# ============================================================
# 16. SUPPORTING HSV ANALYSIS
# ============================================================

H_skin = H[
    skin_mask > 0
]

S_skin = S[
    skin_mask > 0
]

V_skin = V[
    skin_mask > 0
]


mean_H = np.mean(H_skin)
mean_S = np.mean(S_skin)
mean_V = np.mean(V_skin)


# ============================================================
# 17. SUPPORTING YCbCr ANALYSIS
# ============================================================

Y_skin = Y[
    skin_mask > 0
]

Cr_skin = Cr[
    skin_mask > 0
]

Cb_skin = Cb[
    skin_mask > 0
]


mean_Y = np.mean(Y_skin)
mean_Cr = np.mean(Cr_skin)
mean_Cb = np.mean(Cb_skin)


# ============================================================
# 18. CREATE SKIN-ONLY IMAGE
# ============================================================

skin_only = cv2.bitwise_and(
    face,
    face,
    mask=skin_mask
)


# ============================================================
# 19. MARK SKIN REGION
# ============================================================

result = face.copy()


# Find contours of skin region

contours, _ = cv2.findContours(
    skin_mask,
    cv2.RETR_EXTERNAL,
    cv2.CHAIN_APPROX_SIMPLE
)


cv2.drawContours(
    result,
    contours,
    -1,
    (0, 255, 0),
    1
)


# ============================================================
# 20. DISPLAY RESULTS ON IMAGE
# ============================================================

cv2.putText(
    result,
    "Skin Tone: " + skin_tone,
    (15, 30),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.65,
    (0, 255, 0),
    2
)


cv2.putText(
    result,
    "ITA: {:.2f}".format(
        ita
    ),
    (15, 60),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.65,
    (0, 255, 0),
    2
)


cv2.putText(
    result,
    "LAB L*: {:.2f}".format(
        mean_L
    ),
    (15, 90),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.55,
    (0, 255, 0),
    2
)


# ============================================================
# 21. PUT RESULT BACK ON FULL IMAGE
# ============================================================

output = image.copy()


output[
    y:y+h,
    x:x+w
] = result


# Face rectangle

cv2.rectangle(
    output,
    (x, y),
    (x+w, y+h),
    (255, 255, 0),
    2
)


# ============================================================
# 22. PRINT COMPLETE ANALYSIS
# ============================================================

print("\n")
print("================================================")
print("           SKINSENSE SKIN TONE ANALYSIS")
print("================================================")

print("\n--- RGB ANALYSIS ---")

print(
    "Average R :",
    round(mean_R, 2)
)

print(
    "Average G :",
    round(mean_G, 2)
)

print(
    "Average B :",
    round(mean_B, 2)
)


print("\n--- HSV ANALYSIS ---")

print(
    "Average H :",
    round(mean_H, 2)
)

print(
    "Average S :",
    round(mean_S, 2)
)

print(
    "Average V :",
    round(mean_V, 2)
)


print("\n--- YCbCr ANALYSIS ---")

print(
    "Average Y  :",
    round(mean_Y, 2)
)

print(
    "Average Cr :",
    round(mean_Cr, 2)
)

print(
    "Average Cb :",
    round(mean_Cb, 2)
)


print("\n--- CIELAB ANALYSIS ---")

print(
    "L* :",
    round(mean_L, 2)
)

print(
    "a* :",
    round(mean_a, 2)
)

print(
    "b* :",
    round(mean_b, 2)
)


print("\n--- ITA ANALYSIS ---")

print(
    "ITA Angle :",
    round(ita, 2),
    "degrees"
)

print(
    "Skin Tone :",
    skin_tone
)


print("\nSkin Pixels:",
      skin_pixels)

print("================================================")


# ============================================================
# 23. SAVE RESULTS
# ============================================================

cv2.imwrite(
    "skin_tone_result.jpg",
    output
)

cv2.imwrite(
    "skin_mask.jpg",
    skin_mask
)

cv2.imwrite(
    "skin_region.jpg",
    skin_only
)


print("\nResults saved:")
print("skin_tone_result.jpg")
print("skin_mask.jpg")
print("skin_region.jpg")


# ============================================================
# 24. DISPLAY
# ============================================================

cv2.imshow(
    "Original Image",
    image
)

cv2.imshow(
    "Skin Mask",
    skin_mask
)

cv2.imshow(
    "Skin Region",
    skin_only
)

cv2.imshow(
    "Skin Tone Result",
    output
)


cv2.waitKey(0)

cv2.destroyAllWindows()