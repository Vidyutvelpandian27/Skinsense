import cv2
import numpy as np


def detect_oiliness(
    image,
    mask
):
    """
    Estimate skin oiliness using brightness
    and low-saturation regions.
    """

    hsv = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2HSV
    )

    brightness = hsv[:, :, 2]
    saturation = hsv[:, :, 1]
    skin = mask > 0

    if not np.any(skin):
        return {"score": 0, "oiliness_percentage": 0}

    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    bright_mask = brightness > 200
    lab_bright_mask = lab[:, :, 0] > 210
    shiny = cv2.bitwise_and(
        (bright_mask & (saturation < 100)).astype(np.uint8) * 255,
        (lab_bright_mask & skin).astype(np.uint8) * 255
    )
    shiny = cv2.morphologyEx(shiny, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    shiny = cv2.morphologyEx(shiny, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    shiny = cv2.bitwise_and(shiny, mask)
    components, labels, stats, _ = cv2.connectedComponentsWithStats(shiny, 8)
    filtered = np.zeros_like(shiny)
    for index in range(1, components):
        area = stats[index, cv2.CC_STAT_AREA]
        if 30 <= area <= 10000:
            filtered[labels == index] = 255
    shiny = filtered
    percentage = cv2.countNonZero(shiny) / cv2.countNonZero(mask) * 100

    score = np.clip(
        100 - percentage * 4,
        0,
        100
    )

    return {
        "score": round(
            float(score),
            2
        ),
        "oiliness_percentage": round(
            float(percentage),
            2
        )
    }