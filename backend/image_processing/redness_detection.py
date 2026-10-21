import cv2
import numpy as np


def detect_redness(
    image,
    mask
):
    """
    Estimate redness from the red channel.
    """

    blue, green, red = cv2.split(image)
    skin = mask > 0

    if not np.any(skin):
        return {"score": 0, "average_redness": 0, "redness_percentage": 0}

    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    lab_red = lab[:, :, 1] > 140
    hsv_red = ((hsv[:, :, 0] <= 12) | (hsv[:, :, 0] >= 165)) & (hsv[:, :, 1] > 35)
    excess_red = (2 * red.astype(np.int16) - green.astype(np.int16) - blue.astype(np.int16)) > 35
    candidate = ((lab_red.astype(np.uint8) + hsv_red.astype(np.uint8) + excess_red.astype(np.uint8)) >= 2).astype(np.uint8) * 255
    candidate = cv2.morphologyEx(candidate, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    candidate = cv2.morphologyEx(candidate, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    candidate = cv2.bitwise_and(candidate, mask)

    labels_count, labels, stats, _ = cv2.connectedComponentsWithStats(candidate, 8)
    filtered = np.zeros_like(candidate)
    for index in range(1, labels_count):
        area = stats[index, cv2.CC_STAT_AREA]
        width = stats[index, cv2.CC_STAT_WIDTH]
        height = stats[index, cv2.CC_STAT_HEIGHT]
        component = labels == index
        component_redness = float(np.mean(lab[:, :, 1][component])) - 128
        aspect_ratio = max(width, height) / max(min(width, height), 1)
        if 30 <= area <= 30000 and aspect_ratio <= 6 and component_redness >= 10:
            filtered[component] = 255

    redness_percentage = cv2.countNonZero(filtered) / cv2.countNonZero(mask) * 100
    redness_value = float(np.mean((red.astype(float) - green.astype(float))[skin]))

    return {
        "score": round(float(np.clip(100 - redness_percentage * 3, 0, 100)), 2),
        "average_redness": round(redness_value, 2),
        "redness_percentage": round(float(redness_percentage), 2),
        "severity": "NORMAL" if redness_percentage < 5 else "MILD" if redness_percentage < 12 else "MODERATE" if redness_percentage < 20 else "HIGH"
    }