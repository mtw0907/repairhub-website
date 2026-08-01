export const ROLES = ["USER", "PARTNER", "ADMIN", "SUPER_ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ["ACTIVE", "SUSPENDED", "DELETED"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const COMPANY_STATUSES = ["PENDING", "APPROVED", "SUSPENDED", "UNVERIFIED"] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export const RESERVATION_STATUSES = [
  "REQUESTED",
  "APPROVED",
  "CHANGED",
  "CANCELED",
  "COMPLETED",
  "NO_SHOW",
] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

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

export const PRO_PLAN_PRICE = 29000; // KRW/월, 원 단위. 별도 요금제 체계 없이 단일 Pro 플랜.
