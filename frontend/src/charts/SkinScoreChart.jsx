import React from "react";

const SkinScoreChart = ({ score = 85 }) => {
  const normalizedScore = Math.min(
    100,
    Math.max(0, Number(score) || 0)
  );

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (normalizedScore / 100) * circumference;

  const getStatus = () => {
    if (normalizedScore >= 80) {
      return "Excellent";
    }

    if (normalizedScore >= 60) {
      return "Good";
    }

    if (normalizedScore >= 40) {
      return "Moderate";
    }

    return "Needs Attention";
  };

  return (
    <div className="card border-0 shadow-sm h-100">

      <div className="card-body p-4">

        <h5 className="fw-bold mb-1">
          Skin Health Score
        </h5>

        <p className="text-muted mb-4">
          Overall score based on your visible skin parameters.
        </p>

        <div className="d-flex justify-content-center">

          <div
            className="position-relative"
            style={{
              width: "190px",
              height: "190px",
            }}
          >

            <svg
              width="190"
              height="190"
              viewBox="0 0 190 190"
              style={{
                transform: "rotate(-90deg)",
              }}
            >

              {/* Background Circle */}
              <circle
                cx="95"
                cy="95"
                r={radius}
                fill="none"
                stroke="#e9ecef"
                strokeWidth="14"
              />

              {/* Progress Circle */}
              <circle
                cx="95"
                cy="95"
                r={radius}
                fill="none"
                stroke="#198754"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={
                  circumference - progress
                }
              />

            </svg>

            {/* Score */}
            <div
              className="position-absolute top-50 start-50 translate-middle text-center"
            >
              <h2 className="fw-bold text-success mb-0">
                {normalizedScore}
              </h2>

              <small className="text-muted">
                / 100
              </small>
            </div>

          </div>

        </div>

        {/* Status */}
        <div className="text-center mt-3">

          <h5 className="fw-bold text-success mb-1">
            {getStatus()}
          </h5>

          <p className="text-muted small mb-0">
            Your current overall skin health score.
          </p>

        </div>

      </div>

    </div>
  );
};

export default SkinScoreChart;