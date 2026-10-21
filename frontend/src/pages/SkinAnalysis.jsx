import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import ImageUpload from "./ImageUpload";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import CircularScore from "../components/CircularScore";
import SkinParameters from "../components/SkinParameters";
import ProductRecommendationSlider from "../components/ProductRecommendationSlider";
import analysisService from "../services/analysisService";
import { Ban, Camera, ScanFace, Sun, UserRound } from "lucide-react";
import { useEffect } from "react";

const SkinAnalysis = () => {
  const [searchParams] = useSearchParams();
  const [selectedImage, setSelectedImage] = useState(null);
  const [report, setReport] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const analysisId = searchParams.get("analysisId");

    if (!analysisId) {
      return;
    }

    const loadReport = async () => {
      try {
        setAnalyzing(true);
        const response = await analysisService.getAnalysis(analysisId);
        setReport(analysisService.formatAnalysisResult(response));
      } catch (err) {
        setError(err.message || "Unable to retrieve the selected analysis.");
      } finally {
        setAnalyzing(false);
      }
    };

    loadReport();
  }, [searchParams]);

  const handleImageSelect = (file) => {
    setSelectedImage(file);
    setError("");
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError("Please upload a facial image before starting the analysis.");
      return;
    }

    try {
      setAnalyzing(true);
      setError("");
      setReport(null);

      const response = await analysisService.analyzeImage(selectedImage);
      const formatted = analysisService.formatAnalysisResult(response);

      setReport(formatted);
    } catch (err) {
      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Unable to analyze the image. Please try again."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  if (analyzing) {
    return (
      <div className="min-vh-100 bg-light d-flex justify-content-center align-items-center">
        <Loading
          message="Analyzing your skin. Please wait..."
          fullScreen
        />
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      <div className="container">
        <div className="mb-4">
          <Link
            to="/dashboard"
            className="text-success text-decoration-none"
          >
            ← Back to Dashboard
          </Link>

          <h2 className="fw-bold mt-3 mb-1">
            Skin Analysis
          </h2>

          <p className="text-muted mb-0">
            Upload a clear facial image to analyze visible skin characteristics.
          </p>
        </div>

        {error && (
          <ErrorMessage
            title="Analysis Error"
            message={error}
            onRetry={() => setError("")}
          />
        )}

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-2">
                  Upload Your Facial Image
                </h5>

                <p className="text-muted mb-4">
                  Choose a clear, unfiltered photo with your face in focus.
                </p>

                <ImageUpload onImageSelect={handleImageSelect} />

                <div className="text-center mt-4">
                  <button
                    type="button"
                    className="btn btn-success btn-lg px-5"
                    disabled={!selectedImage}
                    onClick={handleAnalyze}
                  >
                    Analyze image
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">
                  Image Guidelines
                </h5>

                <p className="text-muted small mb-4">
                  A few simple tips can help improve your results.
                </p>

                <Guideline
                  icon={Sun}
                  title="Even lighting"
                  description="Use a bright space and avoid harsh shadows."
                />
                <Guideline
                  icon={ScanFace}
                  title="Face in frame"
                  description="Keep your full face visible and unobstructed."
                />
                <Guideline
                  icon={Camera}
                  title="In focus"
                  description="Use a sharp photo rather than a blurry one."
                />
                <Guideline
                  icon={Ban}
                  title="No filters"
                  description="Use the original photo without retouching."
                />
                <Guideline
                  icon={UserRound}
                  title="Face the camera"
                  description="A straight-on view works best."
                />
              </div>
            </div>
          </div>
        </div>

        {report && (
          <div className="mt-4">
            <div className="row g-4 align-items-stretch">
              <div className="col-lg-5">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <CircularScore
                      score={report.overallScore}
                      label="Overall Skin Health Score"
                      size={210}
                    />
                    <p className="small text-muted text-center mt-3 mb-0">
                      Scores of 80 and above are considered optimal.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-lg-7">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">Analysis Summary</h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <p className="mb-1 text-muted">Skin Type</p>
                        <h6 className="fw-bold mb-0">{report.skinType}</h6>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-1 text-muted">Status</p>
                        <h6 className="fw-bold mb-0">{report.analysisStatus}</h6>
                      </div>
                    </div>

                    {report.concerns?.length > 0 && (
                      <div className="mt-4">
                        <h6 className="fw-bold mb-3">Detected Concerns</h6>
                        <ul className="mb-0 ps-3">
                          {report.concerns.map((concern, index) => (
                            <li key={`${concern.name}-${index}`} className="mb-1">
                              {concern.name} ({concern.severity || "Medium"})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <SkinParameters
                parameters={report.parameters || {}}
                parameterImages={report.parameterImages || {}}
              />
            </div>

            {(report.imageUrl || report.annotatedImageUrl) && (
              <div className="card border-0 shadow-sm mt-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-1">Analysis Image Map</h5>
                  <p className="text-muted mb-4">
                    Original image and the detected regions used for the scores.
                  </p>
                  <div className="row g-4">
                    {report.imageUrl && (
                      <div className="col-md-6">
                        <h6 className="fw-semibold mb-2">Original image</h6>
                        <img
                          src={report.imageUrl}
                          alt="Original uploaded face"
                          className="img-fluid rounded-3 border"
                        />
                      </div>
                    )}
                    {report.annotatedImageUrl && (
                      <div className="col-md-6">
                        <h6 className="fw-semibold mb-2">Detected points</h6>
                        <img
                          src={report.annotatedImageUrl}
                          alt="Face with detected skin parameter points"
                          className="img-fluid rounded-3 border"
                        />
                      </div>
                    )}
                  </div>
                  <small className="text-muted d-block mt-3">
                    Colored points mark the regions used by the redness, dark
                    spots, wrinkles, texture, oiliness, dryness and tone checks.
                  </small>
                </div>
              </div>
            )}

            {report.recommendations?.length > 0 && (
              <div className="card border-0 shadow-sm mt-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3">Recommendations</h5>
                  <div className="list-group list-group-flush">
                    {report.recommendations.map((item, index) => (
                      <div key={`${item.title}-${index}`} className="list-group-item px-0">
                        <div className="d-flex justify-content-between align-items-start gap-3">
                          <div>
                            <h6 className="fw-bold mb-1">{item.title || "Recommended care"}</h6>
                            <p className="mb-0 text-muted">{item.description || "Personalized skincare recommendation."}</p>
                          </div>
                          {item.priority && (
                            <span className="badge bg-success-subtle text-success rounded-pill">{item.priority}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {report && (
          <ProductRecommendationSlider
            recommendations={report.recommendations || []}
          />
        )}

        <div className="alert alert-warning mt-4">
          <strong>Important:</strong>{" "}
          SkinSense provides a preliminary assessment based on visible image characteristics. It is not a medical diagnosis.
        </div>
      </div>
    </div>
  );
};

const Guideline = ({ icon: Icon, title, description }) => {
  return (
    <div className="d-flex align-items-start gap-3 mb-4">
      <div
        className="rounded-3 bg-success-subtle text-success d-flex justify-content-center align-items-center flex-shrink-0"
        style={{
          width: "42px",
          height: "42px",
        }}
      >
        <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
      </div>

      <div>
        <h6 className="fw-semibold mb-1">{title}</h6>
        <p className="text-muted small mb-0">{description}</p>
      </div>
    </div>
  );
};


export default SkinAnalysis;