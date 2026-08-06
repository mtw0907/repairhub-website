import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/constants";

type NotifyInput = {
  type: string;
  title: string;
  body?: string;
  link?: string;
};

export async function notify(userId: string, input: NotifyInput) {
  await prisma.notification.create({ data: { userId, ...input } });
}

export async function notifyMany(userIds: string[], input: NotifyInput) {
  if (userIds.length === 0) return;
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({ userId, ...input })),
  });
}

export async function notifyRole(role: Role, input: NotifyInput, excludeUserId?: string) {
  const users = await prisma.user.findMany({
    where: { role, status: "ACTIVE", ...(excludeUserId ? { id: { not: excludeUserId } } : {}) },
    select: { id: true },
  });
  await notifyMany(
    users.map((u) => u.id),
    input,
  );
}

export async function notifyCompanyOwners(companyId: string, input: NotifyInput) {
  const owners = await prisma.user.findMany({
    where: { companyId, status: "ACTIVE" },
    select: { id: true },
  });
  await notifyMany(
    owners.map((u) => u.id),
    input,
  );
}
