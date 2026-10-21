import React from "react";
import { ExternalLink, PackageOpen } from "lucide-react";

const ProductCard = ({ product }) => {
  if (!product) {
    return null;
  }

  const {
    name = "Skincare Product",
    brand = "SkinSense",
    category = "Skincare",
    concern = "General Skin Care",
    description = "Recommended skincare product.",
    price,
    image,
  } = product;

  return (
    <div className="card border-0 shadow-sm h-100 overflow-hidden">

      {/* Product Image */}
      <div
        className="bg-light d-flex justify-content-center align-items-center"
        style={{
          height: "220px",
        }}
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="img-fluid h-100 w-100"
            style={{
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            className="rounded-circle bg-success-subtle d-flex justify-content-center align-items-center"
            style={{
              width: "100px",
              height: "100px",
            }}
          >
            <PackageOpen size={42} className="text-success" strokeWidth={1.4} />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="card-body p-4 d-flex flex-column">

        {/* Category */}
        <div className="d-flex justify-content-between align-items-center mb-2">

          <span className="badge bg-success-subtle text-success">
            {category}
          </span>

          <small className="text-muted">
            {concern}
          </small>

        </div>

        {/* Brand */}
        <small className="text-muted mb-1">
          {brand}
        </small>

        {/* Product Name */}
        <h5 className="fw-bold mb-2">
          {name}
        </h5>

        {/* Description */}
        <p className="text-muted small mb-3">
          {description}
        </p>

        {/* Price and Button */}
        <div className="mt-auto">

          <div className="d-flex justify-content-between align-items-center mb-3">

            <span className="fw-bold text-success fs-5">
              {price !== undefined && price !== null
                ? `₹${Number(price).toFixed(2)}`
                : "Price unavailable"}
            </span>

          </div>

          {product.productUrl ? (
            <a
              href={product.productUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-success w-100 d-flex justify-content-center align-items-center gap-2"
            >
              View Product <ExternalLink size={16} />
            </a>
          ) : (
            <button type="button" className="btn btn-success w-100">
              View Product
            </button>
          )}

        </div>

      </div>

    </div>
  );
};

export default ProductCard;