import React, { useEffect, useState } from "react";

const ImagePreview = ({
  image,
  onRemove,
  onContinue,
}) => {
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageInfo, setImageInfo] = useState(null);

  useEffect(() => {
    if (!image) {
      setPreviewUrl("");
      setImageInfo(null);
      return;
    }

    let objectUrl = null;

    if (image instanceof File || image instanceof Blob) {
      objectUrl = URL.createObjectURL(image);
      setPreviewUrl(objectUrl);
    } else if (typeof image === "string") {
      setPreviewUrl(image);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [image]);

  const handleImageLoad = (event) => {
    const { naturalWidth, naturalHeight } = event.target;

    setImageInfo({
      width: naturalWidth,
      height: naturalHeight,
    });
  };

  const getFileSize = () => {
    if (!image?.size) {
      return null;
    }

    const sizeInMB = image.size / (1024 * 1024);

    return `${sizeInMB.toFixed(2)} MB`;
  };

  if (!image) {
    return (
      <div className="card border-0 shadow-sm">

        <div className="card-body p-5 text-center">

          <div
            className="mx-auto mb-3 rounded-circle bg-light d-flex justify-content-center align-items-center"
            style={{
              width: "80px",
              height: "80px",
              fontSize: "35px",
            }}
          >
            🖼️
          </div>

          <h5 className="fw-bold">
            No Image Selected
          </h5>

          <p className="text-muted mb-0">
            Upload or capture a facial image to preview it here.
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm">

      <div className="card-body p-4">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>
            <h5 className="fw-bold mb-1">
              Image Preview
            </h5>

            <p className="text-muted mb-0">
              Review your image before starting the analysis.
            </p>
          </div>

          <span className="badge bg-success">
            Ready
          </span>

        </div>

        {/* Image */}
        <div className="text-center">

          <div
            className="position-relative mx-auto bg-light rounded-4 overflow-hidden"
            style={{
              maxWidth: "600px",
            }}
          >

            {previewUrl && (
              <img
                src={previewUrl}
                alt="Selected facial image"
                className="img-fluid"
                onLoad={handleImageLoad}
                style={{
                  maxHeight: "500px",
                  width: "100%",
                  objectFit: "contain",
                }}
              />
            )}

          </div>

        </div>

        {/* Image Information */}
        <div className="row g-3 mt-4">

          {imageInfo && (
            <div className="col-md-4">

              <div className="bg-light rounded-3 p-3 text-center">

                <small className="text-muted d-block">
                  Resolution
                </small>

                <strong>
                  {imageInfo.width} × {imageInfo.height}
                </strong>

              </div>

            </div>
          )}

          {image?.type && (
            <div className="col-md-4">

              <div className="bg-light rounded-3 p-3 text-center">

                <small className="text-muted d-block">
                  Format
                </small>

                <strong>
                  {image.type.split("/")[1]?.toUpperCase()}
                </strong>

              </div>

            </div>
          )}

          {getFileSize() && (
            <div className="col-md-4">

              <div className="bg-light rounded-3 p-3 text-center">

                <small className="text-muted d-block">
                  File Size
                </small>

                <strong>
                  {getFileSize()}
                </strong>

              </div>

            </div>
          )}

        </div>

        {/* Quality Guidelines */}
        <div className="alert alert-info mt-4 mb-0">

          <strong>Before continuing:</strong>

          <ul className="mb-0 mt-2">

            <li>
              Make sure the face is clearly visible.
            </li>

            <li>
              Avoid blurry or extremely dark images.
            </li>

            <li>
              Keep the face reasonably centered.
            </li>

            <li>
              Avoid heavy filters or image modifications.
            </li>

          </ul>

        </div>

        {/* Actions */}
        <div className="d-flex justify-content-center gap-3 mt-4">

          <button
            type="button"
            className="btn btn-outline-danger px-4"
            onClick={onRemove}
          >
            Remove Image
          </button>

          <button
            type="button"
            className="btn btn-success px-4"
            onClick={onContinue}
          >
            Continue Analysis
          </button>

        </div>

      </div>

    </div>
  );
};

export default ImagePreview;