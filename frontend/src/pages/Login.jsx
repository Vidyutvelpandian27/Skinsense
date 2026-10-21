import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await login(
        formData.email,
        formData.password
      );

      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center py-5">

      <div className="container">

        <div className="row justify-content-center">

          <div className="col-md-8 col-lg-5">

            <div className="card border-0 shadow-sm rounded-4">

              {/* Header */}
              <div className="card-body p-4 p-md-5">

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
                    Welcome Back
                  </h4>

                  <p className="text-muted">
                    Login to continue your skin analysis.
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

                {/* Login Form */}
                <form onSubmit={handleSubmit}>

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
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                    />

                  </div>

                  <div className="mb-4" />

                  {/* Login Button */}
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

                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </button>

                </form>

                {/* Signup */}
                <div className="text-center mt-4">

                  <p className="text-muted mb-0">
                    Don't have an account?{" "}

                    <Link
                      to="/signup"
                      className="text-success fw-semibold text-decoration-none"
                    >
                      Create Account
                    </Link>
                  </p>

                  <Link
                    to="/"
                    className="btn btn-outline-success mt-3"
                  >
                    Home
                  </Link>

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

export default Login;