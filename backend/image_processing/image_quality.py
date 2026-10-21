import cv2
import numpy as np


def calculate_brightness(image):
    """
    Calculate average image brightness.
    """

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    return float(
        np.mean(gray)
    )


def calculate_sharpness(image):
    """
    Calculate image sharpness using
    Laplacian variance.
    """

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    return float(
        cv2.Laplacian(
            gray,
            cv2.CV_64F
        ).var()
    )


def assess_image_quality(image):
    """
    Estimate basic image quality.
    """

    brightness = calculate_brightness(
        image
    )

    sharpness = calculate_sharpness(
        image
    )

    brightness_score = max(
        0,
        100 - abs(
            brightness - 128
        ) * 0.8
    )

    sharpness_score = min(
        100,
        sharpness / 10
    )

    score = (
        brightness_score * 0.4
        +
        sharpness_score * 0.6
    )

    return {
        "score": round(
            float(score),
            2
        ),
        "brightness": round(
            brightness,
            2
        ),
        "sharpness": round(
            sharpness,
            2
        )
    }