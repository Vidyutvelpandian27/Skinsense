import React from "react";

const SkinScore = ({
  score = 85,
  title = "Overall Skin Health Score",
}) => {
  const normalizedScore = Math.min(
    100,
    Math.max(0, Number(score) || 0)
  );

  const getScoreStatus = () => {
    if (normalizedScore >= 80) {
      return {
        label: "Optimal",
        description:
          "Your visible skin characteristics indicate good overall skin condition.",
        className: "text-success",
      };
    }

    if (normalizedScore >= 60) {
      return {
        label: "Good",
        description:
          "Your skin condition is generally good with some areas that may need attention.",
        className: "text-primary",
      };
    }

    if (normalizedScore >= 40) {
      return {
        label: "Average",
        description:
          "Some visible skin characteristics may require additional care.",
        className: "text-warning",
      };
    }

    return {
      label: "Needs Attention",
      description:
        "Several visible characteristics may benefit from improved skincare.",
      className: "text-danger",
    };
  };

  const status = getScoreStatus();

  return (
    <div className="card border-0 shadow-sm h-100">

      <div className="card-body p-4 text-center">

        {/* Title */}
        <h5 className="fw-bold mb-4">
          {title}
        </h5>

        {/* Score Circle */}
        <div
          className="mx-auto rounded-circle d-flex flex-column justify-content-center align-items-center border border-5 border-success"
          style={{
            width: "190px",
            height: "190px",
          }}
        >
          <span
            className={`display-4 fw-bold ${status.className}`}
          >
            {normalizedScore}
          </span>

          <span className="text-muted">
            / 100
          </span>
        </div>

        {/* Status */}
        <h4
          className={`fw-bold mt-4 ${status.className}`}
        >
          {status.label}
        </h4>

        {/* Description */}
        <p className="text-muted mb-0">
          {status.description}
        </p>

      </div>

    </div>
  );
};

export default SkinScore;