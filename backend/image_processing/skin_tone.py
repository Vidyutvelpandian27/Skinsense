import cv2
import numpy as np


def classify_skin_tone(
    image,
    mask
):
    """
    Estimate a basic skin-tone category
    using average LAB lightness.
    """

    lab = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2LAB
    )

    lightness = lab[:, :, 0]

    pixels = lightness[
        mask > 0
    ]

    if len(pixels) == 0:
        return {
            "score": 0,
            "tone": "Unknown",
            "lightness": 0
        }

    average = float(np.median(pixels))

    if average < 70:
        tone = "Deep"
    elif average < 100:
        tone = "Medium Deep"
    elif average < 130:
        tone = "Medium"
    elif average < 165:
        tone = "Light"
    else:
        tone = "Very Light"

    # This is a uniformity score, not a medical
    # skin-tone classification.
    standard_deviation = np.std(
        pixels
    )

    score = np.clip(100 - standard_deviation, 0, 100)

    return {
        "score": round(
            float(score),
            2
        ),
        "uniformity_score": round(
            float(score),
            2
        ),
        "tone": tone,
        "lightness": round(
            average,
            2
        )
    }