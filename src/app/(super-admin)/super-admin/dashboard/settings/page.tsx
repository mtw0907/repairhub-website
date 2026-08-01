import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";
import { SettingField } from "@/components/super-admin/SettingField";
import { SettingToggle } from "@/components/super-admin/SettingToggle";
import { CustomSettingsManager } from "@/components/super-admin/CustomSettingsManager";
import { KNOWN_SETTING_KEYS, isSensitiveKey } from "@/lib/systemSettings";

export default async function SuperAdminSettingsPage() {
  const settings = await prisma.systemSetting.findMany();
  const map = new Map(settings.map((s) => [s.key, s.value]));
  const customSettings = settings
    .filter((s) => !KNOWN_SETTING_KEYS.includes(s.key as (typeof KNOWN_SETTING_KEYS)[number]))
    .map((s) => ({ key: s.key, value: s.value }));

  function field(key: string, label: string) {
    const sensitive = isSensitiveKey(key);
    return (
      <SettingField
        key={key}
        settingKey={key}
        label={label}
        sensitive={sensitive}
        initialValue={sensitive ? null : (map.get(key) ?? null)}
        hasValue={map.has(key)}
      />
    );
  }

  return (
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/super-admin/dashboard" className="text-sm text-neutral-500 hover:underline">
          ← 대시보드로
        </Link>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-2xl space-y-10 px-6 py-8">
        <div>
          <h1 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            시스템 설정
          </h1>
        </div>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            API Key 관리
          </h2>
          <div className="space-y-4">{field("OPENAI_API_KEY", "OpenAI API Key")}</div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            AI 설정
          </h2>
          <div className="space-y-4">
            {field("AI_MODEL", "AI 모델명 (예: gpt-4o-mini)")}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            결제 설정
          </h2>
          <div className="space-y-4">
            {field("PAYMENT_PROVIDER", "결제대행사 (예: toss)")}
            {field("PAYMENT_CLIENT_KEY", "토스페이먼츠 Client Key (test_ck_...)")}
            {field("PAYMENT_SECRET_KEY", "토스페이먼츠 Secret Key (test_sk_...)")}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            이메일(SMTP) 설정
          </h2>
          <div className="space-y-4">
            {field("SMTP_HOST", "SMTP 호스트")}
            {field("SMTP_PORT", "SMTP 포트")}
            {field("SMTP_USER", "SMTP 사용자")}
            {field("SMTP_PASSWORD", "SMTP 비밀번호")}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            보안 설정
          </h2>
          <SettingToggle
            settingKey="REGISTRATION_LOCKED"
            label="신규 회원가입 잠금"
            description="켜면 /register를 통한 신규 가입이 차단됩니다."
            initialValue={map.get("REGISTRATION_LOCKED") === "true"}
          />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            기타 환경변수 관리
          </h2>
          <CustomSettingsManager settings={customSettings} />
        </section>
      </main>
    </div>
  );
}
