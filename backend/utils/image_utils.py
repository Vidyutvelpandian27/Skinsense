import os

import cv2
import numpy as np


def is_valid_image(image_path):
    """
    Check whether an image can be loaded.
    """

    if not image_path:
        return False

    if not os.path.exists(image_path):
        return False

    image = cv2.imread(
        image_path
    )

    return image is not None


def get_image_dimensions(image):
    """
    Return image width and height.
    """

    if image is None:
        return {
            "width": 0,
            "height": 0
        }

    height, width = image.shape[:2]

    return {
        "width": int(width),
        "height": int(height)
    }


def resize_keep_aspect_ratio(
    image,
    max_width=800,
    max_height=800
):
    """
    Resize an image while maintaining
    its original aspect ratio.
    """

    if image is None:
        return None

    height, width = image.shape[:2]

    scale = min(
        max_width / width,
        max_height / height,
        1.0
    )

    new_width = int(
        width * scale
    )

    new_height = int(
        height * scale
    )

    if (
        new_width == width
        and
        new_height == height
    ):
        return image

    return cv2.resize(
        image,
        (
            new_width,
            new_height
        ),
        interpolation=cv2.INTER_AREA
    )


def convert_to_rgb(image):
    """
    Convert BGR OpenCV image to RGB.
    """

    if image is None:
        return None

    return cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB
    )


def convert_to_grayscale(image):
    """
    Convert image to grayscale.
    """

    if image is None:
        return None

    return cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )


def calculate_average_brightness(
    image
):
    """
    Calculate average brightness of an image.
    """

    if image is None:
        return 0

    gray = convert_to_grayscale(
        image
    )

    return round(
        float(np.mean(gray)),
        2
    )


def calculate_image_sharpness(
    image
):
    """
    Calculate image sharpness using
    Laplacian variance.
    """

    if image is None:
        return 0

    gray = convert_to_grayscale(
        image
    )

    sharpness = cv2.Laplacian(
        gray,
        cv2.CV_64F
    ).var()

    return round(
        float(sharpness),
        2
    )


def get_image_quality_info(
    image
):
    """
    Return basic image quality information.
    """

    dimensions = get_image_dimensions(
        image
    )

    brightness = calculate_average_brightness(
        image
    )

    sharpness = calculate_image_sharpness(
        image
    )

    return {
        "width": dimensions["width"],
        "height": dimensions["height"],
        "brightness": brightness,
        "sharpness": sharpness
    }