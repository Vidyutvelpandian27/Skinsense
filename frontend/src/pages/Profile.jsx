import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import profileService from "../services/profileService";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  });

  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await profileService.getProfile();
        const profile = profileService.formatProfile(response.profile);
        if (profile) {
          setFormData((previous) => ({ ...previous, ...profile }));
        }
      } catch (loadError) {
        setError(loadError.message || "Unable to load your profile.");
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      setSaving(true);
      const response = await profileService.updateProfile(formData);
      const profile = profileService.formatProfile(response.profile);
      setFormData((previous) => ({ ...previous, ...profile }));
      setUser((previous) => ({ ...previous, ...profile }));
      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (saveError) {
      setError(saveError.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">

      <div className="container">

        {/* Header */}
        <div className="mb-4">

          <Link
            to="/dashboard"
            className="text-success text-decoration-none"
          >
            ← Back to Dashboard
          </Link>

          <h2 className="fw-bold mt-3 mb-1">
            My Profile
          </h2>

          <p className="text-muted mb-0">
            Manage your SkinSense account information.
          </p>

        </div>

        {/* Success Message */}
        {message && (
          <div
            className="alert alert-success"
            role="alert"
          >
            {message}
          </div>
        )}

        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        <div className="row g-4">

          {/* Profile Card */}
          <div className="col-lg-4">

            <div className="card border-0 shadow-sm">

              <div className="card-body p-4 text-center">

                {/* Avatar */}
                <div
                  className="mx-auto mb-3 rounded-circle bg-success text-white d-flex justify-content-center align-items-center fw-bold"
                  style={{
                    width: "110px",
                    height: "110px",
                    fontSize: "40px",
                  }}
                >
                  {formData.name
                    ? formData.name.charAt(0).toUpperCase()
                    : "U"}
                </div>

                <h4 className="fw-bold mb-1">
                  {formData.name || "User"}
                </h4>

                <p className="text-muted mb-4">
                  {formData.email}
                </p>

                <div className="border-top pt-4">

                  <div className="row text-center">

                    <div className="col-6 border-end">
                      <h5 className="fw-bold text-success">
                        12
                      </h5>

                      <small className="text-muted">
                        Analyses
                      </small>
                    </div>

                    <div className="col-6">
                      <h5 className="fw-bold text-success">
                        85
                      </h5>

                      <small className="text-muted">
                        Latest Score
                      </small>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* Profile Information */}
          <div className="col-lg-8">

            <div className="card border-0 shadow-sm">

              <div className="card-header bg-white border-0 p-4">

                <div className="d-flex justify-content-between align-items-center">

                  <div>
                    <h5 className="fw-bold mb-1">
                      Personal Information
                    </h5>

                    <p className="text-muted mb-0">
                      Update your account details.
                    </p>
                  </div>

                  {!editing && (
                    <button
                      type="button"
                      className="btn btn-outline-success"
                      onClick={() => setEditing(true)}
                    >
                      Edit Profile
                    </button>
                  )}

                </div>

              </div>

              <div className="card-body p-4">

                <form onSubmit={handleSave}>

                  {/* Name */}
                  <div className="mb-4">

                    <label
                      htmlFor="name"
                      className="form-label fw-semibold"
                    >
                      Full Name
                    </label>

                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!editing}
                    />

                  </div>

                  {/* Email */}
                  <div className="mb-4">

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
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!editing}
                    />

                  </div>

                  {/* Phone */}
                  <div className="mb-4">

                    <label
                      htmlFor="phone"
                      className="form-label fw-semibold"
                    >
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="form-control"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!editing}
                    />

                  </div>

                  {/* Buttons */}
                  {editing && (
                    <div className="d-flex gap-2">

                      <button
                        type="submit"
                        className="btn btn-success px-4"
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-secondary px-4"
                        onClick={() => setEditing(false)}
                      >
                        Cancel
                      </button>

                    </div>
                  )}

                </form>

              </div>

            </div>

            {/* Account Settings */}
            <div className="card border-0 shadow-sm mt-4">

              <div className="card-body p-4">

                <h5 className="fw-bold mb-4">
                  Account Settings
                </h5>

                <div className="d-flex justify-content-between align-items-center border-bottom py-3">

                  <div>
                    <h6 className="fw-semibold mb-1">
                      Change Password
                    </h6>

                    <small className="text-muted">
                      Update your account password.
                    </small>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm"
                  >
                    Change
                  </button>

                </div>

                <div className="d-flex justify-content-between align-items-center py-3">

                  <div>
                    <h6 className="fw-semibold mb-1">
                      Delete Account
                    </h6>

                    <small className="text-muted">
                      Permanently remove your SkinSense account.
                    </small>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                  >
                    Delete
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;