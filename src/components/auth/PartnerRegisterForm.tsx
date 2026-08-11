"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { OtpEmailField } from "@/components/auth/OtpEmailField";

export function PartnerRegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [bizRegNo, setBizRegNo] = useState("");
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState("");

  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCertificateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email);
    const res = await fetch("/api/auth/register-partner/upload", { method: "POST", body: formData });
    const data = await res.json().catch(() => null);
    setUploading(false);
    if (res.ok) {
      setCertificateUrl(data.url);
    } else {
      setError(typeof data?.error === "string" ? data.error : "사업자등록증 업로드 중 오류가 발생했습니다.");
    }
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!certificateUrl) {
      setError("사업자등록증을 업로드해주세요.");
      return;
    }
    setLoading(true);

    const res = await fetch("/api/auth/register-partner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
        companyName,
        ownerName,
        bizRegNo,
        address,
        region,
        certificateUrl,
        agreeTerms,
        agreePrivacy,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(typeof data?.error === "string" ? data.error : "가입 중 오류가 발생했습니다.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    if (!result || result.error) {
      router.push("/login");
      return;
    }
    router.push("/partner/dashboard");
    router.refresh();
  }

  const inputClass =
    "w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800";
  const labelClass = "mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4 rounded-2xl border border-neutral-200/70 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">계정 정보</h2>
        <div>
          <label className={labelClass}>담당자 이름</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <OtpEmailField
          email={email}
          onEmailChange={setEmail}
          purpose="REGISTER_PARTNER"
          verified={emailVerified}
          onVerifiedChange={setEmailVerified}
        />
        <div>
          <label className={labelClass}>전화번호 (선택)</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>비밀번호 (8자 이상)</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-neutral-200/70 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
          업체 정보 (필수 인증)
        </h2>
        <div>
          <label className={labelClass}>업체명</label>
          <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>대표자명</label>
          <input required value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>사업자등록번호</label>
          <input
            required
            value={bizRegNo}
            onChange={(e) => setBizRegNo(e.target.value)}
            placeholder="000-00-00000"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>업체 주소</label>
          <input required value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>지역 (검색용, 예: 서울특별시 마포구)</label>
          <input required value={region} onChange={(e) => setRegion(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>사업자등록증 이미지</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleCertificateChange}
            disabled={!emailVerified || uploading}
            className="text-sm"
          />
          {!emailVerified && (
            <p className="mt-1 text-xs text-neutral-400">이메일 인증을 먼저 완료해주세요.</p>
          )}
          {uploading && <p className="mt-1 text-xs text-neutral-500">업로드 중...</p>}
          {certificateUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={certificateUrl}
              alt="사업자등록증"
              className="mt-2 h-32 w-32 rounded-xl border border-neutral-200 object-cover dark:border-neutral-700"
            />
          )}
        </div>
        <p className="text-xs text-neutral-400">
          제출하신 사업자등록증은 AI가 1차 검토한 뒤, 관리자 최종 승인을 거쳐야 정식 운영이 가능합니다.
        </p>
      </div>

      <div className="space-y-2 rounded-xl bg-surface-muted px-3 py-3 dark:bg-neutral-800">
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            required
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 accent-primary"
          />
          <span>
            <Link
              href="/terms"
              target="_blank"
              className="font-medium underline underline-offset-2 transition-colors hover:text-primary"
            >
              이용약관
            </Link>
            에 동의합니다 (필수)
          </span>
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            required
            checked={agreePrivacy}
            onChange={(e) => setAgreePrivacy(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 accent-primary"
          />
          <span>
            <Link
              href="/privacy"
              target="_blank"
              className="font-medium underline underline-offset-2 transition-colors hover:text-primary"
            >
              개인정보 수집 및 이용
            </Link>
            에 동의합니다 (필수)
          </span>
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || !emailVerified || !certificateUrl || !agreeTerms || !agreePrivacy}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
      >
        {loading ? "가입 신청 중..." : "업체 가입 신청하기"}
      </button>
    </form>
  );
}
