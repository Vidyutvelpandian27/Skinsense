import cv2


def load_face_detector():
    """
    Load OpenCV Haar Cascade face detector.
    """

    cascade_path = cv2.data.haarcascades + (
        "haarcascade_frontalface_default.xml"
    )

    detector = cv2.CascadeClassifier(
        cascade_path
    )

    if detector.empty():
        raise RuntimeError(
            "Unable to load face detector."
        )

    return detector


def detect_faces(image):
    """
    Detect all faces in the image.
    """

    detector = load_face_detector()

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    faces = detector.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(80, 80)
    )

    return faces


def detect_face(image):
    """
    Return the largest detected face.
    """

    faces = detect_faces(
        image
    )

    if len(faces) == 0:
        return None

    largest_face = max(
        faces,
        key=lambda face:
            face[2] * face[3]
    )

    x, y, w, h = largest_face

    return {
        "x": int(x),
        "y": int(y),
        "width": int(w),
        "height": int(h)
    }