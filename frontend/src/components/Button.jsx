import React from "react";

const Button = ({
  children,
  type = "button",
  variant = "success",
  size = "",
  disabled = false,
  loading = false,
  onClick,
  className = "",
}) => {
  const buttonClass = [
    "btn",
    `btn-${variant}`,
    size ? `btn-${size}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;