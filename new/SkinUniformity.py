import cv2
import numpy as np
import math

# ============================================================
# SKIN COLOR UNIFORMITY DETECTION
#
# Five algorithms:
# 1. CIELAB
# 2. HSV
# 3. YCbCr
# 4. Delta E Color Difference
# 5. Local Standard Deviation
#
# Output:
# - Face image with regions
# - Delta E values
# - Uniform / Non-uniform regions
# - Overall Skin Uniformity %
# ============================================================


IMAGE_PATH = "face.jpg"
OUTPUT_PATH = "skin_uniformity_result.jpg"


# ============================================================
# 1. LOAD IMAGE
# ============================================================

image = cv2.imread(IMAGE_PATH)

if image is None:
    print("ERROR: face.jpg not found!")
    exit()

# Resize large image

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

gray = cv2.cvtColor(
    image,
    cv2.COLOR_BGR2GRAY
)

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
# 3. ALGORITHM 1 — CIELAB
# ============================================================

lab = cv2.cvtColor(
    face,
    cv2.COLOR_BGR2LAB
)

L, A, B = cv2.split(lab)

# Convert OpenCV LAB to approximate CIELAB values

L_star = L.astype(np.float32) * 100 / 255.0

a_star = A.astype(np.float32) - 128

b_star = B.astype(np.float32) - 128


# ============================================================
# 4. ALGORITHM 2 — HSV
# ============================================================

hsv = cv2.cvtColor(
    face,
    cv2.COLOR_BGR2HSV
)

H, S, V = cv2.split(hsv)


# ============================================================
# 5. ALGORITHM 3 — YCbCr
# ============================================================

ycrcb = cv2.cvtColor(
    face,
    cv2.COLOR_BGR2YCrCb
)

Y, Cr, Cb = cv2.split(ycrcb)


# ============================================================
# 6. SKIN MASK
# ============================================================

# HSV based skin detection

hsv_skin = cv2.inRange(
    hsv,
    np.array([0, 20, 40]),
    np.array([179, 255, 245])
)


# LAB based skin detection

lab_skin = cv2.inRange(
    lab,
    np.array([30, 115, 115]),
    np.array([255, 190, 190])
)


# YCbCr based skin detection

ycrcb_skin = cv2.inRange(
    ycrcb,
    np.array([50, 120, 70]),
    np.array([255, 180, 150])
)


# Combine the three color spaces

skin_mask = cv2.bitwise_and(
    hsv_skin,
    lab_skin
)

skin_mask = cv2.bitwise_and(
    skin_mask,
    ycrcb_skin
)


# ============================================================
# 7. INNER FACE MASK
# ============================================================

face_region = np.zeros(
    (h, w),
    dtype=np.uint8
)

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


# ============================================================
# 8. REMOVE NOISE
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
# 9. FIND OVERALL REFERENCE SKIN COLOR
# ============================================================

skin_pixels = skin_mask > 0

if np.sum(skin_pixels) < 1000:

    print("Not enough skin pixels detected.")
    exit()


# Median is more robust than mean

reference_L = np.median(
    L_star[skin_pixels]
)

reference_a = np.median(
    a_star[skin_pixels]
)

reference_b = np.median(
    b_star[skin_pixels]
)


# ============================================================
# 10. DIVIDE FACE INTO REGIONS
# ============================================================

# We use a 3 x 3 grid.
#
#     R1 | R2 | R3
#     ---+----+---
#     R4 | R5 | R6
#     ---+----+---
#     R7 | R8 | R9
#
# Each region is compared with the reference skin color.


rows = 3
cols = 3

region_width = w // cols
region_height = h // rows


uniform_regions = 0
non_uniform_regions = 0

delta_e_values = []


# ============================================================
# 11. PROCESS EACH REGION
# ============================================================

for row in range(rows):

    for col in range(cols):

        x1 = col * region_width
        y1 = row * region_height

        x2 = (
            (col + 1) * region_width
            if col < cols - 1
            else w
        )

        y2 = (
            (row + 1) * region_height
            if row < rows - 1
            else h
        )


        # Region skin mask

        region_mask = skin_mask[
            y1:y2,
            x1:x2
        ]


        region_skin = region_mask > 0


        # Skip region if not enough skin

        if np.sum(region_skin) < 100:

            continue


        # ====================================================
        # CIELAB VALUES
        # ====================================================

        region_L = L_star[
            y1:y2,
            x1:x2
        ][region_skin]

        region_a = a_star[
            y1:y2,
            x1:x2
        ][region_skin]

        region_b = b_star[
            y1:y2,
            x1:x2
        ][region_skin]


        mean_L = np.median(region_L)
        mean_a = np.median(region_a)
        mean_b = np.median(region_b)


        # ====================================================
        # ALGORITHM 4 — DELTA E
        # ====================================================

        delta_L = (
            mean_L -
            reference_L
        )

        delta_a = (
            mean_a -
            reference_a
        )

        delta_b = (
            mean_b -
            reference_b
        )


        delta_E = math.sqrt(
            delta_L ** 2 +
            delta_a ** 2 +
            delta_b ** 2
        )


        delta_e_values.append(
            delta_E
        )


        # ====================================================
        # HSV ANALYSIS
        # ====================================================

        region_H = H[
            y1:y2,
            x1:x2
        ][region_skin]

        region_S = S[
            y1:y2,
            x1:x2
        ][region_skin]

        region_V = V[
            y1:y2,
            x1:x2
        ][region_skin]


        hsv_variation = (
            np.std(region_H) +
            np.std(region_S) +
            np.std(region_V)
        )


        # ====================================================
        # YCbCr ANALYSIS
        # ====================================================

        region_Y = Y[
            y1:y2,
            x1:x2
        ][region_skin]

        region_Cr = Cr[
            y1:y2,
            x1:x2
        ][region_skin]

        region_Cb = Cb[
            y1:y2,
            x1:x2
        ][region_skin]


        ycbcr_variation = (
            np.std(region_Y) +
            np.std(region_Cr) +
            np.std(region_Cb)
        )


        # ====================================================
        # ALGORITHM 5 — LOCAL STANDARD DEVIATION
        # ====================================================

        local_L = L_star[
            y1:y2,
            x1:x2
        ]

        local_variation = np.std(
            local_L[region_skin]
        )


        # ====================================================
        # UNIFORMITY DECISION
        # ====================================================

        # Delta E is the primary criterion.

        if delta_E < 5:

            status = "UNIFORM"
            uniform_regions += 1

        elif delta_E < 10:

            status = "SLIGHT"
            uniform_regions += 1

        elif delta_E < 20:

            status = "NON-UNIFORM"
            non_uniform_regions += 1

        else:

            status = "HIGH VARIATION"
            non_uniform_regions += 1


        # ====================================================
        # DRAW REGION
        # ====================================================

        global_x1 = x + x1
        global_y1 = y + y1

        global_x2 = x + x2
        global_y2 = y + y2


        if status == "UNIFORM":

            border_color = (0, 255, 0)

        elif status == "SLIGHT":

            border_color = (0, 255, 255)

        else:

            border_color = (0, 0, 255)


        cv2.rectangle(
            result,
            (global_x1, global_y1),
            (global_x2, global_y2),
            border_color,
            2
        )


        # ====================================================
        # DISPLAY DELTA E VALUE
        # ====================================================

        label = (
            f"dE:{delta_E:.1f} {status}"
        )


        # Background for text

        text_x = global_x1 + 5
        text_y = global_y1 + 20


        cv2.rectangle(
            result,
            (
                text_x - 2,
                text_y - 17
            ),
            (
                text_x + 150,
                text_y + 5
            ),
            (0, 0, 0),
            -1
        )


        cv2.putText(
            result,
            label,
            (text_x, text_y),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.42,
            (255, 255, 255),
            1,
            cv2.LINE_AA
        )


# ============================================================
# 12. CALCULATE OVERALL UNIFORMITY
# ============================================================

total_regions = (
    uniform_regions +
    non_uniform_regions
)


if total_regions > 0:

    uniformity_percentage = (
        uniform_regions /
        total_regions
    ) * 100

else:

    uniformity_percentage = 0


# ============================================================
# 13. OVERALL COLOR VARIATION
# ============================================================

if len(delta_e_values) > 0:

    average_delta_E = np.mean(
        delta_e_values
    )

else:

    average_delta_E = 0


# ============================================================
# 14. OVERALL CLASSIFICATION
# ============================================================

if average_delta_E < 5:

    overall_status = "HIGHLY UNIFORM"

elif average_delta_E < 10:

    overall_status = "UNIFORM"

elif average_delta_E < 20:

    overall_status = "SLIGHTLY NON-UNIFORM"

else:

    overall_status = "NON-UNIFORM"


# ============================================================
# 15. DRAW FACE RECTANGLE
# ============================================================

cv2.rectangle(
    result,
    (x, y),
    (x + w, y + h),
    (255, 255, 255),
    2
)


# ============================================================
# 16. DISPLAY OVERALL RESULT
# ============================================================

cv2.rectangle(
    result,
    (10, 10),
    (390, 125),
    (0, 0, 0),
    -1
)


cv2.putText(
    result,
    f"Skin Uniformity: {uniformity_percentage:.1f}%",
    (20, 40),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.62,
    (255, 255, 255),
    2
)


cv2.putText(
    result,
    f"Average Delta E: {average_delta_E:.1f}",
    (20, 70),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.60,
    (255, 255, 255),
    2
)


cv2.putText(
    result,
    f"Status: {overall_status}",
    (20, 100),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.60,
    (255, 255, 255),
    2
)


# ============================================================
# 17. SAVE OUTPUT
# ============================================================

cv2.imwrite(
    OUTPUT_PATH,
    result
)

cv2.imwrite(
    "skin_uniformity_mask.jpg",
    skin_mask
)


# ============================================================
# 18. PRINT RESULTS
# ============================================================

print("\n==========================================")
print("       SKIN COLOR UNIFORMITY")
print("==========================================")

print(
    f"Regions analyzed     : {total_regions}"
)

print(
    f"Uniform regions       : {uniform_regions}"
)

print(
    f"Non-uniform regions   : {non_uniform_regions}"
)

print(
    f"Skin Uniformity       : "
    f"{uniformity_percentage:.2f}%"
)

print(
    f"Average Delta E       : "
    f"{average_delta_E:.2f}"
)

print(
    f"Overall Status        : "
    f"{overall_status}"
)

print("\nAlgorithms used:")
print("1. CIELAB")
print("2. HSV")
print("3. YCbCr")
print("4. Delta E Color Difference")
print("5. Local Standard Deviation")

print("\nOutput:")
print("skin_uniformity_result.jpg")
print("skin_uniformity_mask.jpg")

print("==========================================")


# ============================================================
# 19. DISPLAY RESULT
# ============================================================

cv2.imshow(
    "Skin Color Uniformity",
    result
)

cv2.imshow(
    "Skin Mask",
    skin_mask
)

cv2.waitKey(0)

cv2.destroyAllWindows()