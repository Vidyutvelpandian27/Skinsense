import React, {
  createContext,
  useContext,
  useState,
} from "react";

import analysisService from "../services/analysisService";
import recommendationService from "../services/recommendationService";

const SkinAnalysisContext =
  createContext(null);

export const SkinAnalysisProvider = ({
  children,
}) => {
  const [selectedImage, setSelectedImage] =
    useState(null);

  const [analysisResult, setAnalysisResult] =
    useState(null);

  const [recommendations, setRecommendations] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * Set selected image
   */
  const selectImage = (image) => {
    setSelectedImage(image);
    setAnalysisResult(null);
    setRecommendations([]);
    setError("");
  };

  /*
   * Remove selected image
   */
  const removeImage = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setRecommendations([]);
    setError("");
  };

  /*
   * Analyze selected image
   */
  const analyzeImage = async () => {
    if (!selectedImage) {
      setError(
        "Please select an image before starting the analysis."
      );

      return null;
    }

    const validation =
      analysisService.validateImage(
        selectedImage
      );

    if (!validation.valid) {
      setError(validation.message);

      return null;
    }

    setLoading(true);
    setError("");

    try {
      /*
       * Send image to Flask backend
       */
      const response =
        await analysisService.analyzeImage(
          selectedImage
        );

      /*
       * Format backend response
       */
      const formattedResult =
        analysisService.formatAnalysisResult(
          response
        );

      setAnalysisResult(
        formattedResult
      );

      /*
       * If recommendations are already
       * returned with the analysis
       */
      if (
        formattedResult?.recommendations &&
        formattedResult.recommendations.length > 0
      ) {
        setRecommendations(
          recommendationService.formatRecommendations(
            formattedResult.recommendations
          )
        );
      } else if (
        formattedResult?.analysisId
      ) {
        /*
         * Otherwise retrieve recommendations
         * separately.
         */
        try {
          const recommendationResponse =
            await recommendationService.getRecommendations(
              formattedResult.analysisId
            );

          const recommendationData =
            recommendationResponse.recommendations ||
            recommendationResponse.data ||
            [];

          setRecommendations(
            recommendationService.formatRecommendations(
              recommendationData
            )
          );
        } catch (recommendationError) {
          console.error(
            "Recommendation loading failed:",
            recommendationError
          );

          /*
           * Analysis itself is still valid,
           * so don't fail the entire analysis.
           */
          setRecommendations([]);
        }
      }

      return formattedResult;
    } catch (analysisError) {
      console.error(
        "Skin analysis failed:",
        analysisError
      );

      setError(
        analysisError.message ||
          "Unable to analyze the image."
      );

      setAnalysisResult(null);

      return null;
    } finally {
      setLoading(false);
    }
  };

  /*
   * Clear analysis result
   */
  const clearAnalysis = () => {
    setAnalysisResult(null);
    setRecommendations([]);
    setError("");
  };

  /*
   * Clear everything
   */
  const resetAnalysis = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setRecommendations([]);
    setError("");
    setLoading(false);
  };

  /*
   * Load a previous analysis
   */
  const loadAnalysis = async (
    analysisId
  ) => {
    if (!analysisId) {
      setError(
        "Analysis ID is required."
      );

      return null;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await analysisService.getAnalysis(
          analysisId
        );

      const formattedResult =
        analysisService.formatAnalysisResult(
          response
        );

      setAnalysisResult(
        formattedResult
      );

      /*
       * Load recommendations
       */
      try {
        const recommendationResponse =
          await recommendationService.getRecommendations(
            analysisId
          );

        const recommendationData =
          recommendationResponse.recommendations ||
          recommendationResponse.data ||
          [];

        setRecommendations(
          recommendationService.formatRecommendations(
            recommendationData
          )
        );
      } catch (recommendationError) {
        console.error(
          "Unable to load recommendations:",
          recommendationError
        );

        setRecommendations([]);
      }

      return formattedResult;
    } catch (analysisError) {
      setError(
        analysisError.message ||
          "Unable to retrieve the analysis."
      );

      return null;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    selectedImage,
    setSelectedImage,
    selectImage,
    removeImage,

    analysisResult,
    setAnalysisResult,

    recommendations,
    setRecommendations,

    loading,
    error,

    analyzeImage,
    loadAnalysis,

    clearAnalysis,
    resetAnalysis,
  };

  return (
    <SkinAnalysisContext.Provider
      value={value}
    >
      {children}
    </SkinAnalysisContext.Provider>
  );
};

/*
 * Custom hook
 */
export const useSkinAnalysis = () => {
  const context = useContext(
    SkinAnalysisContext
  );

  if (!context) {
    throw new Error(
      "useSkinAnalysis must be used inside SkinAnalysisProvider."
    );
  }

  return context;
};

export default SkinAnalysisContext;