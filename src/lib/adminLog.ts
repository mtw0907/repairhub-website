import { prisma } from "@/lib/prisma";

// action examples: LOGIN_SUCCESS | LOGIN_FAILURE | ADMIN_CREATE | ADMIN_DELETE |
// ROLE_CHANGE | SETTINGS_UPDATE | DB_BACKUP | DB_RESTORE | MAINTENANCE_TOGGLE
export async function logAdminActivity(adminId: string, action: string, detail?: string) {
  await prisma.adminActivityLog.create({
    data: { adminId, action, detail },
  });
}
