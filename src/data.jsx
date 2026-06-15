import rawData from "./data.json";

export const SPACE_TYPES = rawData.spaceTypes;
export const SPACE_TYPE_LABELS = rawData.spaceTypeLabels;
export const STATUS_LABELS = rawData.statusLabels;
export const STATUS = {
  AVAILABLE: "available",
  MAINTENANCE: "maintenance",
  OCCUPIED: "occupied",
};

export const initialSpaces = rawData.spaces;

// Helper: build an ISO date string relative to today
const genDate = (daysAgo, h, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export const initialBookings = rawData.bookings.map((b) => ({
  ...b,
  // BK021 has a fixed date, all others are relative
  date: b.date ?? genDate(b.daysAgo, b.startHour),
  createdAt: genDate(b.createdDaysAgo, b.createdHour),
}));
