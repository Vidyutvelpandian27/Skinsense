import React from "react";

const Card = ({
  children,
  title,
  subtitle,
  className = "",
  header = true,
  footer,
}) => {
  return (
    <div className={`card shadow-sm border-0 ${className}`}>

      {/* Card Header */}
      {header && (title || subtitle) && (
        <div className="card-header bg-white border-0 pt-4 px-4">
          {title && (
            <h5 className="card-title fw-bold mb-1">
              {title}
            </h5>
          )}

          {subtitle && (
            <p className="text-muted mb-0">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Card Body */}
      <div className="card-body p-4">
        {children}
      </div>

      {/* Card Footer */}
      {footer && (
        <div className="card-footer bg-white border-0 px-4 pb-4">
          {footer}
        </div>
      )}

    </div>
  );
};

export default Card;