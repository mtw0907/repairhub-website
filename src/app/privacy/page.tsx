import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "개인정보처리방침 | 소리수리",
};

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. 수집하는 개인정보 항목 및 수집방법",
    body: [
      "회사는 회원가입, 서비스 이용 과정에서 아래와 같은 개인정보를 수집합니다.",
      "① 일반회원: 이름, 이메일 주소, 비밀번호(암호화 저장), 전화번호(선택)",
      "② 업체회원: 위 항목에 더해 업체명, 대표자명, 사업자등록번호, 업체 주소, 사업자등록증 이미지",
      "③ 소셜 로그인(Google/카카오/네이버) 이용 시: 각 제공자가 동의 절차를 거쳐 제공하는 이메일, 이름 등 최소한의 프로필 정보",
      "④ 서비스 이용 과정에서 자동으로 생성·수집되는 정보: 접속 로그, 서비스 이용 기록, 예약·견적·후기 등 작성 내역",
    ],
  },
  {
    title: "2. 개인정보의 수집 및 이용목적",
    body: [
      "① 회원가입 의사 확인, 본인 식별·인증, 회원자격 유지·관리",
      "② 수리업체 검색·비교·예약·견적·문의·후기 등 서비스 제공 및 이행",
      "③ 업체회원의 사업자 정보 진위 확인 및 입점 심사",
      "④ 부가서비스(Pro 구독 등) 결제 및 정산",
      "⑤ 공지사항 전달, 민원 처리 등 원활한 의사소통, 서비스 관련 알림(인앱 알림, 이메일) 발송",
      "⑥ 부정 이용 방지, 서비스 개선을 위한 통계·분석",
    ],
  },
  {
    title: "3. 개인정보의 보유 및 이용기간",
    body: [
      "① 회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.",
      "② 다만 관계 법령(전자상거래 등에서의 소비자보호에 관한 법률, 통신비밀보호법 등)에 따라 보존할 필요가 있는 경우, 회사는 관계 법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.",
      "③ 회원 탈퇴 시 개인정보는 지체 없이 파기하되, 부정이용 방지 등을 위해 필요한 최소한의 정보는 관련 법령이 정한 기간 동안 별도 보관될 수 있습니다.",
    ],
  },
  {
    title: "4. 개인정보의 제3자 제공",
    body: [
      "회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 아래의 경우에는 예외로 합니다.",
      "① 이용자가 사전에 동의한 경우",
      "② 회원이 특정 업체에 예약·견적을 요청하는 경우, 원활한 서비스 제공을 위해 필요한 최소한의 정보(이름, 연락처, 요청 내용 등)가 해당 업체회원에게 제공됩니다.",
      "③ 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우",
    ],
  },
  {
    title: "5. 개인정보처리의 위탁",
    body: [
      "회사는 서비스 제공을 위해 아래와 같이 개인정보 처리를 외부 업체에 위탁하고 있습니다.",
      "① 클라우드 서버 호스팅 및 데이터 저장: Vercel Inc., Neon Inc.",
      "② 이메일(인증번호, 알림 등) 발송: 이용 중인 SMTP 서비스 제공사",
      "③ 지도 정보 제공: 카카오(Kakao Maps)",
      "④ 결제 처리: 토스페이먼츠 등 전자지급결제대행사(PG사) — 등록된 경우에 한함",
      "회사는 위탁계약 체결 시 개인정보보호 관련 법령 준수, 재위탁 제한, 안전성 확보조치 등을 명시하고 관리·감독합니다.",
    ],
  },
  {
    title: "6. 이용자의 권리와 행사방법",
    body: [
      "① 이용자는 언제든지 서비스 내 계정 설정 화면에서 자신의 개인정보를 조회·수정할 수 있으며, 회원 탈퇴를 통해 이용을 중지하고 개인정보 삭제를 요청할 수 있습니다.",
      "② 이용자는 개인정보 열람, 정정·삭제, 처리정지를 요청할 권리를 가지며, 회사는 관계 법령에 따라 지체 없이 조치합니다.",
    ],
  },
  {
    title: "7. 쿠키(Cookie)의 운영",
    body: [
      "① 회사는 로그인 상태 유지 등 서비스 제공을 위해 쿠키를 사용할 수 있습니다.",
      "② 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 로그인이 필요한 일부 서비스 이용에 어려움이 있을 수 있습니다.",
    ],
  },
  {
    title: "8. 개인정보의 안전성 확보조치",
    body: [
      "회사는 비밀번호 암호화 저장, 접근권한 관리, 전송구간 암호화(HTTPS) 등 개인정보의 안전성 확보를 위해 필요한 기술적·관리적 조치를 취하고 있습니다.",
    ],
  },
  {
    title: "9. 개인정보 보호책임자",
    body: [
      "회사는 개인정보 처리에 관한 업무를 총괄하고 이용자의 불만 처리 및 피해 구제를 위해 개인정보 보호책임자를 지정하고 있습니다.",
      "문의: 소리수리 고객센터 (서비스 내 문의하기 또는 고객센터 이메일)",
    ],
  },
  {
    title: "10. 고지의 의무",
    body: [
      "이 개인정보처리방침은 법령·정책 또는 보안기술의 변경에 따라 내용의 추가·삭제 및 수정이 있을 시에는 시행 최소 7일 전부터 서비스 내 공지사항을 통해 고지할 것입니다.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-full bg-surface-muted">
      <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          <ArrowLeft className="h-4 w-4" />
          홈으로
        </Link>

        <h1 className="text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          개인정보처리방침
        </h1>
        <p className="mt-2 text-sm text-neutral-500">시행일: 2026년 8월 7일</p>

        <div className="mt-8 space-y-8 rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="mb-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.body.map((line, i) => (
                  <p key={i} className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {line}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <p className="border-t border-neutral-100 pt-4 text-xs text-neutral-400 dark:border-neutral-800">
            ※ 사업자등록 완료 후 회사의 상호·대표자·사업자등록번호·주소 등 사업자 정보 및 개인정보 보호책임자 연락처가 하단에 추가로 고지될 예정입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
