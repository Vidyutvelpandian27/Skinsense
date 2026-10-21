import React from "react";
import CircularScore from "./CircularScore";
import { A11y, Autoplay, EffectCoverflow, Keyboard, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";

const SkinParameters = ({
  parameters = {},
  parameterImages = {},
}) => {
  const defaultParameters = [
    {
      key: "redness",
      name: "Redness",
      value: null,
      status: "Not available",
      icon: "🔴",
    },
    {
      key: "dark_spots",
      name: "Dark Spots",
      value: null,
      status: "Not available",
      icon: "🟤",
    },
    {
      key: "wrinkles",
      name: "Wrinkles",
      value: null,
      status: "Not available",
      icon: "〰️",
    },
    {
      key: "texture",
      name: "Texture",
      value: null,
      status: "Not available",
      icon: "✨",
    },
    {
      key: "oiliness",
      name: "Oiliness",
      value: null,
      status: "Not available",
      icon: "💧",
    },
    {
      key: "dryness",
      name: "Dryness",
      value: null,
      status: "Not available",
      icon: "🏜️",
    },
    {
      key: "skin_tone",
      name: "Skin Tone",
      value: null,
      status: "Not available",
      icon: "🎨",
    },
    {
      key: "tone_uniformity",
      name: "Tone Uniformity",
      value: null,
      status: "Not available",
      icon: "🌈",
    },
    {
      key: "pimples",
      name: "Pimples",
      value: null,
      status: "Not available",
      icon: "🔵",
    },
  ];

  const parameterList = defaultParameters.map((parameter) => {
    const backendParameter =
      parameters[parameter.key] ??
      parameters[`${parameter.key}_score`] ??
      (parameter.key === "pimples"
        ? parameters.pimple_score
        : undefined) ??
      (parameter.key === "tone_uniformity"
        ? parameters.tone_uniformity_score ?? parameters.skin_tone_score
        : undefined);

    if (backendParameter === undefined || backendParameter === null) {
      return parameter;
    }

    return {
      ...parameter,
      value:
        typeof backendParameter === "object"
          ? backendParameter.value ?? parameter.value
          : backendParameter,
      status:
        typeof backendParameter === "object"
          ? backendParameter.status ?? parameter.status
          : Number(backendParameter) >= 80
            ? "Good"
            : Number(backendParameter) >= 60
              ? "Moderate"
              : "High",
    };
  });

  const getStatusClass = (status) => {
    const normalizedStatus = String(status).toLowerCase();

    if (
      normalizedStatus === "good" ||
      normalizedStatus === "low" ||
      normalizedStatus === "normal"
    ) {
      return "text-success";
    }

    if (
      normalizedStatus === "moderate" ||
      normalizedStatus === "medium"
    ) {
      return "text-warning";
    }

    if (
      normalizedStatus === "high" ||
      normalizedStatus === "severe"
    ) {
      return "text-danger";
    }

    return "text-muted";
  };

  return (
    <div className="card border-0 shadow-sm">

      <div className="card-body p-4">

        {/* Header */}
        <div className="mb-4">
          <h5 className="fw-bold mb-1">
            Skin Parameters
          </h5>

          <p className="text-muted mb-0">
            Visible characteristics identified during the analysis.
          </p>
        </div>

        <div className="skin-parameters-carousel">
          <Swiper
            modules={[A11y, Autoplay, EffectCoverflow, Keyboard, Navigation, Pagination]}
            effect="coverflow"
            grabCursor
            centeredSlides
            loop
            keyboard={{ enabled: true }}
            navigation
            pagination={{ clickable: true, dynamicBullets: true }}
            autoplay={{ delay: 4200, disableOnInteraction: false, pauseOnMouseEnter: true }}
            coverflowEffect={{ rotate: 7, stretch: 0, depth: 140, modifier: 1, slideShadows: true }}
            breakpoints={{
              0: { slidesPerView: 1, spaceBetween: 18 },
              768: { slidesPerView: 2, spaceBetween: 24 },
              1200: { slidesPerView: 2.45, spaceBetween: 30 },
            }}
            className="skin-parameters-swiper"
          >
            {parameterList.map((parameter) => (
              <SwiperSlide key={parameter.key}>
                <article className="skin-parameter-slide h-100">

                {/* Parameter Header */}
                <div className="d-flex justify-content-between align-items-center mb-2">

                  <div className="d-flex align-items-center">

                    <span className="fs-4 me-2">
                      {parameter.icon}
                    </span>

                    <span className="fw-semibold">
                      {parameter.name}
                    </span>

                  </div>

                  <span
                    className={`fw-semibold ${getStatusClass(
                      parameter.status
                    )}`}
                  >
                    {parameter.status}
                  </span>

                </div>

                <CircularScore
                  score={parameter.value}
                  label=""
                  size={132}
                />

                <div className="text-center mt-2">
                  <small className="text-muted">Parameter score</small>
                </div>

                {parameterImages[parameter.key] && (
                  <img
                    src={parameterImages[parameter.key]}
                    alt={`${parameter.name} detection map`}
                    className="skin-parameter-image img-fluid rounded-3 border mt-3"
                  />
                )}

                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

      </div>

    </div>
  );
};

export default SkinParameters;