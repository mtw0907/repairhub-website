export const ROLES = ["USER", "PARTNER", "ADMIN", "SUPER_ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ["ACTIVE", "SUSPENDED", "DELETED"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const COMPANY_STATUSES = ["PENDING", "APPROVED", "SUSPENDED", "UNVERIFIED"] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export const RESERVATION_STATUSES = [
  "REQUESTED",
  "APPROVED",
  "CONFIRMED",
  "IN_PROGRESS",
  "CHANGED",
  "CANCELED",
  "COMPLETED",
  "NO_SHOW",
] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

// Shared across the mypage reservation list and the company search/map
// cards, so a status badge always reads identically wherever it shows up.
export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  REQUESTED: "요청됨",
  APPROVED: "승인됨",
  CONFIRMED: "확정됨",
  IN_PROGRESS: "수리중",
  CHANGED: "변경됨",
  CANCELED: "취소됨",
  COMPLETED: "완료됨",
  NO_SHOW: "노쇼",
};

export const RESERVATION_STATUS_STYLE: Record<ReservationStatus, string> = {
  REQUESTED: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  APPROVED: "bg-primary/10 text-primary",
  CONFIRMED: "bg-primary/10 text-primary",
  IN_PROGRESS: "bg-accent/15 text-accent-foreground dark:text-accent",
  CHANGED: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  CANCELED: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800",
  COMPLETED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  NO_SHOW: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

// 예약 방법: 방문(고객이 업체로), 출장(업체가 고객에게), 택배(고객이 발송)
export const RESERVATION_METHODS = ["VISIT", "ONSITE", "COURIER"] as const;
export type ReservationMethod = (typeof RESERVATION_METHODS)[number];

export const RESERVATION_METHOD_LABEL: Record<ReservationMethod, string> = {
  VISIT: "방문",
  ONSITE: "출장",
  COURIER: "택배",
};

// Role hierarchy for RBAC checks: a higher role automatically satisfies
// requirements written for any role at or below it in this list, EXCEPT
// that ADMIN never inherits SUPER_ADMIN-only permissions (handled explicitly
// in requireRole rather than via ordering).
export const ROLE_DASHBOARD_PATH: Record<Role, string> = {
  USER: "/dashboard",
  PARTNER: "/partner/dashboard",
  ADMIN: "/admin/dashboard",
  SUPER_ADMIN: "/super-admin/dashboard",
};

export const PRO_PLAN_PRICE = 9900; // KRW/월, 원 단위. 별도 요금제 체계 없이 단일 Pro 플랜.

// 랜딩/검색 페이지의 카테고리 바로가기용 큐레이션 목록. Service는 파트너가
// 자유 텍스트로 입력하므로 DB에 실제 카테고리 테이블은 없음 — 이 목록은
// /companies?keyword= 검색으로 연결되는 UI 전용 shortcut이며 실데이터 분류가 아님.
export const INSTRUMENT_CATEGORIES = [
  { label: "기타", icon: "guitar" },
  { label: "베이스", icon: "guitar" },
  { label: "드럼", icon: "drum" },
  { label: "건반", icon: "piano" },
  { label: "관악기", icon: "wind" },
  { label: "현악기", icon: "music" },
  { label: "앰프·스피커", icon: "speaker" },
  { label: "마이크·음향장비", icon: "mic" },
] as const;

// AI 수리 견적 매칭(RepairRequest) Step 1 선택지. category: INSTRUMENT | AUDIO_EQUIPMENT
export const REPAIR_TARGETS: Record<"INSTRUMENT" | "AUDIO_EQUIPMENT", { label: string; items: string[] }> = {
  INSTRUMENT: {
    label: "악기",
    items: ["기타", "베이스", "피아노", "바이올린", "드럼", "관악기"],
  },
  AUDIO_EQUIPMENT: {
    label: "음향기기",
    items: ["앰프", "스피커", "믹서", "마이크", "오디오 인터페이스"],
  },
};

// RepairRequest Step 4 지역 매칭 기준 (실제 위경도 데이터가 없어 텍스트 지역 매칭만 지원)
export const REGION_SCOPES: { value: "DONG" | "GU" | "SI"; label: string }[] = [
  { value: "DONG", label: "같은 동" },
  { value: "GU", label: "같은 구" },
  { value: "SI", label: "같은 시" },
];

// 사용자당 하루 AI 수리 견적 매칭 요청 가능 횟수 (자정 기준 쿨다운)
export const REPAIR_REQUEST_DAILY_LIMIT = 3;
// 한 번의 매칭에서 견적 요청을 보낼 수 있는 최대 업체 수
export const REPAIR_REQUEST_MAX_MATCHES = 3;
