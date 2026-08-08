import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
  name: z.string().min(1, "이름을 입력해주세요."),
  phone: z.string().optional(),
  agreeTerms: z.literal(true, "이용약관에 동의해주세요."),
  agreePrivacy: z.literal(true, "개인정보 수집 및 이용에 동의해주세요."),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const VERIFICATION_PURPOSES = [
  "REGISTER_USER",
  "REGISTER_PARTNER",
  "RESET_PASSWORD",
  "LOGIN",
] as const;
export type VerificationPurpose = (typeof VERIFICATION_PURPOSES)[number];

export const sendOtpSchema = z.object({
  email: z.string().email(),
  purpose: z.enum(VERIFICATION_PURPOSES),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  purpose: z.enum(VERIFICATION_PURPOSES),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  newPassword: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
});

export const registerPartnerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
  name: z.string().min(1, "이름을 입력해주세요."),
  phone: z.string().optional(),
  companyName: z.string().min(1, "업체명을 입력해주세요."),
  ownerName: z.string().min(1, "대표자명을 입력해주세요."),
  bizRegNo: z.string().min(1, "사업자등록번호를 입력해주세요."),
  address: z.string().min(1, "주소를 입력해주세요."),
  region: z.string().min(1, "지역을 입력해주세요."),
  certificateUrl: z.string().min(1, "사업자등록증을 업로드해주세요."),
  agreeTerms: z.literal(true, "이용약관에 동의해주세요."),
  agreePrivacy: z.literal(true, "개인정보 수집 및 이용에 동의해주세요."),
});

export type RegisterPartnerInput = z.infer<typeof registerPartnerSchema>;
