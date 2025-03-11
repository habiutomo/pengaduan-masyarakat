import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "d MMM yyyy", { locale: id });
}

export function formatDateTime(date: Date | string): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "d MMM yyyy - HH:mm", { locale: id });
}

export function generateTrackingId(): string {
  const dateStr = format(new Date(), "yyyyMMdd");
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `PGD-${dateStr}${randomNum}`;
}

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-yellow-500";
    case "verified":
      return "bg-blue-500";
    case "rejected":
      return "bg-red-500";
    case "inprogress":
      return "bg-purple-500";
    case "resolved":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
}

export function getStatusText(status: string): string {
  switch (status) {
    case "pending":
      return "Menunggu Verifikasi";
    case "verified":
      return "Diverifikasi";
    case "rejected":
      return "Ditolak";
    case "inprogress":
      return "Dalam Proses";
    case "resolved":
      return "Selesai";
    default:
      return status;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export const NIK_REGEX = /^\d{16}$/;
export const PHONE_REGEX = /^08\d{8,11}$/;

export function generateRandomToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
