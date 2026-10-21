import React, { useState } from "react";
import { Link } from "react-router-dom";

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Understand Your Skin Better",
      description:
        "Analyze your facial skin using Digital Image Processing and get a simple preliminary skin health assessment.",
      buttonText: "Analyze Your Skin",
      buttonLink: "/analysis",
      icon: "🔍",
    },
    {
      id: 2,
      title: "Know Your Skin Type",
      description:
        "Discover visible characteristics such as dryness, oiliness, redness, dark spots, wrinkles and skin tone.",
      buttonText: "Get Started",
      buttonLink: "/signup",
      icon: "✨",
    },
    {
      id: 3,
      title: "Get Personalized Recommendations",
      description:
        "Receive skincare suggestions based on the visible characteristics identified during your analysis.",
      buttonText: "Explore Products",
      buttonLink: "/products",
      icon: "🧴",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((previous) =>
      previous === slides.length - 1 ? 0 : previous + 1
    );
  };

  const previousSlide = () => {
    setCurrentSlide((previous) =>
      previous === 0 ? slides.length - 1 : previous - 1
    );
  };

  const slide = slides[currentSlide];

  return (
    <section className="container-fluid px-0">

      <div className="container py-4">

        <div
          className="rounded-4 overflow-hidden shadow-sm bg-success-subtle"
          style={{
            minHeight: "430px",
          }}
        >

          <div className="row align-items-center h-100">

            {/* Text Section */}
            <div className="col-lg-7 p-5">

              <span className="badge bg-success text-white mb-3">
                SkinSense
              </span>

              <h1 className="display-5 fw-bold mb-3">
                {slide.title}
              </h1>

              <p className="lead text-muted mb-4">
                {slide.description}
              </p>

              <Link
                to={slide.buttonLink}
                className="btn btn-success btn-lg px-4"
              >
                {slide.buttonText}
              </Link>

            </div>

            {/* Illustration */}
            <div className="col-lg-5 text-center p-5">

              <div
                className="mx-auto rounded-circle bg-white shadow-sm d-flex justify-content-center align-items-center"
                style={{
                  width: "230px",
                  height: "230px",
                  fontSize: "90px",
                }}
              >
                {slide.icon}
              </div>

              <h5 className="fw-bold text-success mt-4">
                Digital Skin Analysis
              </h5>

            </div>

          </div>

          {/* Previous Button */}
          <button
            type="button"
            className="btn btn-light position-absolute"
            style={{
              left: "25px",
              top: "50%",
              transform: "translateY(-50%)",
              borderRadius: "50%",
              width: "42px",
              height: "42px",
            }}
            onClick={previousSlide}
            aria-label="Previous slide"
          >
            ‹
          </button>

          {/* Next Button */}
          <button
            type="button"
            className="btn btn-light position-absolute"
            style={{
              right: "25px",
              top: "50%",
              transform: "translateY(-50%)",
              borderRadius: "50%",
              width: "42px",
              height: "42px",
            }}
            onClick={nextSlide}
            aria-label="Next slide"
          >
            ›
          </button>

        </div>

        {/* Indicators */}
        <div className="d-flex justify-content-center gap-2 mt-3">

          {slides.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`border-0 rounded-pill ${
                index === currentSlide
                  ? "bg-success"
                  : "bg-secondary"
              }`}
              style={{
                width: index === currentSlide ? "30px" : "10px",
                height: "10px",
                transition: "all 0.2s ease",
              }}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}

        </div>

      </div>

    </section>
  );
};

export default HeroSlider;