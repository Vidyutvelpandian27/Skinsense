import React, { useRef, useState } from "react";

const ImageUploader = ({ onImageSelect }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  const maxFileSize = 5 * 1024 * 1024; // 5 MB

  const validateFile = (file) => {
    setError("");

    if (!file) {
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please select a JPG, JPEG, PNG, or WEBP image."
      );
      return false;
    }

    if (file.size > maxFileSize) {
      setError("Image size must be less than 5 MB.");
      return false;
    }

    return true;
  };

  const handleFile = (file) => {
    if (!validateFile(file)) {
      return;
    }

    onImageSelect(file);
  };

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="card border-0 shadow-sm">

      <div className="card-body p-4">

        {/* Header */}
        <div className="mb-4">

          <h5 className="fw-bold mb-1">
            Upload Facial Image
          </h5>

          <p className="text-muted mb-0">
            Upload a clear facial image for skin analysis.
          </p>

        </div>

        {/* Upload Area */}
        <div
          className={`border rounded-4 text-center p-5 ${
            dragActive
              ? "border-success bg-success-subtle"
              : "border-secondary-subtle bg-light"
          }`}
          style={{
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onClick={openFileSelector}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >

          {/* Icon */}
          <div
            className="mx-auto mb-3 rounded-circle bg-success-subtle d-flex justify-content-center align-items-center"
            style={{
              width: "75px",
              height: "75px",
              fontSize: "35px",
            }}
          >
            📤
          </div>

          <h5 className="fw-bold">
            {dragActive
              ? "Drop your image here"
              : "Upload your facial image"}
          </h5>

          <p className="text-muted mb-3">
            Drag and drop your image here or click to browse.
          </p>

          <button
            type="button"
            className="btn btn-success px-4"
            onClick={(event) => {
              event.stopPropagation();
              openFileSelector();
            }}
          >
            Choose Image
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="d-none"
            onChange={handleInputChange}
          />

          <div className="mt-3">

            <small className="text-muted">
              Supported formats: JPG, JPEG, PNG, WEBP
            </small>

            <br />

            <small className="text-muted">
              Maximum file size: 5 MB
            </small>

          </div>

        </div>

        {/* Error */}
        {error && (
          <div
            className="alert alert-danger mt-3 mb-0"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Image Guidelines */}
        <div className="alert alert-info mt-4 mb-0">

          <strong>For better results:</strong>

          <ul className="mb-0 mt-2">

            <li>
              Use a clear, well-lit facial image.
            </li>

            <li>
              Keep your face directly facing the camera.
            </li>

            <li>
              Avoid heavy filters or image effects.
            </li>

            <li>
              Make sure the face is clearly visible.
            </li>

          </ul>

        </div>

      </div>

    </div>
  );
};

export default ImageUploader;