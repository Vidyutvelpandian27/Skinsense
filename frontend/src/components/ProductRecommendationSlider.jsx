import React from "react";
import { ArrowUpRight, PackageOpen } from "lucide-react";
import { Link } from "react-router-dom";

const ProductRecommendationSlider = ({ recommendations = [] }) => {
  const products = recommendations.filter((product) =>
    Array.isArray(product.ingredients)
      ? product.ingredients.some((ingredient) => String(ingredient).trim())
      : Boolean(String(product.ingredients || "").trim())
  );

  return (
    <section className="mt-4" aria-labelledby="recommendation-title">
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="mb-4">
            <h5 id="recommendation-title" className="fw-bold mb-1">
              Products matched to your results
            </h5>
            <p className="text-muted small mb-0">
              Suggestions are matched to the concerns identified in your analysis.
              Ingredient information is shown as provided in each product listing.
            </p>
          </div>

          {products.length === 0 ? (
            <div className="rounded-3 border bg-light p-4 text-center">
              <PackageOpen
                size={28}
                className="text-secondary mb-2"
                aria-hidden="true"
              />
              <h6 className="fw-semibold mb-1">
                No ingredient-listed matches yet
              </h6>
              <p className="text-muted small mb-3">
                There are no active products with ingredient details matching
                the concerns in this analysis.
              </p>
              <Link to="/products" className="btn btn-outline-success btn-sm">
                Browse products
              </Link>
            </div>
          ) : (
            <div className="row g-3">
              {products.map((product, index) => {
                const ingredients = Array.isArray(product.ingredients)
                  ? product.ingredients.join(", ")
                  : product.ingredients;
                const image = product.image || product.image_url;
                const productUrl = product.productUrl || product.product_url;
                const concern = product.concern || product.concern_name;
                const name =
                  product.productName ||
                  product.product_name ||
                  product.name ||
                  product.title ||
                  "Skincare product";

                return (
                  <div
                    className="col-12 col-md-6 col-xl-4"
                    key={product.id || product._id || `${name}-${index}`}
                  >
                    <article className="h-100 rounded-3 border bg-white overflow-hidden">
                      {image && (
                        <div className="bg-light text-center p-3">
                          <img
                            src={image}
                            alt={name}
                            className="img-fluid"
                            style={{ maxHeight: "180px", objectFit: "contain" }}
                          />
                        </div>
                      )}
                      <div className="p-3 d-flex flex-column h-100">
                        <div className="d-flex justify-content-between gap-2 align-items-start">
                          <div>
                            {product.brand && (
                              <small className="text-muted">{product.brand}</small>
                            )}
                            <h6 className="fw-semibold mt-1 mb-2">{name}</h6>
                          </div>
                          {product.price != null && (
                            <span className="fw-semibold text-nowrap">
                              ₹{Number(product.price).toFixed(0)}
                            </span>
                          )}
                        </div>
                        {concern && (
                          <span className="badge bg-success-subtle text-success align-self-start mb-3">
                            {concern}
                          </span>
                        )}
                        {product.description && (
                          <p className="text-muted small mb-3">
                            {product.description}
                          </p>
                        )}
                        <div className="small mb-3">
                          <span className="fw-semibold d-block mb-1">
                            Ingredients
                          </span>
                          <span className="text-muted">{ingredients}</span>
                        </div>
                        <div className="mt-auto">
                          {productUrl ? (
                            <a
                              href={productUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-outline-success btn-sm"
                            >
                              Product details <ArrowUpRight size={15} />
                            </a>
                          ) : (
                            <Link
                              to="/products"
                              className="btn btn-outline-success btn-sm"
                            >
                              Product catalogue
                            </Link>
                          )}
                        </div>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductRecommendationSlider;
