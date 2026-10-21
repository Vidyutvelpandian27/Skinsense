import cv2
import numpy as np


def detect_dryness(
    image,
    mask
):
    """
    Estimate dryness from brightness,
    texture variation and local contrast.
    """

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    skin_pixels = gray[
        mask > 0
    ]

    if len(skin_pixels) == 0:
        return {
            "score": 0,
            "dryness_percentage": 0
        }

    mean_value = np.mean(
        skin_pixels
    )

    standard_deviation = np.std(
        skin_pixels
    )

    dryness_indicator = (
        max(
            0,
            120 - mean_value
        )
        +
        standard_deviation * 0.5
    )

    dryness_percentage = np.clip(
        dryness_indicator,
        0,
        100
    )

    score = 100 - dryness_percentage

    return {
        "score": round(
            float(score),
            2
        ),
        "dryness_percentage": round(
            float(dryness_percentage),
            2
        )
    }