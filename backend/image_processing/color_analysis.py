import cv2
import numpy as np


def get_skin_pixels(
    image,
    mask
):
    """
    Get pixels belonging to the skin mask.
    """

    pixels = image[
        mask > 0
    ]

    return pixels


def calculate_average_color(
    image,
    mask
):
    """
    Calculate average BGR color.
    """

    pixels = get_skin_pixels(
        image,
        mask
    )

    if len(pixels) == 0:
        return {
            "blue": 0,
            "green": 0,
            "red": 0
        }

    average = np.mean(
        pixels,
        axis=0
    )

    return {
        "blue": round(
            float(average[0]),
            2
        ),
        "green": round(
            float(average[1]),
            2
        ),
        "red": round(
            float(average[2]),
            2
        )
    }


def calculate_brightness(
    image,
    mask
):
    """
    Calculate average brightness.
    """

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    pixels = gray[
        mask > 0
    ]

    if len(pixels) == 0:
        return 0

    return round(
        float(np.mean(pixels)),
        2
    )


def analyze_color(
    image,
    mask
):
    """
    Complete color analysis.
    """

    color = calculate_average_color(
        image,
        mask
    )

    brightness = calculate_brightness(
        image,
        mask
    )

    return {
        "average_color": color,
        "brightness": brightness
    }