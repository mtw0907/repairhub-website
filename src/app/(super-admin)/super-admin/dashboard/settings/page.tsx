import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";
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
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/super-admin/dashboard" />
      <main className="mx-auto max-w-2xl space-y-10 px-4 py-8 sm:px-6 sm:py-10">
        <div>
          <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
            시스템 설정
          </h1>
        </div>

        <section>
          <h2 className="mb-3 text-sm font-bold text-neutral-900 dark:text-neutral-100">
            API Key 관리
          </h2>
          <div className="space-y-4">{field("OPENAI_API_KEY", "OpenAI API Key")}</div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold text-neutral-900 dark:text-neutral-100">
            AI 설정
          </h2>
          <div className="space-y-4">
            {field("AI_MODEL", "AI 모델명 (예: gpt-4o-mini)")}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold text-neutral-900 dark:text-neutral-100">
            결제 설정
          </h2>
          <div className="space-y-4">
            {field("PAYMENT_PROVIDER", "결제대행사 (예: toss)")}
            {field("PAYMENT_CLIENT_KEY", "토스페이먼츠 Client Key (test_ck_...)")}
            {field("PAYMENT_SECRET_KEY", "토스페이먼츠 Secret Key (test_sk_...)")}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold text-neutral-900 dark:text-neutral-100">
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
          <h2 className="mb-3 text-sm font-bold text-neutral-900 dark:text-neutral-100">
            소셜 로그인
          </h2>
          <p className="mb-3 text-xs text-neutral-500">
            Client ID/Secret을 등록하면 로그인 화면에 해당 소셜 로그인 버튼이 자동으로 나타납니다.
            리다이렉트 URI는 각 서비스 개발자 콘솔에 다음과 같이 등록하세요: {"{배포주소}"}
            /api/auth/callback/google (또는 kakao, naver)
          </p>
          <div className="space-y-4">
            {field("GOOGLE_CLIENT_ID", "Google Client ID")}
            {field("GOOGLE_CLIENT_SECRET", "Google Client Secret")}
            {field("KAKAO_CLIENT_ID", "Kakao REST API 키 (Client ID)")}
            {field("KAKAO_CLIENT_SECRET", "Kakao Client Secret")}
            {field("NAVER_CLIENT_ID", "Naver Client ID")}
            {field("NAVER_CLIENT_SECRET", "Naver Client Secret")}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold text-neutral-900 dark:text-neutral-100">
            지도
          </h2>
          <p className="mb-3 text-xs text-neutral-500">
            업체 찾기 페이지의 지도 검색에 사용됩니다. Kakao Developers → 내 애플리케이션 →
            JavaScript 키를 등록하고, 플랫폼 설정에 사이트 도메인(예: http://localhost:3000,
            실제 배포 도메인)을 반드시 등록해야 지도가 표시됩니다. 이 키는 브라우저에 그대로
            노출되는 값이라(도메인 제한으로 보호) 서버 비밀키와 성격이 다릅니다.
          </p>
          <div className="space-y-4">{field("KAKAO_MAP_JS_KEY", "Kakao Maps JavaScript 키")}</div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold text-neutral-900 dark:text-neutral-100">
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
          <h2 className="mb-3 text-sm font-bold text-neutral-900 dark:text-neutral-100">
            기타 환경변수 관리
          </h2>
          <CustomSettingsManager settings={customSettings} />
        </section>
      </main>
    </div>
  );
}
