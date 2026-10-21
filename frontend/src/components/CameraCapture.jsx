import React, { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";

const CameraCapture = ({ onCapture, onCancel }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const startAttemptRef = useRef(0);

  const [cameraError, setCameraError] = useState("");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isStarting, setIsStarting] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    startCamera();

    return () => {
      startAttemptRef.current += 1;
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    const attempt = startAttemptRef.current + 1;
    startAttemptRef.current = attempt;
    setCameraError("");
    setIsCameraReady(false);
    setIsStarting(true);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          "Camera access requires a supported browser and a secure page (HTTPS or localhost). You can upload a photo instead."
        );
        setIsStarting(false);
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
          },
          audio: false,
        });

      if (attempt !== startAttemptRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        throw new Error("Camera preview is unavailable.");
      }

      video.srcObject = stream;
      await video.play();

      if (attempt === startAttemptRef.current) {
        setIsCameraReady(true);
        setIsStarting(false);
      }
    } catch (error) {
      if (attempt !== startAttemptRef.current) {
        return;
      }

      console.error("Camera error:", error);

      const messages = {
        NotAllowedError:
          "Camera permission was denied. Allow camera access for localhost in your browser’s site settings, then try again or upload a photo.",
        NotFoundError:
          "No camera was found. Connect a camera or upload a photo instead.",
        NotReadableError:
          "The camera could not start. Close other apps or browser tabs using it, then try again.",
        OverconstrainedError:
          "The camera could not meet the requested settings. Try another camera or upload a photo.",
        SecurityError:
          "Camera access is blocked. Open this page on localhost or HTTPS, then allow camera access.",
      };
      setCameraError(
        messages[error.name] ||
          "Unable to start the camera. Check browser permissions and that your camera is connected, then try again or upload a photo."
      );
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCameraReady(false);
      setIsStarting(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    setIsCameraReady(false);
  };

  const handleVideoReady = async () => {
    const video = videoRef.current;

    if (
      !video ||
      video.srcObject !== streamRef.current ||
      !video.videoWidth ||
      !video.videoHeight
    ) {
      return;
    }

    try {
      await video.play();
      setIsCameraReady(true);
      setIsStarting(false);
    } catch (error) {
      console.error("Camera preview error:", error);
      setCameraError("The camera preview could not start. Please try again.");
      setIsCameraReady(false);
      setIsStarting(false);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height || video.readyState < 2) {
      setCameraError(
        "Camera is still starting. Please wait a moment and try again."
      );
      return;
    }

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      width,
      height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError(
            "Unable to capture the image. Please try again."
          );
          return;
        }

        const file = new File(
          [blob],
          `skinsense-camera-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        setIsCapturing(true);

        stopCamera();

        if (onCapture) {
          onCapture(file);
        }

        setTimeout(() => {
          setIsCapturing(false);
        }, 500);
      },
      "image/jpeg",
      0.92
    );
  };

  const handleCancel = () => {
    stopCamera();

    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="card border-0 shadow-sm">

      <div className="card-body p-4">

        {/* Header */}
        <div className="mb-4">

          <h5 className="fw-bold mb-1">
            Capture Facial Image
          </h5>

          <p className="text-muted mb-0">
            Position your face inside the camera frame.
          </p>

        </div>

        {/* Camera */}
        <div
          className="position-relative bg-dark rounded-4 overflow-hidden mx-auto"
          style={{
            maxWidth: "720px",
            minHeight: "400px",
          }}
        >

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={handleVideoReady}
            onCanPlay={handleVideoReady}
            className="w-100 h-100"
            style={{
              position: "absolute",
              inset: 0,
              display: "block",
              minHeight: "400px",
              objectFit: "cover",
              transform: "scaleX(-1)",
              opacity: isCameraReady ? 1 : 0,
            }}
          />

          {!isCameraReady && (
            <div
              className="position-absolute top-0 start-0 w-100 d-flex flex-column justify-content-center align-items-center text-center text-white p-4"
              style={{
                minHeight: "400px",
              }}
            >

              <div className="mb-3 text-white-50">
                <Camera size={34} strokeWidth={1.5} aria-hidden="true" />
              </div>

              <h5 className="fw-bold">
                Camera Not Available
              </h5>

              <p className="text-white-50 mb-3">
                {cameraError || "Initializing camera..."}
              </p>

              <button
                type="button"
                className="btn btn-success"
                onClick={startCamera}
                disabled={isStarting}
              >
                {isStarting ? "Starting..." : "Try Again"}
              </button>

            </div>
          )}

          {/* Face Guide */}
          {isCameraReady && (
            <div
              className="position-absolute top-50 start-50 translate-middle"
              style={{
                width: "220px",
                height: "280px",
                border: "3px solid rgba(255,255,255,0.8)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />
          )}

          {/* Camera Status */}
          {isCameraReady && (
            <div
              className="position-absolute top-0 start-0 m-3"
            >
              <span className="badge bg-success">
                ● Camera Ready
              </span>
            </div>
          )}

        </div>

        {/* Hidden Canvas */}
        <canvas
          ref={canvasRef}
          className="d-none"
        />

        {/* Error */}
        {cameraError && isCameraReady && (
          <div
            className="alert alert-danger mt-3"
            role="alert"
          >
            {cameraError}
          </div>
        )}

        {/* Instructions */}
        <div className="alert alert-info mt-4">

          <strong>Camera Guidelines:</strong>

          <ul className="mb-0 mt-2">

            <li>
              Make sure your face is clearly visible.
            </li>

            <li>
              Look directly at the camera.
            </li>

            <li>
              Use a well-lit environment.
            </li>

            <li>
              Avoid wearing masks or covering your face.
            </li>

          </ul>

        </div>

        {/* Buttons */}
        <div className="d-flex justify-content-center gap-3 mt-4">

          <button
            type="button"
            className="btn btn-success px-4"
            disabled={!isCameraReady || isCapturing}
            onClick={captureImage}
          >
            {isCapturing
              ? "Capturing..."
              : "Capture image"}
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary px-4"
            onClick={handleCancel}
          >
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
};

export default CameraCapture;