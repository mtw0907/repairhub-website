import { ShieldCheck, Settings, Server, LayoutDashboard } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/DashboardShell";
import { isMaintenanceMode } from "@/lib/systemSettings";

export default async function SuperAdminDashboardPage() {
  const session = await auth();
  const [adminCount, maintenanceOn] = await Promise.all([
    prisma.user.count({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] }, status: "ACTIVE" } }),
    isMaintenanceMode(),
  ]);

  return (
    <DashboardShell
      roleLabel="최고관리자"
      userName={session?.user?.name ?? "최고관리자"}
      sections={[
        {
          title: "관리자 · 권한 관리",
          icon: ShieldCheck,
          items: [
            {
              label: `관리자 계정 생성 · 권한 변경 · 삭제 (현재 ${adminCount}명)`,
              href: "/super-admin/dashboard/admins",
            },
            { label: "관리자 활동 로그 확인", href: "/super-admin/dashboard/logs" },
            { label: "내 계정 (비밀번호 변경)", href: "/super-admin/dashboard/profile" },
          ],
        },
        {
          title: "시스템 설정",
          icon: Settings,
          items: [
            {
              label: "API Key · AI · 결제 · SMTP · 환경변수 · 보안 설정",
              href: "/super-admin/dashboard/settings",
            },
          ],
        },
        {
          title: "운영",
          icon: Server,
          items: [
            { label: "DB 백업 · 복원", href: "/super-admin/dashboard/backup" },
            {
              label: `시스템 점검 모드: ${maintenanceOn ? "ON" : "OFF"}`,
              href: "/super-admin/dashboard/settings",
            },
          ],
        },
        {
          title: "일반 관리자 기능 전체",
          icon: LayoutDashboard,
          items: [
            { label: "ADMIN 대시보드로 이동 (회원·업체·예약·통계 등)", href: "/admin/dashboard" },
          ],
        },
      ]}
    />
  );
}
