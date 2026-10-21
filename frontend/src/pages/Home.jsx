import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Droplets,
  Fingerprint,
  Sparkles,
  Sun,
  Waves,
} from "lucide-react";
import { A11y, Autoplay, EffectCreative, Keyboard, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import ProductAdSlider from "../components/ProductAdSlider";
import "swiper/css";
import "swiper/css/effect-creative";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Home = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const heroSlides = [
    {
      title: "Face Scan",
      description: "A clear view of your visible skin characteristics.",
      image: "/hero-images/face-scan.jpg",
    },
    {
      title: "Redness Check",
      description: "Spot visible redness and uneven areas across the face.",
      image: "/hero-images/redness-check.jpg",
    },
    {
      title: "Skin Balance",
      description: "Understand visible signs of oiliness and dryness.",
      image: "/hero-images/skin-balance.jpg",
    },
    {
      title: "Tone Insights",
      description: "Explore skin tone and visible uniformity patterns.",
      image: "/hero-images/tone-insights.jpg",
    },
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  const slide = heroSlides[activeSlide];

  const parameterSlides = [
    {
      icon: CircleDot,
      name: "Redness",
      description: "Visible redness and variation across facial skin regions.",
      image: "/products/redness/-original-imahmxfcszekgxxp.jpeg",
      accent: "#d96a60",
    },
    {
      icon: Fingerprint,
      name: "Dark Spots",
      description: "Visible dark or pigmented areas in the facial image.",
      image: "/products/dark spots/10-vitamin-c-brightening-serum-617903.png",
      accent: "#8b6d5c",
    },
    {
      icon: Waves,
      name: "Wrinkles",
      description: "Visible lines and wrinkle-related texture patterns.",
      image: "/products/wrinkles/-enriched-transparent-original-imah2gk3kjjnswhs.png",
      accent: "#8d9b87",
    },
    {
      icon: Sparkles,
      name: "Skin Texture",
      description: "Texture variations across the extracted skin region.",
      image: "/products/skin texture/1687546558-519yulXccRL.jpg",
      accent: "#ba806b",
    },
    {
      icon: Droplets,
      name: "Oiliness & Dryness",
      description: "Visible characteristics related to moisture and oil levels.",
      image: "/products/dryness/1.FoP-236.png",
      accent: "#5d9f9a",
    },
    {
      icon: Sun,
      name: "Skin Tone",
      description: "Skin tone and visible tone uniformity patterns.",
      image: "/products/skin tone/1_b4757ef8-e089-4daa-a13d-0bd0d775b38a.jpg",
      accent: "#c28a55",
    },
  ];

  return (
    <div className="bg-light min-vh-100">

      {/* Hero Section */}
      <section className="container py-5">

        <div className="row align-items-center min-vh-75">

          {/* Left Content */}
          <div className="col-lg-6 mb-5 mb-lg-0">

            <span className="badge bg-success-subtle text-success px-3 py-2 mb-3">
              Digital Skin Analysis
            </span>

            <h1 className="display-4 fw-bold mb-3">
              Understand Your Skin
              <span className="text-success">
                {" "}Better
              </span>
            </h1>

            <p className="lead text-muted mb-4">
              SkinSense uses Digital Image Processing to analyze
              visible facial skin characteristics and provide a
              simple preliminary skin health assessment.
            </p>

            <div className="d-flex flex-wrap gap-3">

              <Link
                to="/signup"
                className="btn btn-success btn-lg px-4"
              >
                Sign Up
              </Link>

              <Link
                to="/login"
                className="btn btn-outline-success btn-lg px-4"
              >
                Login
              </Link>

            </div>

          </div>

          {/* Right Illustration */}
          <div className="col-lg-6">

            <div className="text-center">

              <div
                className="mx-auto rounded-4 bg-success-subtle d-flex flex-column justify-content-center align-items-center shadow-sm"
                style={{
                  width: "100%",
                  maxWidth: "480px",
                  height: "420px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >

                <img
                  src={slide.image}
                  alt=""
                  className="position-absolute top-0 start-0 w-100 h-100"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />

                <div
                  className="position-absolute top-0 start-0 w-100 h-100"
                  style={{ background: "rgba(255, 255, 255, 0.22)" }}
                />

                <div
                  className="position-absolute text-center px-4 start-0 end-0"
                  style={{
                    bottom: "24px",
                  }}
                >
                  <div
                    className="mx-auto px-4 py-3 rounded-3"
                    style={{
                      maxWidth: "360px",
                      background: "rgba(24, 66, 49, 0.78)",
                      boxShadow: "0 8px 24px rgba(20, 52, 39, 0.18)",
                    }}
                  >
                    <h3 className="fw-bold mb-2" style={{ color: "#fffaf0" }}>
                      {slide.title}
                    </h3>
                    <p className="mb-0" style={{ color: "#e8f5eb" }}>
                      {slide.description}
                    </p>
                  </div>

                </div>

              </div>

              <div
                className="d-flex align-items-center justify-content-center gap-2 mt-3"
                aria-label="Hero slides"
              >
                <button
                  type="button"
                  className="btn btn-light rounded-circle p-1 shadow-sm"
                  onClick={() => setActiveSlide((activeSlide - 1 + heroSlides.length) % heroSlides.length)}
                  aria-label="Previous highlight"
                >
                  <ChevronLeft size={18} />
                </button>

                {heroSlides.map((item, index) => (
                  <button
                    key={item.title}
                    type="button"
                    className={`border-0 rounded-pill ${index === activeSlide ? "bg-success" : "bg-secondary-subtle"}`}
                    style={{
                      width: index === activeSlide ? "26px" : "9px",
                      height: "9px",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Show ${item.title}`}
                  />
                ))}

                <button
                  type="button"
                  className="btn btn-light rounded-circle p-1 shadow-sm"
                  onClick={() => setActiveSlide((activeSlide + 1) % heroSlides.length)}
                  aria-label="Next highlight"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* Features Section */}
      <section className="container py-5">

        <div className="text-center mb-5">

          <h2 className="fw-bold">
            What SkinSense Analyzes
          </h2>

          <p className="text-muted">
            Get insights into multiple visible skin characteristics.
          </p>

        </div>

        <div className="home-parameter-carousel">
          <Swiper
            modules={[A11y, Autoplay, EffectCreative, Keyboard, Navigation, Pagination]}
            effect="creative"
            grabCursor
            loop
            keyboard={{ enabled: true }}
            navigation
            pagination={{ clickable: true, dynamicBullets: true }}
            autoplay={{ delay: 3200, disableOnInteraction: false, pauseOnMouseEnter: true }}
            creativeEffect={{
              prev: { shadow: true, translate: ["-20%", 0, -1] },
              next: { translate: ["100%", 0, 0] },
            }}
            breakpoints={{
              0: { slidesPerView: 1, spaceBetween: 18 },
              700: { slidesPerView: 2, spaceBetween: 22 },
              1100: { slidesPerView: 3, spaceBetween: 26 },
            }}
            className="home-parameter-swiper"
          >
            {parameterSlides.map((parameter) => (
              <SwiperSlide key={parameter.name}>
                <ParameterFeature {...parameter} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

      </section>

      <ProductAdSlider />

      {/* How It Works */}
      <section className="bg-white py-5">

        <div className="container">

          <div className="text-center mb-5">

            <h2 className="fw-bold">
              How SkinSense Works
            </h2>

            <p className="text-muted">
              A simple image-based analysis process.
            </p>

          </div>

          <div className="row g-4">

            <Step
              number="1"
              title="Upload Image"
              description="Upload a clear facial image through the SkinSense application."
            />

            <Step
              number="2"
              title="Image Processing"
              description="The system preprocesses the image and extracts the facial skin region."
            />

            <Step
              number="3"
              title="Parameter Analysis"
              description="Digital Image Processing techniques are used to evaluate visible skin characteristics."
            />

            <Step
              number="4"
              title="Get Results"
              description="Receive a Skin Health Score, concerns and personalized recommendations."
            />

          </div>

        </div>

      </section>

      {/* Footer Text */}
      <footer className="border-top bg-white py-4">

        <div className="container text-center">

          <p className="text-muted mb-1">
            © {new Date().getFullYear()} SkinSense
          </p>

          <small className="text-muted">
            SkinSense provides preliminary image-based skin
            analysis and is not a medical diagnostic system.
          </small>

        </div>

      </footer>

    </div>
  );
};


/* Feature Component */
const ParameterFeature = ({
  icon: Icon,
  name,
  description,
  image,
  accent,
}) => {
  return (
    <article className="home-parameter-card h-100">
      <div className="home-parameter-image-wrap">
        <img src={image} alt="" className="home-parameter-image" />
        <span className="home-parameter-icon" style={{ color: accent }}>
          <Icon size={22} strokeWidth={1.8} />
        </span>
      </div>

      <div className="p-4">
        <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
          <h5 className="fw-bold mb-0">{name}</h5>
          <span className="home-parameter-index">VISIBLE</span>
        </div>
        <p className="text-muted mb-0">{description}</p>
      </div>
    </article>
  );
};


/* Process Step */
const Step = ({
  number,
  title,
  description,
}) => {
  return (
    <div className="col-md-6 col-lg-3">

      <div className="text-center">

        <div
          className="mx-auto rounded-circle bg-success text-white d-flex justify-content-center align-items-center fw-bold mb-3"
          style={{
            width: "60px",
            height: "60px",
            fontSize: "22px",
          }}
        >
          {number}
        </div>

        <h5 className="fw-bold">
          {title}
        </h5>

        <p className="text-muted">
          {description}
        </p>

      </div>

    </div>
  );
};

export default Home;