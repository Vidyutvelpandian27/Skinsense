import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="text-center px-4">

        <div
          className="text-success fw-bold"
          style={{ fontSize: "100px", lineHeight: "1" }}
        >
          404
        </div>

        <h1 className="fw-bold mt-4">
          Page Not Found
        </h1>

        <p className="text-muted mb-4">
          Sorry, the page you are looking for does not exist
          or may have been moved.
        </p>

        <Link
          to="/"
          className="btn btn-success px-4 py-2"
        >
          Back to Home
        </Link>

      </div>
    </div>
  );
};

export default NotFound;