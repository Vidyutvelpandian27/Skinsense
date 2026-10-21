import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4">
      <div className="container-fluid">

        {/* Logo / Brand */}
        <Link to="/" className="navbar-brand fw-bold text-success">
          SkinSense
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto align-items-lg-center">

            <li className="nav-item">
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/history" className="nav-link">
                History
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/products" className="nav-link">
                Products
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
            </li>

            <li className="nav-item ms-lg-3">
              <Link
                to="/login"
                className="btn btn-success px-4"
              >
                Login
              </Link>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;