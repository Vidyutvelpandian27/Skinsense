import React from "react";

const ParameterScoreCard = ({
  name = "Skin Parameter",
  value = 75,
  description = "",
  icon = "✨",
  unit = "%",
}) => {
  const numericValue = Math.min(
    100,
    Math.max(0, Number(value) || 0)
  );

  const getStatus = () => {
    if (numericValue >= 80) {
      return "Excellent";
    }

    if (numericValue >= 60) {
      return "Good";
    }

    if (numericValue >= 40) {
      return "Moderate";
    }

    return "Needs Attention";
  };

  const getProgressClass = () => {
    if (numericValue >= 80) {
      return "bg-success";
    }

    if (numericValue >= 60) {
      return "bg-primary";
    }

    if (numericValue >= 40) {
      return "bg-warning";
    }

    return "bg-danger";
  };

  const getStatusClass = () => {
    if (numericValue >= 80) {
      return "text-success";
    }

    if (numericValue >= 60) {
      return "text-primary";
    }

    if (numericValue >= 40) {
      return "text-warning";
    }

    return "text-danger";
  };

  return (
    <div className="card border-0 shadow-sm h-100">

      <div className="card-body p-4">

        {/* Header */}
        <div className="d-flex align-items-center mb-3">

          <div
            className="rounded-circle bg-success-subtle d-flex justify-content-center align-items-center me-3"
            style={{
              width: "50px",
              height: "50px",
              fontSize: "23px",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>

          <div className="flex-grow-1">

            <h6 className="fw-bold mb-1">
              {name}
            </h6>

            <span
              className={`small fw-semibold ${getStatusClass()}`}
            >
              {getStatus()}
            </span>

          </div>

        </div>

        {/* Score */}
        <div className="d-flex justify-content-between align-items-end mb-2">

          <span className="text-muted small">
            Analysis Score
          </span>

          <span className="fw-bold fs-5">
            {Math.round(numericValue)}
            {unit}
          </span>

        </div>

        {/* Progress */}
        <div
          className="progress"
          style={{
            height: "10px",
            borderRadius: "10px",
          }}
        >

          <div
            className={`progress-bar ${getProgressClass()}`}
            role="progressbar"
            style={{
              width: `${numericValue}%`,
              borderRadius: "10px",
              transition:
                "width 0.6s ease",
            }}
            aria-valuenow={numericValue}
            aria-valuemin="0"
            aria-valuemax="100"
          />

        </div>

        {/* Description */}
        {description && (
          <p className="text-muted small mt-3 mb-0">
            {description}
          </p>
        )}

      </div>

    </div>
  );
};

export default ParameterScoreCard;