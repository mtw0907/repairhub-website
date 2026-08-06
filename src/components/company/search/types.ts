export type MapBounds = {
  sw: { lat: number; lng: number };
  ne: { lat: number; lng: number };
};

export type SortBy = "recommended" | "distance" | "rating" | "reviews";

export const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "recommended", label: "추천순" },
  { value: "distance", label: "거리순" },
  { value: "rating", label: "평점순" },
  { value: "reviews", label: "리뷰 많은순" },
];
