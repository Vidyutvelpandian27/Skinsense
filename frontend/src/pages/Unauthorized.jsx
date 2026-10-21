import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="text-center px-4">

        {/* Icon */}
        <div
          className="mx-auto mb-4 d-flex justify-content-center align-items-center rounded-circle bg-warning-subtle text-warning"
          style={{
            width: "90px",
            height: "90px",
            fontSize: "42px",
          }}
        >
          🔒
        </div>

        {/* Error Code */}
        <h1 className="display-4 fw-bold text-warning">
          401
        </h1>

        {/* Title */}
        <h2 className="fw-bold mb-3">
          Unauthorized Access
        </h2>

        {/* Message */}
        <p className="text-muted mb-4">
          You need to log in to access this page.
          Please sign in to continue using SkinSense.
        </p>

        {/* Buttons */}
        <div className="d-flex justify-content-center gap-3 flex-wrap">

          <Link
            to="/login"
            className="btn btn-success px-4"
          >
            Login
          </Link>

          <button
            type="button"
            className="btn btn-outline-secondary px-4"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>

        </div>

      </div>
    </div>
  );
};

export default Unauthorized;