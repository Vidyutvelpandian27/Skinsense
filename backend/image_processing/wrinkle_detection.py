import cv2
import numpy as np


def detect_wrinkles(
    image,
    mask
):
    """
    Estimate wrinkle/line density using
    edge detection.
    """

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    enhanced = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(cv2.GaussianBlur(gray, (5, 5), 0))
    skin = mask > 0
    if not np.any(skin):
        return {"score": 0, "wrinkle_density": 0, "wrinkle_count": 0}

    blackhat = cv2.morphologyEx(enhanced, cv2.MORPH_BLACKHAT, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))) > 12
    gabor_response = np.zeros_like(enhanced, dtype=np.float32)
    for angle in (0, np.pi / 4, np.pi / 2, 3 * np.pi / 4):
        kernel = cv2.getGaborKernel((21, 21), 4, angle, 10, 0.5, 0, cv2.CV_32F)
        gabor_response = np.maximum(gabor_response, np.abs(cv2.filter2D(enhanced, cv2.CV_32F, kernel)))
    gabor_mask = cv2.normalize(gabor_response, None, 0, 255, cv2.NORM_MINMAX) > 150
    edges = cv2.dilate(cv2.Canny(enhanced, 40, 100), np.ones((3, 3), np.uint8)) > 0
    laplacian = np.abs(cv2.Laplacian(enhanced, cv2.CV_32F)) > 40
    center = enhanced[1:-1, 1:-1]
    neighbors = [enhanced[:-2, :-2], enhanced[:-2, 1:-1], enhanced[:-2, 2:], enhanced[1:-1, 2:], enhanced[2:, 2:], enhanced[2:, 1:-1], enhanced[2:, :-2], enhanced[1:-1, :-2]]
    lbp = np.zeros_like(center, dtype=np.uint8)
    for bit, neighbor in enumerate(neighbors):
        lbp |= ((neighbor >= center).astype(np.uint8) << bit)
    lbp_variance = cv2.blur(lbp.astype(np.float32) ** 2, (7, 7)) - cv2.blur(lbp.astype(np.float32), (7, 7)) ** 2
    lbp_mask = cv2.normalize(np.maximum(lbp_variance, 0), None, 0, 255, cv2.NORM_MINMAX) > 35
    lbp_mask = cv2.copyMakeBorder(lbp_mask.astype(np.uint8), 1, 1, 1, 1, cv2.BORDER_REPLICATE) > 0
    votes = blackhat.astype(np.uint8) + gabor_mask.astype(np.uint8) + edges.astype(np.uint8) + laplacian.astype(np.uint8) + lbp_mask.astype(np.uint8)
    wrinkle_mask = (votes >= 3) & skin
    wrinkle_mask = cv2.morphologyEx(wrinkle_mask.astype(np.uint8) * 255, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    density = cv2.countNonZero(wrinkle_mask) / cv2.countNonZero(mask) * 100
    components, _, stats, _ = cv2.connectedComponentsWithStats(wrinkle_mask, 8)
    wrinkle_count = sum(20 <= stats[index, cv2.CC_STAT_AREA] <= 5000 for index in range(1, components))

    return {
        "score": round(float(np.clip(100 - density * 4, 0, 100)), 2),
        "wrinkle_density": round(float(density), 2),
        "wrinkle_count": wrinkle_count
    }