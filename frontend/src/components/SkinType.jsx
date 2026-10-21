import React from "react";

const SkinType = ({
  skinType = "Normal",
  description,
}) => {
  const skinTypes = {
    Normal: {
      icon: "✨",
      description:
        "Your skin appears to have a balanced level of oil and moisture.",
    },

    Dry: {
      icon: "🏜️",
      description:
        "Your skin appears to have lower moisture levels and may benefit from hydration.",
    },

    Oily: {
      icon: "💧",
      description:
        "Your skin appears to have higher oil levels and may benefit from oil-balancing care.",
    },

    Combination: {
      icon: "🌗",
      description:
        "Your skin shows characteristics of both oily and dry areas.",
    },

    Sensitive: {
      icon: "🌸",
      description:
        "Your skin may show visible characteristics associated with sensitivity.",
    },
  };

  const currentType = skinTypes[skinType] || skinTypes.Normal;

  return (
    <div className="card border-0 shadow-sm h-100">

      <div className="card-body p-4">

        {/* Header */}
        <div className="mb-4">
          <h5 className="fw-bold mb-1">
            Skin Type
          </h5>

          <p className="text-muted mb-0">
            Based on the latest skin analysis.
          </p>
        </div>

        {/* Skin Type */}
        <div className="text-center">

          <div
            className="mx-auto mb-3 rounded-circle bg-success-subtle d-flex justify-content-center align-items-center"
            style={{
              width: "90px",
              height: "90px",
              fontSize: "40px",
            }}
          >
            {currentType.icon}
          </div>

          <h3 className="fw-bold text-success">
            {skinType}
          </h3>

          <p className="text-muted mb-0">
            {description || currentType.description}
          </p>

        </div>

        {/* Skin Type Information */}
        <div className="mt-4">

          <div className="border rounded-3 p-3">

            <h6 className="fw-bold mb-3">
              Common Skin Types
            </h6>

            {Object.keys(skinTypes).map((type) => (

              <div
                key={type}
                className={`d-flex justify-content-between align-items-center py-2 ${
                  type === skinType
                    ? "text-success fw-bold"
                    : "text-muted"
                }`}
              >
                <span>
                  {skinTypes[type].icon} {type}
                </span>

                {type === skinType && (
                  <span className="badge bg-success">
                    Current
                  </span>
                )}
              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
};

export default SkinType;