import cv2
import numpy as np


def crop_face(
    image,
    face
):
    """
    Crop the detected face from the image.
    """

    x = face["x"]
    y = face["y"]
    w = face["width"]
    h = face["height"]

    return image[
        y:y + h,
        x:x + w
    ]


def create_skin_mask(face_image):
    """
    Create a basic skin mask using HSV and YCrCb.
    """

    hsv = cv2.cvtColor(
        face_image,
        cv2.COLOR_BGR2HSV
    )

    ycrcb = cv2.cvtColor(
        face_image,
        cv2.COLOR_BGR2YCrCb
    )

    lower_hsv = np.array(
        [0, 20, 40],
        dtype=np.uint8
    )

    upper_hsv = np.array(
        [25, 255, 255],
        dtype=np.uint8
    )

    hsv_mask = cv2.inRange(
        hsv,
        lower_hsv,
        upper_hsv
    )

    lower_ycrcb = np.array(
        [0, 135, 85],
        dtype=np.uint8
    )

    upper_ycrcb = np.array(
        [255, 180, 135],
        dtype=np.uint8
    )

    ycrcb_mask = cv2.inRange(
        ycrcb,
        lower_ycrcb,
        upper_ycrcb
    )

    mask = cv2.bitwise_and(
        hsv_mask,
        ycrcb_mask
    )

    kernel = np.ones(
        (5, 5),
        np.uint8
    )

    mask = cv2.morphologyEx(
        mask,
        cv2.MORPH_OPEN,
        kernel
    )

    mask = cv2.morphologyEx(
        mask,
        cv2.MORPH_CLOSE,
        kernel
    )

    return mask


def extract_skin_region(
    image,
    face
):
    """
    Extract face and skin mask.
    """

    face_image = crop_face(
        image,
        face
    )

    skin_mask = create_skin_mask(
        face_image
    )

    skin_region = cv2.bitwise_and(
        face_image,
        face_image,
        mask=skin_mask
    )

    return {
        "face": face_image,
        "mask": skin_mask,
        "skin": skin_region
    }