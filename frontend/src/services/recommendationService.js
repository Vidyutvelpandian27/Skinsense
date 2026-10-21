import api from "./api";

/*
 * Get recommendations for a specific analysis
 */
const getRecommendations = async (analysisId) => {
  try {
    if (!analysisId) {
      throw new Error("Analysis ID is required.");
    }

    const response = await api.get(
      `/recommendations/analysis/${analysisId}`
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to retrieve recommendations."
    );
  }
};

/*
 * Get recommendations for the current user
 */
const getUserRecommendations = async () => {
  try {
    const response = await api.get(
      "/recommendations"
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to retrieve your recommendations."
    );
  }
};

/*
 * Get recommendations by skin concern
 */
const getRecommendationsByConcern = async (
  concern
) => {
  try {
    if (!concern) {
      throw new Error(
        "Skin concern is required."
      );
    }

    const response = await api.get(
      "/recommendations/concern",
      {
        params: {
          concern,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to retrieve recommendations for this concern."
    );
  }
};

/*
 * Get a single recommendation
 */
const getRecommendation = async (
  recommendationId
) => {
  try {
    if (!recommendationId) {
      throw new Error(
        "Recommendation ID is required."
      );
    }

    const response = await api.get(
      `/recommendations/${recommendationId}`
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to retrieve the recommendation."
    );
  }
};

/*
 * Get products related to a recommendation
 */
const getRecommendedProducts = async (
  recommendationId
) => {
  try {
    if (!recommendationId) {
      throw new Error(
        "Recommendation ID is required."
      );
    }

    const response = await api.get(
      `/recommendations/${recommendationId}/products`
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to retrieve recommended products."
    );
  }
};

/*
 * Format recommendation data for frontend
 */
const formatRecommendation = (
  recommendation
) => {
  if (!recommendation) {
    return null;
  }

  return {
    id:
      recommendation.id ||
      recommendation.recommendation_id ||
      null,

    title:
      recommendation.title ||
      "Skincare Recommendation",

    description:
      recommendation.description ||
      "",

    concern:
      recommendation.concern ||
      recommendation.concern_name ||
      "Overall Skin Health",

    priority:
      recommendation.priority ||
      "Medium",

    icon:
      recommendation.icon ||
      "🌿",

    productId:
      recommendation.product_id ||
      null,

    productName:
      recommendation.product_name ||
      null,
  };
};

/*
 * Format multiple recommendations
 */
const formatRecommendations = (
  recommendations
) => {
  if (!Array.isArray(recommendations)) {
    return [];
  }

  return recommendations
    .map(formatRecommendation)
    .filter(Boolean);
};

/*
 * Common API error handler
 */
const getErrorMessage = (
  error,
  defaultMessage
) => {
  if (error.response?.data?.message) {
    return new Error(
      error.response.data.message
    );
  }

  if (error.response?.data?.error) {
    return new Error(
      error.response.data.error
    );
  }

  if (error.message) {
    return new Error(error.message);
  }

  return new Error(defaultMessage);
};

const recommendationService = {
  getRecommendations,
  getUserRecommendations,
  getRecommendationsByConcern,
  getRecommendation,
  getRecommendedProducts,
  formatRecommendation,
  formatRecommendations,
};

export default recommendationService;