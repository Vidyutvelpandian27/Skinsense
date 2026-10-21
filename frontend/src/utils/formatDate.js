/*
 * Format date as:
 * 25 Aug 2026
 */
export const formatDate = (date) => {
  if (!date) {
    return "N/A";
  }

  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

/*
 * Format date and time
 */
export const formatDateTime = (date) => {
  if (!date) {
    return "N/A";
  }

  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return parsedDate.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

/*
 * Format relative time
 *
 * Example:
 * Just now
 * 5 minutes ago
 * 2 hours ago
 * 3 days ago
 */
export const formatRelativeTime = (date) => {
  if (!date) {
    return "N/A";
  }

  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  const now = new Date();

  const difference =
    now.getTime() -
    parsedDate.getTime();

  const seconds = Math.floor(
    difference / 1000
  );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(
    seconds / 60
  );

  if (minutes < 60) {
    return `${minutes} minute${
      minutes !== 1 ? "s" : ""
    } ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours} hour${
      hours !== 1 ? "s" : ""
    } ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 30) {
    return `${days} day${
      days !== 1 ? "s" : ""
    } ago`;
  }

  return formatDate(date);
};

/*
 * Convert date to input format:
 * YYYY-MM-DD
 */
export const formatDateForInput = (date) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate
    .toISOString()
    .split("T")[0];
};