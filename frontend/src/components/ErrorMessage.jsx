import React from "react";

const ErrorMessage = ({
  message = "Something went wrong. Please try again.",
  title = "Error",
  onRetry,
  className = "",
}) => {
  return (
    <div
      className={`alert alert-danger d-flex align-items-start ${className}`}
      role="alert"
    >
      {/* Error Icon */}
      <div className="me-3 fs-4">
        ⚠️
      </div>

      {/* Error Content */}
      <div className="flex-grow-1">
        <h6 className="alert-heading fw-bold mb-1">
          {title}
        </h6>

        <p className="mb-2">
          {message}
        </p>

        {onRetry && (
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={onRetry}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;