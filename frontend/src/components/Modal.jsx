import React, { useEffect } from "react";

const Modal = ({
  show = false,
  title = "Modal",
  children,
  onClose,
  footer,
  size = "",
}) => {
  useEffect(() => {
    if (!show) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    // Prevent background scrolling
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [show, onClose]);

  if (!show) {
    return null;
  }

  return (
    <>
      {/* Modal Background */}
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div
          className={`modal-dialog modal-dialog-centered ${
            size ? `modal-${size}` : ""
          }`}
          role="document"
        >
          <div className="modal-content border-0 shadow">

            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title fw-bold">
                {title}
              </h5>

              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              ></button>
            </div>

            {/* Body */}
            <div className="modal-body">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="modal-footer">
                {footer}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;