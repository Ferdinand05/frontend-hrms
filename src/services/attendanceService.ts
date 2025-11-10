import axios from "axios";
import { useAuthStore } from "@/stores/auth";

export function useAttendanceService() {
  const auth = useAuthStore();

  const api = axios.create({
    baseURL: auth.apiUrl,
    headers: {
      Authorization: `Bearer ${auth.getToken}`,
    },
  });

  const getOfficeDetail = (id: number) => api.get(`/offices/${id}`);
  const getTodayAttendance = () => api.get("/attendances/get/today-attendance");
  const checkInUser = (data: FormData) => api.post("/attendances/user/check-in", data);
  const checkOutUser = () => api.post("/attendances/user/check-out");

  return {
    getOfficeDetail,
    getTodayAttendance,
    checkInUser,
    checkOutUser,
  };
}

// menghitung jarak antara user dengan kantor/offices
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // radius bumi dalam meter
  const toRad = (value: number) => (value * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance; // hasil dalam meter
}

// Helper: convert image URL ke base64
export function toBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // penting kalau beda domain
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg"));
      } else {
        reject("Canvas context error");
      }
    };
    img.onerror = reject;
  });
}
