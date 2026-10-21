import React from "react";

const MainConcerns = ({
  concerns = [],
}) => {
  const defaultConcerns = [
    {
      id: 1,
      name: "Dryness",
      severity: "Moderate",
      description:
        "Your skin may need additional hydration and moisture support.",
      icon: "💧",
    },
    {
      id: 2,
      name: "Wrinkles",
      severity: "Moderate",
      description:
        "Some visible fine lines or wrinkle patterns were detected.",
      icon: "〰️",
    },
    {
      id: 3,
      name: "Dark Spots",
      severity: "Low",
      description:
        "A small amount of visible pigmentation or dark spots was detected.",
      icon: "🟤",
    },
  ];

  const concernList =
    concerns.length > 0 ? concerns : defaultConcerns;

  const getSeverityClass = (severity) => {
    const value = String(severity).toLowerCase();

    if (value === "low" || value === "mild") {
      return "bg-success";
    }

    if (value === "moderate" || value === "medium") {
      return "bg-warning text-dark";
    }

    if (value === "high" || value === "severe") {
      return "bg-danger";
    }

    return "bg-secondary";
  };

  return (
    <div className="card border-0 shadow-sm">

      <div className="card-body p-4">

        {/* Header */}
        <div className="mb-4">
          <h5 className="fw-bold mb-1">
            Main Concerns
          </h5>

          <p className="text-muted mb-0">
            The main visible skin characteristics that may need attention.
          </p>
        </div>

        {/* Empty State */}
        {concernList.length === 0 ? (
          <div className="text-center py-4">

            <div className="fs-1 mb-2">
              ✨
            </div>

            <h6 className="fw-bold">
              No Major Concerns
            </h6>

            <p className="text-muted mb-0">
              No significant visible concerns were identified.
            </p>

          </div>
        ) : (
          <div className="row g-3">

            {concernList.map((concern, index) => (

              <div
                className="col-md-6 col-lg-4"
                key={concern.id || index}
              >

                <div className="border rounded-3 p-3 h-100">

                  {/* Icon and Severity */}
                  <div className="d-flex justify-content-between align-items-start mb-3">

                    <div
                      className="rounded-circle bg-success-subtle d-flex justify-content-center align-items-center"
                      style={{
                        width: "50px",
                        height: "50px",
                        fontSize: "22px",
                      }}
                    >
                      {concern.icon || "⚠️"}
                    </div>

                    <span
                      className={`badge ${getSeverityClass(
                        concern.severity
                      )}`}
                    >
                      {concern.severity || "Unknown"}
                    </span>

                  </div>

                  {/* Concern Name */}
                  <h6 className="fw-bold mb-2">
                    {concern.name}
                  </h6>

                  {/* Description */}
                  <p className="text-muted small mb-0">
                    {concern.description}
                  </p>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>

    </div>
  );
};

export default MainConcerns;