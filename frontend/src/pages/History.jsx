import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import historyService from "../services/historyService";
import CircularScore from "../components/CircularScore";

const History = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    historyService.getHistory({ user_id: user.id })
      .then((response) => setHistoryData(historyService.formatHistory(response.history).map((item) => ({
        ...item,
        date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Unknown date",
        score: item.overallScore,
        mainConcern: item.concerns?.[0]?.name || "None detected",
        status: item.status,
      }))))
      .catch(() => setHistoryData([]));
  }, [user?.id]);

  const filteredHistory = historyData.filter((item) => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      return true;
    }

    return (
      item.date.toLowerCase().includes(search) ||
      item.skinType.toLowerCase().includes(search) ||
      item.mainConcern.toLowerCase().includes(search) ||
      String(item.score).includes(search)
    );
  });

  const getScoreClass = (score) => {
    if (score >= 80) {
      return "text-success";
    }

    if (score >= 60) {
      return "text-warning";
    }

    return "text-danger";
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
            Analysis History
          </h2>

          <p className="text-muted mb-0">
            View and track your previous SkinSense analyses.
          </p>

        </div>

        {/* Search and New Analysis */}
        <div className="card border-0 shadow-sm mb-4">

          <div className="card-body p-4">

            <div className="row align-items-end g-3">

              <div className="col-md-8">

                <label
                  htmlFor="historySearch"
                  className="form-label fw-semibold"
                >
                  Search History
                </label>

                <input
                  id="historySearch"
                  type="text"
                  className="form-control"
                  placeholder="Search by date, skin type, concern or score..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                />

              </div>

              <div className="col-md-4">

                <Link
                  to="/analysis"
                  className="btn btn-success w-100"
                >
                  + New Skin Analysis
                </Link>

              </div>

            </div>

          </div>

        </div>

        {/* History Table */}
        <div className="card border-0 shadow-sm">

          <div className="card-header bg-white border-0 p-4">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <h5 className="fw-bold mb-1">
                  Previous Analyses
                </h5>

                <p className="text-muted mb-0">
                  {filteredHistory.length} analysis
                  {filteredHistory.length !== 1 ? "es" : ""}
                  found
                </p>
              </div>

            </div>

          </div>

          <div className="card-body p-0">

            {filteredHistory.length > 0 ? (
              <div className="table-responsive">

                <table className="table table-hover align-middle mb-0">

                  <thead className="table-light">

                    <tr>
                      <th className="px-4 py-3">
                        Date
                      </th>

                      <th className="py-3">
                        Skin Score
                      </th>

                      <th className="py-3">
                        Skin Type
                      </th>

                      <th className="py-3">
                        Main Concern
                      </th>

                      <th className="py-3">
                        Status
                      </th>

                      <th className="py-3 text-end px-4">
                        Action
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {filteredHistory.map((item) => (

                      <tr key={item.id}>

                        {/* Date */}
                        <td className="px-4">
                          <span className="fw-semibold">
                            {item.date}
                          </span>
                        </td>

                        {/* Score */}
                        <td>
                          <CircularScore
                            score={item.score}
                            label=""
                            size={92}
                          />
                        </td>

                        {/* Skin Type */}
                        <td>
                          <span className="badge bg-success-subtle text-success">
                            {item.skinType}
                          </span>
                        </td>

                        {/* Concern */}
                        <td>
                          {item.mainConcern}
                        </td>

                        {/* Status */}
                        <td>
                          <span className="badge bg-success">
                            {item.status}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="text-end px-4">

                          <button
                            type="button"
                            className="btn btn-outline-success btn-sm"
                            onClick={() => navigate(`/analysis?analysisId=${item.analysisId}`)}
                          >
                            View
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-5 px-4">

                <div className="fs-1 mb-3">
                  📋
                </div>

                <h5 className="fw-bold">
                  No Analysis Found
                </h5>

                <p className="text-muted mb-4">
                  No previous analyses match your search.
                </p>

                <Link
                  to="/analysis"
                  className="btn btn-success"
                >
                  Start New Analysis
                </Link>

              </div>
            )}

          </div>

        </div>

        {/* Information */}
        <div className="alert alert-info mt-4">

          <strong>Track Your Progress:</strong>{" "}
          Regularly analyzing your skin can help you monitor
          changes in visible skin characteristics over time.

        </div>

      </div>

    </div>
  );
};

export default History;