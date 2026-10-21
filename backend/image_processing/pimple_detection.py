import cv2
import numpy as np


def detect_pimples(image, mask):
    """Detect small red connected regions within the supplied skin mask."""

    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    red_hsv = cv2.bitwise_or(
        cv2.inRange(hsv, np.array([0, 40, 40]), np.array([15, 255, 255])),
        cv2.inRange(hsv, np.array([160, 40, 40]), np.array([179, 255, 255]))
    )
    red_lab = cv2.inRange(lab[:, :, 1], 140, 255)
    adaptive = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV,
        11,
        3
    )
    candidate = cv2.bitwise_and(red_hsv, red_lab)
    candidate = cv2.bitwise_and(candidate, adaptive)
    candidate = cv2.bitwise_and(candidate, mask)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    candidate = cv2.morphologyEx(candidate, cv2.MORPH_OPEN, kernel)
    candidate = cv2.morphologyEx(candidate, cv2.MORPH_CLOSE, kernel)

    skin_area = cv2.countNonZero(mask)
    if not skin_area:
        return {"score": 0, "pimple_count": 0, "pimple_percentage": 0}

    labels_count, labels, stats, centroids = cv2.connectedComponentsWithStats(candidate, 8)
    pimple_count = 0
    pimple_mask = np.zeros_like(candidate)
    for index in range(1, labels_count):
        area = stats[index, cv2.CC_STAT_AREA]
        width = stats[index, cv2.CC_STAT_WIDTH]
        height = stats[index, cv2.CC_STAT_HEIGHT]
        aspect_ratio = width / max(height, 1)
        if 20 <= area <= 1500 and 0.3 <= aspect_ratio <= 3.0:
            pimple_count += 1
            pimple_mask[labels == index] = 255

    percentage = cv2.countNonZero(pimple_mask) / skin_area * 100
    score = np.clip(100 - percentage * 8 - pimple_count * 0.5, 0, 100)
    return {
        "score": round(float(score), 2),
        "pimple_count": pimple_count,
        "pimple_percentage": round(float(percentage), 2),
        "mask": pimple_mask,
        "centroids": [tuple(map(int, centroid)) for index, centroid in enumerate(centroids[1:], 1) if np.any(pimple_mask[labels == index])]
    }
