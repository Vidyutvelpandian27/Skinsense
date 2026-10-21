def calculate_overall_score(
    parameters
):
    """
    Calculate the overall skin health score.

    Each parameter is expected to be a score
    from 0 to 100, where 100 represents a
    better measured result.
    """

    weights = {
        "redness_score": 0.135,
        "dark_spots_score": 0.135,
        "wrinkles_score": 0.135,
        "texture_score": 0.135,
        "oiliness_score": 0.09,
        "dryness_score": 0.135,
        "skin_tone_score": 0.135,
        "pimple_score": 0.10
    }

    total = 0

    for parameter, weight in weights.items():

        value = parameters.get(
            parameter,
            0
        )

        try:
            value = float(value)
        except (
            TypeError,
            ValueError
        ):
            value = 0

        value = max(
            0,
            min(
                100,
                value
            )
        )

        total += value * weight

    return round(
        total,
        2
    )


def get_score_category(
    score
):
    """
    Convert numeric score into a category.
    """

    score = float(score)

    if score >= 80:
        return "Optimal"

    if score >= 60:
        return "Good"

    if score >= 40:
        return "Average"

    return "Poor"


def calculate_parameter_scores(
    results
):
    """
    Extract standard parameter scores from
    individual DIP analysis results.
    """

    return {
        "redness_score": results.get(
            "redness",
            {}
        ).get(
            "score",
            0
        ),

        "dark_spots_score": results.get(
            "dark_spots",
            {}
        ).get(
            "score",
            0
        ),

        "wrinkles_score": results.get(
            "wrinkles",
            {}
        ).get(
            "score",
            0
        ),

        "texture_score": results.get(
            "texture",
            {}
        ).get(
            "score",
            0
        ),

        "oiliness_score": results.get(
            "oiliness",
            {}
        ).get(
            "score",
            0
        ),

        "dryness_score": results.get(
            "dryness",
            {}
        ).get(
            "score",
            0
        ),

        "skin_tone_score": results.get(
            "skin_tone",
            {}
        ).get("score", 0),

        "tone_uniformity_score": results.get(
            "skin_tone",
            {}
        ).get("uniformity_score", 0),

        "pimple_score": results.get("pimples", {}).get("score", 0)
    }