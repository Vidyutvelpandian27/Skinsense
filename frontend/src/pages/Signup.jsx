import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import authService from "../context/authService";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (
      !formData.full_name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await authService.signup({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
      });

      navigate("/login");
    } catch (err) {
      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center py-5">

      <div className="container">

        <div className="row justify-content-center">

          <div className="col-md-8 col-lg-6">

            <div className="card border-0 shadow-sm rounded-4">

              <div className="card-body p-4 p-md-5">

                {/* Header */}
                <div className="text-center mb-4">

                  <Link
                    to="/"
                    className="text-decoration-none"
                  >
                    <h2 className="fw-bold text-success">
                      SkinSense
                    </h2>
                  </Link>

                  <h4 className="fw-bold mt-4">
                    Create Your Account
                  </h4>

                  <p className="text-muted">
                    Create an account to start your skin analysis.
                  </p>

                </div>

                {/* Error */}
                {error && (
                  <div
                    className="alert alert-danger"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                {/* Signup Form */}
                <form onSubmit={handleSubmit}>

                  {/* Name */}
                  <div className="mb-3">

                    <label
                      htmlFor="name"
                      className="form-label fw-semibold"
                    >
                      Full Name
                    </label>

                    <input
                      type="text"
                      id="name"
                      name="full_name"
                      className="form-control form-control-lg"
                      placeholder="Enter your full name"
                      value={formData.full_name}
                      onChange={handleChange}
                      autoComplete="name"
                    />

                  </div>

                  {/* Email */}
                  <div className="mb-3">

                    <label
                      htmlFor="email"
                      className="form-label fw-semibold"
                    >
                      Email Address
                    </label>

                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control form-control-lg"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                    />

                  </div>

                  {/* Password */}
                  <div className="mb-3">

                    <label
                      htmlFor="password"
                      className="form-label fw-semibold"
                    >
                      Password
                    </label>

                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="form-control form-control-lg"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />

                    <small className="text-muted">
                      Password must contain at least 6 characters.
                    </small>

                  </div>

                  {/* Confirm Password */}
                  <div className="mb-4">

                    <label
                      htmlFor="confirmPassword"
                      className="form-label fw-semibold"
                    >
                      Confirm Password
                    </label>

                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="form-control form-control-lg"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />

                  </div>

                  {/* Terms */}
                  <div className="form-check mb-4">

                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="terms"
                      required
                    />

                    <label
                      className="form-check-label text-muted"
                      htmlFor="terms"
                    >
                      I agree to the SkinSense terms and conditions.
                    </label>

                  </div>

                  {/* Signup Button */}
                  <button
                    type="submit"
                    className="btn btn-success btn-lg w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>

                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>

                </form>

                {/* Login Link */}
                <div className="text-center mt-4">

                  <p className="text-muted mb-0">
                    Already have an account?{" "}

                    <Link
                      to="/login"
                      className="text-success fw-semibold text-decoration-none"
                    >
                      Login
                    </Link>
                  </p>

                </div>

              </div>

            </div>

            {/* Disclaimer */}
            <p className="text-center text-muted small mt-4">
              SkinSense provides preliminary skin analysis
              and is not a medical diagnosis.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Signup;