import cv2
import numpy as np
image = cv2.imread("face.jpg")
if image is None:
    print("Image not found!")
    exit()
original = image.copy()
image = cv2.resize(image, (600, 600))
hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
lower_red1 = np.array([0, 40, 40])
upper_red1 = np.array([15, 255, 255])
lower_red2 = np.array([160, 40, 40])
upper_red2 = np.array([180, 255, 255])
mask_hsv1 = cv2.inRange(hsv, lower_red1, upper_red1)
mask_hsv2 = cv2.inRange(hsv, lower_red2, upper_red2)
hsv_mask = mask_hsv1 | mask_hsv2
lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
L, A, B = cv2.split(lab)
_, lab_mask = cv2.threshold(
    A,
    140,
    255,
    cv2.THRESH_BINARY
)
combined_mask = cv2.bitwise_and(
    hsv_mask,
    lab_mask
)
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
adaptive_mask = cv2.adaptiveThreshold(
    gray,
    255,
    cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv2.THRESH_BINARY_INV,
    11,
    3
)
combined_mask = cv2.bitwise_and(
    combined_mask,
    adaptive_mask
)
kernel = cv2.getStructuringElement(
    cv2.MORPH_ELLIPSE,
    (5, 5)
)
clean_mask = cv2.morphologyEx(
    combined_mask,
    cv2.MORPH_OPEN,
    kernel
)
clean_mask = cv2.morphologyEx(
    clean_mask,
    cv2.MORPH_CLOSE,
    kernel
)
num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(
    clean_mask,
    connectivity=8
)
pimple_count = 0
result = image.copy()
for i in range(1, num_labels):
    x = stats[i, cv2.CC_STAT_LEFT]
    y = stats[i, cv2.CC_STAT_TOP]
    w = stats[i, cv2.CC_STAT_WIDTH]
    h = stats[i, cv2.CC_STAT_HEIGHT]
    area = stats[i, cv2.CC_STAT_AREA]
    if 20 <= area <= 1500:
        aspect_ratio = w / float(h)
        if 0.3 <= aspect_ratio <= 3.0:
            pimple_count += 1
            cv2.rectangle(
                result,
                (x, y),
                (x + w, y + h),
                (0, 0, 255),
                2
            )
            cx, cy = centroids[i]
            cv2.circle(
                result,
                (int(cx), int(cy)),
                3,
                (255, 0, 0),
                -1
            )
print("Detected Pimples:", pimple_count)
cv2.putText(
    result,
    f"Pimples Detected: {pimple_count}",
    (20, 40),
    cv2.FONT_HERSHEY_SIMPLEX,
    1,
    (0, 255, 0),
    2
)
cv2.imshow("Original Image", image)
cv2.imshow("Pimple Mask", clean_mask)
cv2.imshow("Detected Pimples", result)
cv2.waitKey(0)
cv2.destroyAllWindows()