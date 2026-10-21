import React from "react";
import { Link } from "react-router-dom";

const RecommendationCard = ({
  recommendation,
  onViewProduct,
}) => {
  if (!recommendation) {
    return null;
  }

  const {
    id,
    title = "Skincare Recommendation",
    description = "Follow a consistent skincare routine to support healthy-looking skin.",
    concern = "Overall Skin Health",
    priority = "Medium",
    icon = "🌿",
    productId,
    productName,
  } = recommendation;

  const getPriorityClass = () => {
    const value = String(priority).toLowerCase();

    if (value === "high") {
      return "bg-danger";
    }

    if (
      value === "medium" ||
      value === "moderate"
    ) {
      return "bg-warning text-dark";
    }

    if (value === "low") {
      return "bg-success";
    }

    return "bg-secondary";
  };

  return (
    <div className="card border-0 shadow-sm h-100">

      <div className="card-body p-4 d-flex flex-column">

        {/* Header */}
        <div className="d-flex align-items-start mb-3">

          {/* Icon */}
          <div
            className="rounded-circle bg-success-subtle d-flex justify-content-center align-items-center me-3"
            style={{
              width: "58px",
              height: "58px",
              fontSize: "26px",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>

          {/* Title */}
          <div className="flex-grow-1">

            <div className="d-flex justify-content-between align-items-start gap-2">

              <h6 className="fw-bold mb-1">
                {title}
              </h6>

              <span
                className={`badge ${getPriorityClass()}`}
              >
                {priority}
              </span>

            </div>

            <small className="text-success fw-semibold">
              {concern}
            </small>

          </div>

        </div>

        {/* Description */}
        <p className="text-muted small mb-4">
          {description}
        </p>

        {/* Product */}
        {productName && (
          <div className="bg-light rounded-3 p-3 mb-4">

            <small className="text-muted d-block mb-1">
              Suggested Product
            </small>

            <span className="fw-semibold">
              🧴 {productName}
            </span>

          </div>
        )}

        {/* Actions */}
        <div className="mt-auto d-flex gap-2">

          {productId ? (
            <Link
              to={`/products/${productId}`}
              className="btn btn-success btn-sm flex-grow-1"
            >
              View Product
            </Link>
          ) : (
            <Link
              to="/products"
              className="btn btn-success btn-sm flex-grow-1"
            >
              Explore Products
            </Link>
          )}

          {onViewProduct && (
            <button
              type="button"
              className="btn btn-outline-success btn-sm"
              onClick={() =>
                onViewProduct(recommendation)
              }
            >
              Details
            </button>
          )}

        </div>

      </div>

    </div>
  );
};

export default RecommendationCard;