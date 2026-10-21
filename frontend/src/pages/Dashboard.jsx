import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import historyService from "../services/historyService";
import CircularScore from "../components/CircularScore";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    if (!user?.id) return;
    historyService.getLatestHistory(user.id)
      .then((response) => setLatest(response.history || null))
      .catch(() => setLatest(null))
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h2 className="fw-bold mb-1">Dashboard</h2>
            <p className="text-muted mb-0">Welcome back to your SkinSense dashboard.</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Link to="/analysis" className="btn btn-success">Start New Analysis</Link>
            <Link to="/products" className="btn btn-outline-success">Products</Link>
            <button type="button" className="btn btn-outline-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-success" /></div>
        ) : latest ? (
          <div className="row g-4">
            <div className="col-lg-5">
              <div className="card border-0 shadow-sm h-100 p-4">
                <CircularScore score={latest.overall_score} label="Latest Skin Health Score" size={200} />
                <div className="text-center mt-3">
                  <p className="mb-1 text-muted">Skin type</p>
                  <h5 className="fw-bold">{latest.skin_type || "Not available"}</h5>
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="card border-0 shadow-sm h-100 p-4">
                <h5 className="fw-bold mb-3">Latest Analysis</h5>
                <p className="text-muted">Status: {latest.analysis_status || "Not available"}</p>
                <p className="text-muted mb-4">Completed: {latest.created_at ? new Date(latest.created_at).toLocaleString() : "Not available"}</p>
                <Link to="/history" className="btn btn-outline-success">View Analysis History</Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="card border-0 shadow-sm text-center py-5">
            <h4 className="fw-bold">No analysis reports yet</h4>
            <p className="text-muted">Upload a facial image to create your first report.</p>
            <Link to="/analysis" className="btn btn-success mx-auto">Start Your First Analysis</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
