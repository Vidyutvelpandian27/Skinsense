import React from "react";

const CircularScore = ({
  score = 85,
  label = "Skin Health Score",
  size = 180,
}) => {
  const numericScore = Math.min(
    100,
    Math.max(0, Number(score) || 0)
  );

  const radius = 70;
  const strokeWidth = 12;
  const center = 90;

  const circumference =
    2 * Math.PI * radius;

  const progress =
    (numericScore / 100) * circumference;

  const offset =
    circumference - progress;

  const getStatus = () => {
    if (numericScore >= 80) {
      return "Optimal";
    }

    if (numericScore >= 60) {
      return "Good";
    }

    if (numericScore >= 40) {
      return "Average";
    }

    return "Needs Attention";
  };

  const getStatusClass = () => {
    if (numericScore >= 80) {
      return "text-success";
    }

    if (numericScore >= 60) {
      return "text-primary";
    }

    if (numericScore >= 40) {
      return "text-warning";
    }

    return "text-danger";
  };

  return (
    <div className="text-center">

      {/* Circular Chart */}
      <div
        className="position-relative mx-auto"
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      >

        <svg
          width={size}
          height={size}
          viewBox="0 0 180 180"
          style={{
            transform: "rotate(-90deg)",
          }}
        >

          {/* Background */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#e9ecef"
            strokeWidth={strokeWidth}
          />

          {/* Score Progress */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#198754"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition:
                "stroke-dashoffset 0.8s ease",
            }}
          />

        </svg>

        {/* Score Text */}
        <div
          className="position-absolute top-50 start-50 translate-middle"
          style={{
            width: "100%",
          }}
        >

          <div className="fw-bold text-success display-6">
            {numericScore.toFixed(1)}
          </div>

          <small className="text-muted">
            / 100
          </small>

        </div>

      </div>

      {/* Label */}
      <h5 className="fw-bold mt-3 mb-1">
        {label}
      </h5>

      {/* Status */}
      <span
        className={`fw-semibold ${getStatusClass()}`}
      >
        {getStatus()}
      </span>

    </div>
  );
};

export default CircularScore;