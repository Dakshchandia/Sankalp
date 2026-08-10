import { format, formatDistanceToNow, parseISO } from "date-fns";
import { API_BASE_URL } from "@/lib/constants";

/**
 * Get the full image URL, handling both Cloudinary URLs and local uploads.
 */
export function getImageUrl(src: string): string {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  return `${API_BASE_URL}/uploads/${src}`;
}

/**
 * Format a date string to a readable format.
 */
export function formatDate(
  dateStr: string,
  pattern: string = "dd MMM yyyy"
): string {
  try {
    return format(parseISO(dateStr), pattern);
  } catch {
    return dateStr;
  }
}

/**
 * Format a datetime string to date + time.
 */
export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd MMM yyyy, hh:mm a");
  } catch {
    return dateStr;
  }
}

/**
 * Format a time string (HH:mm:ss) to 12-hour format.
 */
export function formatTime(timeStr: string): string {
  try {
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return timeStr;
  }
}

/**
 * Returns relative time string (e.g., "2 minutes ago").
 */
export function timeAgo(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

/**
 * Format currency in Indian Rupees.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a percentage value.
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Truncate a string to a maximum length with ellipsis.
 */
export function truncate(str: string, maxLength: number = 30): string {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
}

/**
 * Format a phone number for display.
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
  }
  return phone;
}

/**
 * Format worker ID for display.
 */
export function formatWorkerId(workerId: string): string {
  return workerId.toUpperCase();
}

/**
 * Get initials from a full name.
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}
