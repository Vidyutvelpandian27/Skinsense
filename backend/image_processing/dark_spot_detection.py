import cv2
import numpy as np


def detect_dark_spots(
    image,
    mask
):
    """
    Detect darker regions within the skin mask.
    """

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    skin = mask > 0
    skin_pixels = gray[skin]

    if not len(skin_pixels):
        return {"score": 0, "dark_spot_percentage": 0}

    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    ycrcb = cv2.cvtColor(image, cv2.COLOR_BGR2YCrCb)
    blackhat = cv2.morphologyEx(gray, cv2.MORPH_BLACKHAT, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (21, 21)))
    votes = (
        (lab[:, :, 0] < np.mean(lab[:, :, 0][skin]) * 0.65).astype(np.uint8)
        + (gray < np.mean(skin_pixels) * 0.65).astype(np.uint8)
        + (ycrcb[:, :, 0] < np.mean(ycrcb[:, :, 0][skin]) * 0.65).astype(np.uint8)
        + (blackhat > 12).astype(np.uint8)
    )
    candidate = ((votes >= 3) & skin).astype(np.uint8) * 255
    candidate = cv2.morphologyEx(candidate, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    components, labels, stats, _ = cv2.connectedComponentsWithStats(candidate, 8)
    filtered = np.zeros_like(candidate)
    for index in range(1, components):
        area = stats[index, cv2.CC_STAT_AREA]
        width = stats[index, cv2.CC_STAT_WIDTH]
        height = stats[index, cv2.CC_STAT_HEIGHT]
        aspect_ratio = max(width, height) / max(min(width, height), 1)
        if 30 <= area <= 5000 and aspect_ratio <= 5:
            filtered[labels == index] = 255
    candidate = filtered
    percentage = cv2.countNonZero(candidate) / cv2.countNonZero(mask) * 100

    return {
        "score": round(float(np.clip(100 - percentage * 5, 0, 100)), 2),
        "dark_spot_percentage": round(float(percentage), 2)
    }