import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white border-top mt-auto py-4">
      <div className="container-fluid px-4">

        <div className="row align-items-center">

          {/* Brand */}
          <div className="col-md-6 mb-3 mb-md-0">
            <h5 className="text-success fw-bold mb-1">
              SkinSense
            </h5>

            <p className="text-muted mb-0">
              Digital skin analysis and personalized skincare guidance.
            </p>
          </div>

          {/* Links */}
          <div className="col-md-6 text-md-end">
            <Link
              to="/"
              className="text-decoration-none text-muted me-3"
            >
              Home
            </Link>

            <Link
              to="/dashboard"
              className="text-decoration-none text-muted me-3"
            >
              Dashboard
            </Link>

            <Link
              to="/profile"
              className="text-decoration-none text-muted"
            >
              Profile
            </Link>
          </div>

        </div>

        <hr />

        {/* Copyright */}
        <div className="text-center">
          <small className="text-muted">
            © {new Date().getFullYear()} SkinSense. All rights reserved.
          </small>
        </div>

      </div>
    </footer>
  );
};

export default Footer;