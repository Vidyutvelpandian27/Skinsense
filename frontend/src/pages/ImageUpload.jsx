import React, { useRef, useState } from "react";
import { Camera } from "lucide-react";
import CameraCapture from "../components/CameraCapture";

const ImageUpload = ({
  onImageSelect,
  accept = "image/jpeg,image/png,image/jpg",
  maxSize = 5,
}) => {
  const fileInputRef = useRef(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [method, setMethod] = useState("upload");

  const handleFile = (file) => {
    if (!file) {
      return;
    }

    setError("");

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > maxSize) {
      setError(`Image size must be less than ${maxSize} MB.`);
      return;
    }

    setSelectedImage(file);

    // Create preview
    const imageURL = URL.createObjectURL(file);
    setPreview(imageURL);

    // Send selected image to parent component
    if (onImageSelect) {
      onImageSelect(file);
    }
  };

  const handleFileChange = (event) => {
    handleFile(event.target.files?.[0]);
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setSelectedImage(null);
    setPreview(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (onImageSelect) {
      onImageSelect(null);
    }
  };

  const handleCapture = (file) => {
    handleFile(file);
    setMethod("upload");
  };

  if (method === "camera" && !preview) {
    return (
      <div className="w-100">
        <CameraCapture
          onCapture={handleCapture}
          onCancel={() => setMethod("upload")}
        />
      </div>
    );
  }

  return (
    <div className="w-100">

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="d-none"
        onChange={handleFileChange}
      />

      {!preview ? (
        /* Upload Area */
        <div
          className="border border-2 rounded-4 p-5 text-center bg-light"
          style={{ cursor: "pointer" }}
          onClick={handleBrowse}
        >

          <div
            className="mx-auto mb-3 rounded-3 bg-success-subtle text-success d-flex justify-content-center align-items-center"
            style={{
              width: "64px",
              height: "64px",
            }}
          >
            <Camera size={28} strokeWidth={1.6} aria-hidden="true" />
          </div>

          <h5 className="fw-semibold">Add a photo</h5>

          <p className="text-muted mb-3">
            Upload an existing photo or take one with your camera.
          </p>

          <div className="d-flex justify-content-center flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-success px-4"
              onClick={(event) => {
                event.stopPropagation();
                handleBrowse();
              }}
            >
              Upload photo
            </button>
            <button
              type="button"
              className="btn btn-outline-success px-4"
              onClick={(event) => {
                event.stopPropagation();
                setError("");
                setMethod("camera");
              }}
            >
              Take photo
            </button>
          </div>

          <p className="text-muted small mt-3 mb-0">
            JPG, JPEG or PNG • Maximum {maxSize} MB
          </p>

        </div>
      ) : (
        /* Image Preview */
        <div className="card border-0 shadow-sm">

          <div className="card-body p-4">

            <h5 className="fw-bold mb-3">
              Selected Image
            </h5>

            <div className="text-center">

              <img
                src={preview}
                alt="Selected facial image"
                className="img-fluid rounded-4"
                style={{
                  maxHeight: "400px",
                  objectFit: "contain",
                }}
              />

            </div>

            {/* File Information */}
            {selectedImage && (
              <div className="mt-3">

                <p className="mb-1 fw-semibold">
                  {selectedImage.name}
                </p>

                <small className="text-muted">
                  {(selectedImage.size / (1024 * 1024)).toFixed(2)} MB
                </small>

              </div>
            )}

            {/* Actions */}
            <div className="d-flex justify-content-center gap-2 mt-4">

              <button
                type="button"
                className="btn btn-outline-success"
                onClick={handleBrowse}
              >
                Change Photo
              </button>

              <button
                type="button"
                className="btn btn-outline-success"
                onClick={() => setMethod("camera")}
              >
                Retake photo
              </button>

              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={handleRemove}
              >
                Remove
              </button>

            </div>

          </div>

        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="alert alert-danger mt-3"
          role="alert"
        >
          {error}
        </div>
      )}

    </div>
  );
};

export default ImageUpload;