import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { A11y, Autoplay, EffectCoverflow, Keyboard, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import productService from "../services/productService";
import ProductCard from "./ProductCard";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";

const localProducts = [
  {
    id: "local-brightness",
    name: "Daily Brightening Serum",
    brand: "SkinSense Edit",
    category: "Brightening",
    concern: "Dark spots",
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
    category: "Treatment",
    concern: "Oiliness",
    description: "A lightweight choice for oil-prone skin and visible congestion.",
    price: 599,
    image: "/products/oilness/1689623206-1566839489-7f63cc3b-3224-42a5-ab3c-a965058d290f-jpg-cb279538497-1566839479.jpg",
  },
  {
    id: "local-redness",
    name: "Calm Skin Essentials",
    brand: "SkinSense Edit",
    category: "Sensitive care",
    concern: "Redness",
    description: "A gentle routine pick for skin that looks visibly flushed.",
    price: 749,
    image: "/products/redness/-original-imahmxfcszekgxxp.jpeg",
  },
  {
    id: "local-pimples",
    name: "Clear Balance Gel",
    brand: "SkinSense Edit",
    category: "Targeted care",
    concern: "Pimples",
    description: "A focused gel selection for blemish-prone skin routines.",
    price: 629,
    image: "/products/pimples/1.3_White_background_carton.jpg",
  },
];

const ProductAdSlider = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getProducts()
      .then((response) => {
        const apiProducts = productService.formatProducts(response.products).slice(0, 12);
        setProducts(apiProducts.length > 0 ? apiProducts : localProducts);
      })
      .catch(() => setProducts(localProducts))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="container py-5 product-rail-section">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Featured Skincare Products</h2>
          <p className="text-muted mb-0">Explore products selected for visible skin concerns.</p>
        </div>
        <Link to="/products" className="btn btn-outline-success">View Products</Link>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-success" role="status" />
        </div>
      ) : products.length > 0 ? (
        <Swiper
          modules={[A11y, Autoplay, EffectCoverflow, Keyboard, Navigation, Pagination]}
          effect="coverflow"
          centeredSlides
          grabCursor
          loop={products.length > 2}
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
          className="product-rail-swiper"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : null}
    </section>
  );
};

export default ProductAdSlider;