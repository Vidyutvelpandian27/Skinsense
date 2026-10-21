import cv2
import numpy as np

try:
    import pywt
except ImportError:
    pywt = None


def analyze_texture(
    image,
    mask
):
    """
    Analyze texture using grayscale variance.
    """

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    pixels = gray[mask > 0]
    if not len(pixels):
        return {"score": 0, "texture_variance": 0, "texture_percentage": 0}

    enhanced = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(
        cv2.GaussianBlur(gray, (5, 5), 0)
    )
    center = enhanced[1:-1, 1:-1]
    neighbors = [
        enhanced[:-2, :-2], enhanced[:-2, 1:-1], enhanced[:-2, 2:],
        enhanced[1:-1, 2:], enhanced[2:, 2:], enhanced[2:, 1:-1],
        enhanced[2:, :-2], enhanced[1:-1, :-2]
    ]
    lbp = np.zeros_like(center, dtype=np.uint8)
    for bit, neighbor in enumerate(neighbors):
        lbp |= ((neighbor >= center).astype(np.uint8) << bit)
    lbp_variance = cv2.blur(lbp.astype(np.float32) ** 2, (9, 9)) - cv2.blur(lbp.astype(np.float32), (9, 9)) ** 2
    lbp_map = cv2.copyMakeBorder(np.maximum(lbp_variance, 0), 1, 1, 1, 1, cv2.BORDER_REPLICATE)

    gabor_map = np.zeros_like(enhanced, dtype=np.float32)
    for angle in (0, np.pi / 4, np.pi / 2, 3 * np.pi / 4):
        kernel = cv2.getGaborKernel((21, 21), 4, angle, 10, 0.5, 0, cv2.CV_32F)
        gabor_map = np.maximum(gabor_map, np.abs(cv2.filter2D(enhanced, cv2.CV_32F, kernel)))

    laplacian_map = np.abs(cv2.Laplacian(enhanced, cv2.CV_32F))
    if pywt is not None:
        _, (horizontal, vertical, diagonal) = pywt.dwt2(
            enhanced.astype(np.float32) / 255.0,
            "haar"
        )
        wavelet_map = cv2.resize(
            np.abs(horizontal) + np.abs(vertical) + np.abs(diagonal),
            (gray.shape[1], gray.shape[0])
        )
    else:
        wavelet_map = np.abs(
            cv2.Laplacian(enhanced, cv2.CV_32F)
        )

    quantized = cv2.resize(enhanced, (150, 150)) // 16
    glcm = np.zeros((16, 16), dtype=np.float32)
    np.add.at(glcm, (quantized[:, :-1], quantized[:, 1:]), 1)
    glcm += glcm.T
    if glcm.sum():
        glcm /= glcm.sum()
    glcm_contrast = float(sum((row - column) ** 2 * glcm[row, column] for row in range(16) for column in range(16)))

    def normalize(feature):
        return cv2.normalize(feature, None, 0, 255, cv2.NORM_MINMAX).astype(np.float32)

    texture_map = 0.25 * normalize(lbp_map) + 0.25 * normalize(gabor_map) + 0.20 * normalize(laplacian_map) + 0.30 * normalize(wavelet_map)
    texture_map = cv2.GaussianBlur(normalize(texture_map), (7, 7), 0)
    threshold = np.clip(float(np.mean(texture_map) + 0.8 * np.std(texture_map)), 80, 180)
    texture_mask = ((texture_map >= threshold) & (mask > 0)).astype(np.uint8) * 255
    texture_mask = cv2.morphologyEx(texture_mask, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    texture_mask = cv2.morphologyEx(texture_mask, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    texture_percentage = cv2.countNonZero(texture_mask) / cv2.countNonZero(mask) * 100
    texture_percentage = float(np.clip(texture_percentage + glcm_contrast * 0.15, 0, 100))
    variance = float(np.var(pixels))
    score = np.clip(100 - texture_percentage * 4, 0, 100)

    return {
        "score": round(
            float(score),
            2
        ),
        "texture_variance": round(variance, 4),
        "texture_percentage": round(float(texture_percentage), 2)
    }