from datetime import datetime


def success_response(
    message="Success",
    data=None
):
    """
    Create a standard successful response.
    """

    return {
        "success": True,
        "message": message,
        "data": data
    }


def error_response(
    message="Something went wrong",
    errors=None
):
    """
    Create a standard error response.
    """

    return {
        "success": False,
        "message": message,
        "errors": errors
    }


def get_current_timestamp():
    """
    Return current timestamp.
    """

    return datetime.now()


def format_date(
    date_value,
    format_string="%Y-%m-%d"
):
    """
    Format a datetime value.
    """

    if not date_value:
        return None

    if isinstance(
        date_value,
        str
    ):
        return date_value

    return date_value.strftime(
        format_string
    )


def clamp(
    value,
    minimum=0,
    maximum=100
):
    """
    Keep a numeric value within
    the specified range.
    """

    try:
        value = float(value)
    except (
        TypeError,
        ValueError
    ):
        return minimum

    return max(
        minimum,
        min(
            maximum,
            value
        )
    )


def round_score(
    score,
    decimals=2
):
    """
    Round a skin-analysis score.
    """

    try:
        return round(
            float(score),
            decimals
        )
    except (
        TypeError,
        ValueError
    ):
        return 0


def get_score_category(score):
    """
    Convert a numerical score into
    a readable category.
    """

    score = clamp(
        score
    )

    if score >= 80:
        return "Optimal"

    if score >= 60:
        return "Good"

    if score >= 40:
        return "Average"

    return "Needs Attention"