import dayjs from "dayjs";

export function formatTimestamp(timestamp) {
  const date = dayjs(timestamp);
  const now = dayjs();
  const diffMs = now.diff(date);

  if (diffMs < 60000) {
    // Less than a minute
    return "few seconds ago";
  } else if (diffMs < 3600000) {
    // Less than an hour
    const minutes = Math.floor(diffMs / 60000);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (diffMs < 86400000) {
    // Less than a day
    const hours = Math.floor(diffMs / 3600000);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else if (diffMs < 172800000) {
    // Less than 2 days (48 hours)
    return "1 day ago";
  } else if (diffMs < 2592000000) {
    // Less than 30 days
    const days = Math.floor(diffMs / 86400000);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } else {
    return date.format("YYYY-MM-DD"); // If more than 30 days, show the full date
  }
}
