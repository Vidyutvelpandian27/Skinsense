import os
import uuid
from datetime import datetime, timezone

import cv2
import numpy as np

from werkzeug.utils import secure_filename

from database.db import as_id, get_collection, new_id, serialize
from config import config
from image_processing.score_calculator import get_score_category


def allowed_file(filename):
    """Check whether uploaded image has a valid extension."""

    if not filename or "." not in filename:
        return False

    extension = filename.rsplit(".", 1)[1].lower()

    return extension in config.ALLOWED_EXTENSIONS


def save_uploaded_image(image):
    """Save uploaded image to the uploads folder."""

    if not allowed_file(image.filename):
        raise ValueError(
            "Only JPG, JPEG, PNG and WEBP images are allowed."
        )

    upload_folder = config.UPLOAD_FOLDER

    os.makedirs(
        upload_folder,
        exist_ok=True
    )

    original_name = secure_filename(
        image.filename
    )

    extension = original_name.rsplit(
        ".",
        1
    )[1].lower()

    filename = f"{uuid.uuid4().hex}.{extension}"

    file_path = os.path.join(
        upload_folder,
        filename
    )

    image.save(file_path)

    return file_path


def create_analysis_record(
    user_id,
    image_path
):
    """Create an analysis record before processing."""

    analysis_id = new_id()
    now = datetime.now(timezone.utc)
    get_collection("reports").insert_one({
        "_id": as_id(analysis_id),
        "user_id": str(user_id),
        "image_path": image_path,
        "analysis_status": "Processing",
        "created_at": now,
        "updated_at": now,
        "parameters": {},
        "concerns": [],
    })
    return analysis_id


def create_analysis_visualization(
    image_path,
    processed_image,
    face,
    skin_mask,
    pimple_mask=None
):
    """Save the original image with sampled detector regions marked."""

    visualization = processed_image.copy()
    x = face["x"]
    y = face["y"]
    width = face["width"]
    height = face["height"]
    face_image = processed_image[y:y + height, x:x + width]
    gray = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(face_image, cv2.COLOR_BGR2HSV)
    _, green, red = cv2.split(face_image)
    laplacian = np.abs(cv2.Laplacian(gray, cv2.CV_32F))
    skin_values = gray[skin_mask > 0]
    texture_threshold = np.percentile(laplacian[skin_mask > 0], 75) if skin_values.size else 0

    masks = [
        ("skin_tone", "Skin tone", skin_mask > 0, (0, 220, 0)),
        ("tone_uniformity", "Tone uniformity", skin_mask > 0, (255, 255, 0)),
        ("redness", "Redness", ((red.astype(int) - green.astype(int)) > 18) & (skin_mask > 0), (0, 0, 255)),
        ("dark_spots", "Dark spots", (gray < np.mean(skin_values) * 0.65) & (skin_mask > 0), (255, 80, 0)),
        ("wrinkles", "Wrinkles", (cv2.Canny(gray, 40, 100) > 0) & (skin_mask > 0), (255, 0, 255)),
        ("texture", "Texture", (laplacian >= texture_threshold) & (skin_mask > 0), (180, 0, 255)),
        ("oiliness", "Oiliness", (hsv[:, :, 2] > 205) & (hsv[:, :, 1] < 100) & (skin_mask > 0), (0, 215, 255)),
        ("dryness", "Dryness", (hsv[:, :, 2] < 120) & (skin_mask > 0), (80, 180, 255)),
        ("pimples", "Pimples", (pimple_mask > 0) if pimple_mask is not None else np.zeros_like(skin_mask, dtype=bool), (0, 0, 255)),
    ]

    parameter_paths = {}

    cv2.rectangle(
        visualization,
        (x, y),
        (x + width, y + height),
        (0, 255, 0),
        2
    )

    for key, label, parameter_mask, color in masks:
        parameter_image = processed_image.copy()
        cv2.rectangle(parameter_image, (x, y), (x + width, y + height), color, 2)
        coordinates = np.argwhere(parameter_mask)
        step = max(1, len(coordinates) // 120) if len(coordinates) else 1
        for point_y, point_x in coordinates[::step]:
            point = (x + int(point_x), y + int(point_y))
            cv2.circle(parameter_image, point, 4, color, -1)
        cv2.putText(parameter_image, label, (x, max(y - 12, 24)), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2, cv2.LINE_AA)
        parameter_path = os.path.splitext(image_path)[0] + f"_{key}.jpg"
        cv2.imwrite(parameter_path, parameter_image)
        parameter_paths[key] = parameter_path

        coordinates = np.argwhere(parameter_mask)
        if coordinates.size == 0:
            continue

        step = max(1, len(coordinates) // 80)
        for point_y, point_x in coordinates[::step]:
            cv2.circle(
                visualization,
                (x + int(point_x), y + int(point_y)),
                3,
                color,
                -1
            )

    annotated_path = os.path.splitext(image_path)[0] + "_annotated.jpg"
    cv2.imwrite(annotated_path, visualization)
    return {
        "annotated": annotated_path,
        "parameters": parameter_paths
    }


def analyze_skin(image, user_id):
    """
    Main SkinSense skin-analysis service.

    Processing flow:

    Image
        ↓
    Preprocessing
        ↓
    Image Quality
        ↓
    Face Detection
        ↓
    Skin Extraction
        ↓
    Color Analysis
        ↓
    Skin Parameter Detection
        ↓
    Overall Score
        ↓
    MongoDB
    """

    image_path = save_uploaded_image(
        image
    )

    analysis_id = create_analysis_record(
        user_id,
        image_path
    )

    try:

        # -------------------------------------------------
        # IMPORT IMAGE PROCESSING MODULES
        # -------------------------------------------------

        from image_processing.preprocessing import (
            preprocess_image
        )

        from image_processing.image_quality import (
            assess_image_quality
        )

        from image_processing.face_detection import (
            detect_face
        )

        from image_processing.skin_extraction import (
            extract_skin_region
        )

        from image_processing.color_analysis import (
            analyze_color
        )

        from image_processing.redness_detection import (
            detect_redness
        )

        from image_processing.dark_spot_detection import (
            detect_dark_spots
        )

        from image_processing.wrinkle_detection import (
            detect_wrinkles
        )

        from image_processing.texture_analysis import (
            analyze_texture
        )

        from image_processing.oiliness_detection import (
            detect_oiliness
        )

        from image_processing.dryness_detection import (
            detect_dryness
        )

        from image_processing.skin_tone import (
            classify_skin_tone
        )

        from image_processing.score_calculator import (
            calculate_parameter_scores,
            calculate_overall_score
        )

        # -------------------------------------------------
        # STEP 1: PREPROCESS IMAGE
        # -------------------------------------------------

        processed_image = preprocess_image(
            image_path
        )

        # -------------------------------------------------
        # STEP 2: CHECK IMAGE QUALITY
        # -------------------------------------------------

        quality = assess_image_quality(
            processed_image
        )

        if isinstance(quality, dict):
            quality_score = quality.get(
                "score",
                0
            )
        else:
            quality_score = float(
                quality or 0
            )

        # -------------------------------------------------
        # STEP 3: FACE DETECTION
        # -------------------------------------------------

        face = detect_face(
            processed_image
        )

        if face is None:
            raise ValueError(
                "No face detected in the uploaded image."
            )

        # -------------------------------------------------
        # STEP 4: SKIN REGION EXTRACTION
        # -------------------------------------------------

        skin_region = extract_skin_region(
            processed_image,
            face
        )

        face_image = skin_region["face"]
        skin_mask = skin_region["mask"]

        # -------------------------------------------------
        # STEP 5: COLOR ANALYSIS
        # -------------------------------------------------

        color_result = analyze_color(
            face_image,
            skin_mask
        )

        # -------------------------------------------------
        # STEP 6: REDNESS DETECTION
        # -------------------------------------------------

        redness_result = detect_redness(
            face_image,
            skin_mask
        )

        # -------------------------------------------------
        # STEP 7: DARK SPOT DETECTION
        # -------------------------------------------------

        dark_spot_result = detect_dark_spots(
            face_image,
            skin_mask
        )

        # -------------------------------------------------
        # STEP 8: WRINKLE DETECTION
        # -------------------------------------------------

        wrinkle_result = detect_wrinkles(
            face_image,
            skin_mask
        )

        # -------------------------------------------------
        # STEP 9: TEXTURE ANALYSIS
        # -------------------------------------------------

        texture_result = analyze_texture(
            face_image,
            skin_mask
        )

        # -------------------------------------------------
        # STEP 10: OILINESS DETECTION
        # -------------------------------------------------

        oiliness_result = detect_oiliness(
            face_image,
            skin_mask
        )

        # -------------------------------------------------
        # STEP 11: DRYNESS DETECTION
        # -------------------------------------------------

        dryness_result = detect_dryness(
            face_image,
            skin_mask
        )

        # -------------------------------------------------
        # STEP 12: SKIN TONE ANALYSIS
        # -------------------------------------------------

        skin_tone_result = classify_skin_tone(
            face_image,
            skin_mask
        )

        from image_processing.pimple_detection import detect_pimples

        pimple_result = detect_pimples(
            face_image,
            skin_mask
        )

        annotated_image_path = create_analysis_visualization(
            image_path,
            processed_image,
            face,
            skin_mask,
            pimple_result["mask"]
        )

        # -------------------------------------------------
        # STEP 13: COMBINE ALL RESULTS
        # -------------------------------------------------

        results = {
            "color": color_result,
            "redness": redness_result,
            "dark_spots": dark_spot_result,
            "wrinkles": wrinkle_result,
            "texture": texture_result,
            "oiliness": oiliness_result,
            "dryness": dryness_result,
            "skin_tone": skin_tone_result,
            "pimples": pimple_result
        }

        # -------------------------------------------------
        # STEP 14: CALCULATE PARAMETER SCORES
        # -------------------------------------------------

        parameters = calculate_parameter_scores(
            results
        )

        # -------------------------------------------------
        # STEP 15: CALCULATE OVERALL SCORE
        # -------------------------------------------------

        overall_score = calculate_overall_score(
            parameters
        )

        save_detected_concerns(
            analysis_id,
            parameters
        )

        # -------------------------------------------------
        # STEP 16: DETERMINE BASIC SKIN TYPE
        # -------------------------------------------------

        skin_type = determine_skin_type(
            oiliness_result,
            dryness_result
        )

        # -------------------------------------------------
        # STEP 17: UPDATE ANALYSIS RECORD
        # -------------------------------------------------

        get_collection("reports").update_one(
            {"_id": as_id(analysis_id)},
            {"$set": {
                "overall_score": overall_score,
                "skin_type": skin_type,
                "image_quality_score": quality_score,
                "overall_status": get_score_category(overall_score),
                "analysis_status": "Completed",
                "updated_at": datetime.now(timezone.utc),
            }}
        )

        # -------------------------------------------------
        # STEP 18: SAVE SKIN PARAMETERS
        # -------------------------------------------------

        save_analysis_results(
            analysis_id,
            parameters
        )

        # -------------------------------------------------
        # STEP 19: RETURN COMPLETE ANALYSIS
        # -------------------------------------------------

        return get_analysis(
            analysis_id
        )

    except Exception as error:

        # -------------------------------------------------
        # MARK ANALYSIS AS FAILED
        # -------------------------------------------------

        get_collection("reports").update_one(
            {"_id": as_id(analysis_id)},
            {"$set": {
                "analysis_status": "Failed",
                "error_message": str(error),
                "updated_at": datetime.now(timezone.utc),
            }}
        )

        raise error


def determine_skin_type(
    oiliness_result,
    dryness_result
):
    """
    Determine basic skin type from oiliness
    and dryness measurements.
    """

    oiliness = oiliness_result.get(
        "oiliness_percentage",
        0
    )

    dryness = dryness_result.get(
        "dryness_percentage",
        0
    )

    if oiliness >= 30 and dryness < 30:
        return "Oily"

    if dryness >= 30 and oiliness < 20:
        return "Dry"

    if oiliness >= 20 and dryness >= 20:
        return "Combination"

    return "Normal"


def save_detected_concerns(analysis_id, parameters):
    """Create actionable concern records for low parameter scores."""

    parameter_concerns = {
        "redness_score": "Redness",
        "dark_spots_score": "Dark Spots",
        "wrinkles_score": "Wrinkles",
        "texture_score": "Texture",
        "oiliness_score": "Oiliness",
        "dryness_score": "Dryness",
        "skin_tone_score": "Skin Tone",
        "tone_uniformity_score": "Tone Uniformity",
        "pimple_score": "Pimples",
    }

    concerns = []
    for parameter_key, concern_name in parameter_concerns.items():
        try:
            score = float(parameters.get(parameter_key, 100))
        except (TypeError, ValueError):
            continue

        if score >= 60:
            continue

        concerns.append({
            "id": concern_name.lower().replace(" ", "-"),
            "name": concern_name,
            "description": f"Visible {concern_name.lower()} indicators detected during analysis.",
            "severity": "High" if score < 40 else "Medium",
            "score": score,
        })
    get_collection("reports").update_one(
        {"_id": as_id(analysis_id)},
        {"$set": {"concerns": concerns}}
    )


def save_analysis_results(report_id, parameters):
    """Store all skin parameter scores inside the report document."""
    get_collection("reports").update_one(
        {"_id": as_id(report_id)},
        {"$set": {"parameters": parameters}}
    )


def get_analysis(analysis_id, user_id=None):
    """Return a normalized report using the existing frontend response shape."""

    from image_processing.score_calculator import get_score_category

    query = {"_id": as_id(analysis_id)}
    if user_id is not None:
        query["user_id"] = str(user_id)
    analysis = serialize(get_collection("reports").find_one(query))
    if not analysis:
        return None

    analysis["score_category"] = get_score_category(analysis.get("overall_score", 0) or 0)
    image_path = analysis.get("image_path")
    analysis["image_url"] = (
        "/api/analysis/images/" + os.path.basename(image_path)
        if image_path else None
    )
    image_root = os.path.splitext(image_path)[0] if image_path else None
    annotated_path = image_root + "_annotated.jpg" if image_root else None
    analysis["annotated_image_url"] = (
        "/api/analysis/images/" + os.path.basename(annotated_path)
        if annotated_path and os.path.exists(annotated_path) else None
    )
    image_keys = (
        "redness", "dark_spots", "wrinkles", "texture", "oiliness",
        "dryness", "skin_tone", "tone_uniformity", "pimples",
    )
    analysis["parameter_image_urls"] = {
        key: "/api/analysis/images/" + os.path.basename(f"{image_root}_{key}.jpg")
        for key in image_keys
        if image_root and os.path.exists(f"{image_root}_{key}.jpg")
    }
    parameters = analysis.get("parameters", {})
    analysis["concerns"] = analysis.get("concerns", [])
    from services.recommendation_service import get_recommendations_for_parameters
    analysis["recommendations"] = get_recommendations_for_parameters(parameters)
    return analysis