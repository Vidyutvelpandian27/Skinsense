import api from "./api";

/*
 * Get the logged-in user's analysis history
 */
const getHistory = async (params = {}) => {
  try {
    const response = await api.get(
      "/history",
      {
        params,
      }
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to retrieve analysis history."
    );
  }
};

/*
 * Get a single history record
 */
const getHistoryItem = async (historyId) => {
  try {
    if (!historyId) {
      throw new Error(
        "History ID is required."
      );
    }

    const response = await api.get(
      `/history/${historyId}`
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to retrieve the selected analysis."
    );
  }
};

/*
 * Delete a history record
 */
const deleteHistory = async (historyId) => {
  try {
    if (!historyId) {
      throw new Error(
        "History ID is required."
      );
    }

    const response = await api.delete(
      `/history/${historyId}`
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to delete the analysis history."
    );
  }
};

/*
 * Clear all analysis history
 */
const clearHistory = async () => {
  try {
    const response = await api.delete(
      "/history"
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to clear analysis history."
    );
  }
};

/*
 * Get the latest analysis from history
 */
const getLatestHistory = async (userId) => {
  try {
    const response = await api.get(
      "/history/latest"
      , { params: { user_id: userId } }
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to retrieve the latest analysis."
    );
  }
};

/*
 * Format one history item for the frontend
 */
const formatHistoryItem = (item) => {
  if (!item) {
    return null;
  }

  return {
    id:
      item.id ||
      item.analysis_id ||
      item.history_id ||
      null,

    analysisId:
      item.analysis_id ||
      item.id ||
      null,

    overallScore:
      item.overall_score ??
      item.score ??
      0,

    skinType:
      item.skin_type ||
      "Unknown",

    imageUrl:
      item.image_url ||
      item.image ||
      null,

    concerns:
      item.concerns ||
      [],

    createdAt:
      item.created_at ||
      item.date ||
      null,

    status:
      item.status ||
      "Completed",
  };
};

/*
 * Format multiple history records
 */
const formatHistory = (history) => {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .map(formatHistoryItem)
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

const historyService = {
  getHistory,
  getHistoryItem,
  deleteHistory,
  clearHistory,
  getLatestHistory,
  formatHistoryItem,
  formatHistory,
};

export default historyService;