import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import historyService from "../services/historyService";
import recommendationService from "../services/recommendationService";

const Recommendations = ({
  recommendations = [],
}) => {
  const { user } = useAuth();
  const [loadedRecommendations, setLoadedRecommendations] = useState([]);
  const [loading, setLoading] = useState(recommendations.length === 0);

  useEffect(() => {
    if (recommendations.length > 0 || !user?.id) {
      return;
    }

    const loadRecommendations = async () => {
      try {
        const historyResponse = await historyService.getLatestHistory(user.id);
        const latest = historyResponse.history;

        if (!latest?.id) {
          return;
        }

        const response = await recommendationService.getRecommendations(latest.id);
        setLoadedRecommendations(
          recommendationService.formatRecommendations(response.recommendations || [])
        );
      } catch (error) {
        setLoadedRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [recommendations.length, user?.id]);

  const defaultRecommendations = [
    {
      id: 1,
      title: "Improve Skin Hydration",
      description:
        "Use a gentle moisturizer regularly to help maintain skin moisture.",
      concern: "Dryness",
      priority: "High",
      icon: "💧",
    },
    {
      id: 2,
      title: "Use Sun Protection",
      description:
        "Apply a broad-spectrum sunscreen during daytime to help protect your skin.",
      concern: "Dark Spots",
      priority: "High",
      icon: "☀️",
    },
    {
      id: 3,
      title: "Maintain a Gentle Skincare Routine",
      description:
        "Use mild cleansing and avoid excessive scrubbing or harsh products.",
      concern: "Texture",
      priority: "Medium",
      icon: "✨",
    },
    {
      id: 4,
      title: "Stay Hydrated",
      description:
        "Maintain adequate hydration and follow a balanced daily routine.",
      concern: "Overall Skin Health",
      priority: "Medium",
      icon: "🥤",
    },
  ];

  const recommendationList = recommendations.length > 0
    ? recommendations
    : loadedRecommendations.length > 0
      ? loadedRecommendations
      : defaultRecommendations;

  const getPriorityClass = (priority) => {
    const value = String(priority).toLowerCase();

    if (value === "high") {
      return "bg-danger";
    }

    if (value === "medium" || value === "moderate") {
      return "bg-warning text-dark";
    }

    if (value === "low") {
      return "bg-success";
    }

    return "bg-secondary";
  };

  return (
    <div className="card border-0 shadow-sm">

      <div className="card-body p-4">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>
            <h5 className="fw-bold mb-1">
              Personalized Recommendations
            </h5>

            <p className="text-muted mb-0">
              Suggestions based on your skin analysis.
            </p>
          </div>

          <Link
            to="/products"
            className="btn btn-outline-success btn-sm"
          >
            View Products
          </Link>

        </div>

        {/* Recommendations */}
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-success" role="status" />
            <p className="text-muted mt-3 mb-0">Loading recommendations...</p>
          </div>
        ) : recommendationList.length === 0 ? (
          <div className="text-center py-4">

            <div className="fs-1 mb-2">
              🌿
            </div>

            <h6 className="fw-bold">
              No Recommendations Available
            </h6>

            <p className="text-muted mb-0">
              Complete a skin analysis to receive personalized suggestions.
            </p>

          </div>
        ) : (
          <div className="row g-3">

            {recommendationList.map(
              (recommendation, index) => (

                <div
                  className="col-md-6"
                  key={recommendation.id || index}
                >

                  <div className="border rounded-3 p-3 h-100">

                    {/* Top Section */}
                    <div className="d-flex align-items-start">

                      <div
                        className="rounded-circle bg-success-subtle d-flex justify-content-center align-items-center me-3"
                        style={{
                          width: "50px",
                          height: "50px",
                          fontSize: "22px",
                          flexShrink: 0,
                        }}
                      >
                        {recommendation.icon || "🌿"}
                      </div>

                      <div className="flex-grow-1">

                        <div className="d-flex justify-content-between align-items-start gap-2">

                          <h6 className="fw-bold mb-1">
                            {recommendation.title}
                          </h6>

                          <span
                            className={`badge ${getPriorityClass(
                              recommendation.priority
                            )}`}
                          >
                            {recommendation.priority || "General"}
                          </span>

                        </div>

                        <small className="text-success">
                          {recommendation.concern ||
                            "Overall Skin Health"}
                        </small>

                      </div>

                    </div>

                    {/* Description */}
                    <p className="text-muted small mt-3 mb-0">
                      {recommendation.description}
                    </p>

                  </div>

                </div>

              )
            )}

          </div>
        )}

        {/* General Advice */}
        <div className="alert alert-success mt-4 mb-0">

          <strong>Tip:</strong>{" "}
          Follow a consistent skincare routine and monitor
          changes in your skin over time.

        </div>

      </div>

    </div>
  );
};

export default Recommendations;