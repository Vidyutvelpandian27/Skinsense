import React from "react";

const UploadMethodSelector = ({
  selectedMethod,
  onMethodChange,
}) => {
  const methods = [
    {
      id: "upload",
      title: "Upload Image",
      description: "Choose a facial image from your device.",
      icon: "📁",
    },
    {
      id: "camera",
      title: "Use Camera",
      description: "Capture a facial image using your camera.",
      icon: "📷",
    },
  ];

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">

        <h5 className="fw-bold mb-1">
          Choose Analysis Method
        </h5>

        <p className="text-muted mb-4">
          Select how you want to provide your facial image.
        </p>

        <div className="row g-3">

          {methods.map((method) => {
            const isSelected =
              selectedMethod === method.id;

            return (
              <div
                className="col-md-6"
                key={method.id}
              >

                <button
                  type="button"
                  className={`w-100 text-start border rounded-3 p-4 bg-white ${
                    isSelected
                      ? "border-success border-2"
                      : "border-light"
                  }`}
                  onClick={() =>
                    onMethodChange(method.id)
                  }
                >

                  <div className="d-flex align-items-center">

                    <div
                      className="rounded-circle bg-success-subtle d-flex justify-content-center align-items-center me-3"
                      style={{
                        width: "55px",
                        height: "55px",
                        fontSize: "25px",
                        flexShrink: 0,
                      }}
                    >
                      {method.icon}
                    </div>

                    <div>

                      <h6 className="fw-bold mb-1">
                        {method.title}
                      </h6>

                      <p className="text-muted small mb-0">
                        {method.description}
                      </p>

                    </div>

                  </div>

                  {isSelected && (
                    <div className="text-success small fw-semibold mt-3">
                      ✓ Selected
                    </div>
                  )}

                </button>

              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
};

export default UploadMethodSelector;