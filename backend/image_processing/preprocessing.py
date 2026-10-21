import cv2


def load_image(image_path):
    """
    Load an image from the given path.
    """

    image = cv2.imread(image_path)

    if image is None:
        raise ValueError(
            "Unable to load the image."
        )

    return image


def resize_image(
    image,
    width=800
):
    """
    Resize image while maintaining aspect ratio.
    """

    height, current_width = image.shape[:2]

    if current_width == width:
        return image

    ratio = width / current_width

    new_height = int(
        height * ratio
    )

    return cv2.resize(
        image,
        (width, new_height),
        interpolation=cv2.INTER_AREA
    )


def reduce_noise(image):
    """
    Reduce image noise using Gaussian blur.
    """

    return cv2.GaussianBlur(
        image,
        (5, 5),
        0
    )


def improve_contrast(image):
    """
    Improve contrast using LAB color space.
    """

    lab = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2LAB
    )

    l_channel, a_channel, b_channel = cv2.split(
        lab
    )

    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )

    l_channel = clahe.apply(
        l_channel
    )

    enhanced = cv2.merge(
        (
            l_channel,
            a_channel,
            b_channel
        )
    )

    return cv2.cvtColor(
        enhanced,
        cv2.COLOR_LAB2BGR
    )


def preprocess_image(image_path):
    """
    Complete preprocessing pipeline.
    """

    image = load_image(
        image_path
    )

    image = resize_image(
        image
    )

    image = reduce_noise(
        image
    )

    image = improve_contrast(
        image
    )

    return image