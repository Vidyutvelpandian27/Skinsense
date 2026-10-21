import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import AdminProductForm from "../components/AdminProductForm";
import productService from "../services/productService";
import { useAuth } from "../context/AuthContext";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { A11y, Autoplay, EffectCoverflow, Keyboard, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";

const localProducts = [
  {
    id: "local-brightness",
    name: "Vitamin C Brightening Serum",
    brand: "SkinSense Edit",
    category: "Serum",
    concern: "Dark Spots",
    description: "A brightening-focused pick for a more even-looking complexion.",
    price: 699,
    image: "/products/dark spots/10-vitamin-c-brightening-serum-617903.png",
  },
  {
    id: "local-hydration",
    name: "Barrier Repair Moisturizer",
    brand: "SkinSense Edit",
    category: "Moisturizer",
    concern: "Dryness",
    description: "A comfort-first moisturizer for dry and sensitive-feeling skin.",
    price: 849,
    image: "/products/dryness/1.FoP-236.png",
  },
  {
    id: "local-oil-control",
    name: "Clarifying Face Care",
    brand: "SkinSense Edit",
    category: "Cleanser",
    concern: "Oiliness",
    description: "A lightweight choice for oil-prone skin and visible congestion.",
    price: 599,
    image: "/products/oilness/1689623206-1566839489-7f63cc3b-3224-42a5-ab3c-a965058d290f-jpg-cb279538497-1566839479.jpg",
  },
  {
    id: "local-redness",
    name: "Calm Skin Essentials",
    brand: "SkinSense Edit",
    category: "Moisturizer",
    concern: "Redness",
    description: "A gentle routine pick for skin that looks visibly flushed.",
    price: 749,
    image: "/products/redness/-original-imahmxfcszekgxxp.jpeg",
  },
  {
    id: "local-pimples",
    name: "Clear Balance Gel",
    brand: "SkinSense Edit",
    category: "Serum",
    concern: "Pimples",
    description: "A focused gel selection for blemish-prone skin routines.",
    price: 629,
    image: "/products/pimples/1.3_White_background_carton.jpg",
  },
  {
    id: "local-wrinkles",
    name: "Renewal Night Serum",
    brand: "SkinSense Edit",
    category: "Serum",
    concern: "Wrinkles",
    description: "A night-care option for visible lines and texture concerns.",
    price: 899,
    image: "/products/wrinkles/-enriched-transparent-original-imah2gk3kjjnswhs.png",
  },
  {
    id: "local-skin-tone",
    name: "Even Tone Daily Care",
    brand: "SkinSense Edit",
    category: "Sunscreen",
    concern: "Skin Tone",
    description: "A daily-care pick for a more balanced-looking skin tone.",
    price: 779,
    image: "/products/skin tone/1_b4757ef8-e089-4daa-a13d-0bd0d775b38a.jpg",
  },
  {
    id: "local-texture",
    name: "Smooth Texture Cleanser",
    brand: "SkinSense Edit",
    category: "Cleanser",
    concern: "Skin Texture",
    description: "A simple cleansing step for a smoother-looking skin surface.",
    price: 549,
    image: "/products/skin texture/1687546558-519yulXccRL.jpg",
  },
];

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";

  useEffect(() => {
    productService.getProducts()
      .then((response) => {
        const apiProducts = productService.formatProducts(response.products);
        setProducts(apiProducts.length > 0 ? apiProducts : localProducts);
      })
      .catch(() => setProducts(localProducts))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    "All",
    "Cleanser",
    "Moisturizer",
    "Serum",
    "Sunscreen",
  ];

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search) ||
      product.brand.toLowerCase().includes(search) ||
      (product.concern || "").toLowerCase().includes(search);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">

      <div className="container">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">

          <div>
            <Link
              to="/dashboard"
              className="text-success text-decoration-none"
            >
              ← Back to Dashboard
            </Link>

            <h2 className="fw-bold mt-3 mb-1">
              Skincare Products
            </h2>

            <p className="text-muted mb-0">
              Explore products related to your skin concerns.
            </p>
          </div>

          {isAdmin && (
            <button className="btn btn-success" onClick={() => {
              setEditingProduct(null);
              setShowAdminForm(!showAdminForm);
            }}>
              {showAdminForm ? "Close Form" : "Add Product"}
              {!showAdminForm && <Plus size={18} className="ms-2" />}
            </button>
          )}

        </div>

        {showAdminForm && isAdmin && (
          <AdminProductForm
            product={editingProduct}
            onCancel={() => setShowAdminForm(false)}
            onCreated={(product) => {
              const formattedProduct = productService.formatProduct(product);
              setProducts((current) => editingProduct
                ? current.map((item) => item.id === formattedProduct.id ? formattedProduct : item)
                : [...current, formattedProduct]);
              setEditingProduct(null);
              setShowAdminForm(false);
            }}
          />
        )}

        {/* Search */}
        <div className="card border-0 shadow-sm mb-4">

          <div className="card-body p-4">

            <div className="row align-items-center g-3">

              <div className="col-md-8">

                <label
                  htmlFor="productSearch"
                  className="form-label fw-semibold"
                >
                  <Search size={16} className="me-2 text-success" /> Search Products
                </label>

                <input
                  id="productSearch"
                  type="text"
                  className="form-control"
                  placeholder="Search by product, brand or concern..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                />

              </div>

              <div className="col-md-4">

                <label className="form-label fw-semibold">
                  <SlidersHorizontal size={16} className="me-2 text-success" /> Category
                </label>

                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(event.target.value)
                  }
                >
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>

              </div>

            </div>

          </div>

        </div>

        {/* Product Count */}
        <div className="d-flex justify-content-between align-items-center mb-3">

          <h5 className="fw-bold mb-0">
            Recommended Products
          </h5>

          <span className="text-muted">
            {filteredProducts.length} products
          </span>

        </div>

        {/* Products */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <Swiper
            modules={[A11y, Autoplay, EffectCoverflow, Keyboard, Navigation, Pagination]}
            effect="coverflow"
            centeredSlides
            grabCursor
            loop={filteredProducts.length > 2}
            keyboard={{ enabled: true }}
            navigation
            pagination={{ clickable: true, dynamicBullets: true }}
            autoplay={{ delay: 4200, disableOnInteraction: false, pauseOnMouseEnter: true }}
            coverflowEffect={{ rotate: 5, stretch: 0, depth: 120, modifier: 1, slideShadows: false }}
            breakpoints={{
              0: { slidesPerView: 1, spaceBetween: 16 },
              640: { slidesPerView: 2, spaceBetween: 20 },
              1100: { slidesPerView: 3, spaceBetween: 24 },
            }}
            className="product-rail-swiper mb-4"
          >
            {filteredProducts.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
                {isAdmin && (
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm w-100 mt-2"
                    onClick={() => {
                      setEditingProduct(product);
                      setShowAdminForm(true);
                    }}
                  >
                    Edit Advertisement Image
                  </button>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="card border-0 shadow-sm">

            <div className="card-body text-center py-5">

              <div className="fs-1 mb-3">
                🔎
              </div>

              <h5 className="fw-bold">
                No Products Found
              </h5>

              <p className="text-muted mb-0">
                Try another search term or select a different category.
              </p>

            </div>

          </div>
        )}

        {/* Disclaimer */}
        <div className="alert alert-warning mt-4">

          <strong>Note:</strong>{" "}
          Product suggestions are general skincare recommendations
          based on visible skin characteristics. Always check product
          ingredients and suitability before use.

        </div>

      </div>

    </div>
  );
};

export default Products;