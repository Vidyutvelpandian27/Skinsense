import re


ALLOWED_IMAGE_EXTENSIONS = {
    "jpg",
    "jpeg",
    "png",
    "webp"
}


def validate_email(email):
    """
    Validate email address format.
    """

    if not email:
        return False

    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"

    return bool(
        re.match(
            pattern,
            email
        )
    )


def validate_password(password):
    """
    Validate password.

    Minimum:
    - 6 characters
    """

    if not password:
        return False

    return len(password) >= 6


def validate_name(name):
    """
    Validate user's name.
    """

    if not name:
        return False

    name = name.strip()

    if len(name) < 2:
        return False

    return bool(
        re.match(
            r"^[A-Za-z\s]+$",
            name
        )
    )


def validate_image_extension(filename):
    """
    Validate uploaded image extension.
    """

    if not filename:
        return False

    if "." not in filename:
        return False

    extension = filename.rsplit(
        ".",
        1
    )[1].lower()

    return extension in ALLOWED_IMAGE_EXTENSIONS


def validate_image_size(
    file,
    max_size_mb=10
):
    """
    Validate uploaded image size.

    Default maximum size: 10 MB.
    """

    if file is None:
        return False

    current_position = file.tell()

    file.seek(0, 2)

    file_size = file.tell()

    file.seek(current_position)

    max_size = (
        max_size_mb
        * 1024
        * 1024
    )

    return file_size <= max_size


def validate_registration_data(
    name,
    email,
    password
):
    """
    Validate registration form data.
    """

    errors = {}

    if not validate_name(name):
        errors["name"] = (
            "Please enter a valid name."
        )

    if not validate_email(email):
        errors["email"] = (
            "Please enter a valid email address."
        )

    if not validate_password(password):
        errors["password"] = (
            "Password must contain at least 6 characters."
        )

    return errors