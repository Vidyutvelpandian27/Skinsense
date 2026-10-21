import React, { useState } from "react";
import { Link } from "react-router-dom";
import BlogCard from "./BlogCard";
import { A11y, Autoplay, EffectCoverflow, Keyboard, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";

const BlogSlider = () => {

  const blogs = [
    {
      id: 1,
      title: "How to Maintain Healthy Skin",
      description:
        "Learn simple daily habits that can help maintain healthy-looking skin.",
      category: "Skin Care",
      author: "SkinSense",
      date: "25 Aug 2026",
      readTime: "5 min read",
      image: null,
    },
    {
      id: 7,
      title: "Understanding Redness",
      description: "How LAB, HSV and Excess Red checks identify visible color variation.",
      category: "Redness",
      author: "SkinSense",
      date: "04 Sep 2026",
      readTime: "4 min read",
      image: null,
    },
    {
      id: 8,
      title: "Understanding Pimples",
      description: "How HSV, LAB, adaptive thresholding and connected regions separate visible spots.",
      category: "Pimples",
      author: "SkinSense",
      date: "04 Sep 2026",
      readTime: "4 min read",
      image: null,
    },
    {
      id: 9,
      title: "Understanding Wrinkles",
      description: "How black-hat, Gabor, Canny, Laplacian and LBP checks identify visible lines.",
      category: "Wrinkles",
      author: "SkinSense",
      date: "04 Sep 2026",
      readTime: "6 min read",
      image: null,
    },
    {
      id: 10,
      title: "Skin Tone Uniformity",
      description: "How regional color differences reveal visible tone variation.",
      category: "Tone Uniformity",
      author: "SkinSense",
      date: "04 Sep 2026",
      readTime: "5 min read",
      image: null,
    },
    {
      id: 11,
      title: "Understanding Texture",
      description: "How LBP, Gabor, GLCM, Laplacian and Wavelet features work together.",
      category: "Texture",
      author: "SkinSense",
      date: "04 Sep 2026",
      readTime: "6 min read",
      image: null,
    },
    {
      id: 12,
      title: "Understanding Skin Tone",
      description: "How robust LAB measurements describe visible skin tone.",
      category: "Skin Tone",
      author: "SkinSense",
      date: "04 Sep 2026",
      readTime: "5 min read",
      image: null,
    },
    {
      id: 2,
      title: "Understanding Your Skin Type",
      description:
        "Learn about normal, dry, oily, combination and sensitive skin types.",
      category: "Skin Type",
      author: "SkinSense",
      date: "22 Aug 2026",
      readTime: "4 min read",
      image: null,
    },
    {
      id: 3,
      title: "Why Sunscreen Is Important",
      description:
        "Understand the importance of protecting your skin from excessive sun exposure.",
      category: "Sun Protection",
      author: "SkinSense",
      date: "19 Aug 2026",
      readTime: "6 min read",
      image: null,
    },
    {
      id: 4,
      title: "Tips for Dry Skin",
      description:
        "Explore simple skincare practices that can help improve skin hydration.",
      category: "Dry Skin",
      author: "SkinSense",
      date: "16 Aug 2026",
      readTime: "5 min read",
      image: null,
    },
    {
      id: 5,
      title: "Managing Oily Skin",
      description:
        "Learn about gentle skincare practices for skin with excess oil.",
      category: "Oily Skin",
      author: "SkinSense",
      date: "12 Aug 2026",
      readTime: "5 min read",
      image: null,
    },
    {
      id: 6,
      title: "Understanding Dark Spots",
      description:
        "Learn about common visible pigmentation concerns and basic skincare practices.",
      category: "Dark Spots",
      author: "SkinSense",
      date: "09 Aug 2026",
      readTime: "7 min read",
      image: null,
    },
  ];

  return (
    <section className="container py-5">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Skin Care Articles
          </h2>

          <p className="text-muted mb-0">
            Learn more about skin health and skincare.
          </p>
        </div>

        <Link
          to="/blog"
          className="btn btn-outline-success"
        >
          View All
        </Link>

      </div>

      {/* Blog Cards */}
      <div className="home-blog-swiper-wrap">
        <Swiper
          modules={[A11y, Autoplay, EffectCoverflow, Keyboard, Navigation, Pagination]}
          effect="coverflow"
          centeredSlides
          grabCursor
          loop
          keyboard={{ enabled: true }}
          navigation
          pagination={{ clickable: true, dynamicBullets: true }}
          autoplay={{ delay: 3600, disableOnInteraction: false, pauseOnMouseEnter: true }}
          coverflowEffect={{ rotate: 5, stretch: 0, depth: 120, modifier: 1, slideShadows: false }}
          breakpoints={{ 0: { slidesPerView: 1, spaceBetween: 16 }, 768: { slidesPerView: 2, spaceBetween: 22 }, 1200: { slidesPerView: 3, spaceBetween: 28 } }}
          className="home-blog-swiper"
        >
          {blogs.map((blog) => (
            <SwiperSlide key={blog.id}><BlogCard blog={blog} /></SwiperSlide>
          ))}
        </Swiper>
      </div>

    </section>
  );
};

export default BlogSlider;