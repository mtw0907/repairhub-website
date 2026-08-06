import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PASSWORD = "Passw0rd!";

async function seedCompany(data: {
  id: string;
  name: string;
  ownerName: string;
  address: string;
  region: string;
  phone: string;
  introduction: string;
  onSiteVisit: boolean;
  courierDrop: boolean;
  latitude: number;
  longitude: number;
  businessHours: Record<string, string>;
  closedDays: string[];
  services: string[];
  brands: string[];
  prices: { label: string; price: number }[];
}) {
  const shared = {
    name: data.name,
    ownerName: data.ownerName,
    address: data.address,
    region: data.region,
    phone: data.phone,
    introduction: data.introduction,
    onSiteVisit: data.onSiteVisit,
    courierDrop: data.courierDrop,
    latitude: data.latitude,
    longitude: data.longitude,
    businessHours: JSON.stringify(data.businessHours),
    closedDays: JSON.stringify(data.closedDays),
  };

  const company = await prisma.company.upsert({
    where: { id: data.id },
    update: shared,
    create: {
      id: data.id,
      status: "APPROVED",
      ...shared,
    },
  });

  for (const name of data.services) {
    const existing = await prisma.service.findFirst({
      where: { companyId: company.id, name },
    });
    if (!existing) {
      await prisma.service.create({ data: { companyId: company.id, name } });
    }
  }

  for (const name of data.brands) {
    const existing = await prisma.brand.findFirst({
      where: { companyId: company.id, name },
    });
    if (!existing) {
      await prisma.brand.create({ data: { companyId: company.id, name } });
    }
  }

  for (const p of data.prices) {
    const existing = await prisma.priceItem.findFirst({
      where: { companyId: company.id, label: p.label },
    });
    if (!existing) {
      await prisma.priceItem.create({
        data: { companyId: company.id, label: p.label, price: p.price },
      });
    }
  }

  return company;
}

async function main() {
  const hashed = await bcrypt.hash(PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: "user@repairhub.test" },
    update: {},
    create: {
      email: "user@repairhub.test",
      password: hashed,
      name: "테스트 사용자",
      role: "USER",
    },
  });

  const company = await seedCompany({
    id: "seed-company-1",
    name: "하모니 악기수리",
    ownerName: "김파트너",
    address: "서울특별시 마포구 월드컵로 1",
    region: "서울특별시 마포구",
    phone: "02-1234-5678",
    introduction: "기타/베이스/앰프 전문 수리업체입니다.",
    onSiteVisit: true,
    courierDrop: true,
    latitude: 37.568,
    longitude: 126.9014,
    businessHours: {
      mon: "10:00-19:00",
      tue: "10:00-19:00",
      wed: "10:00-19:00",
      thu: "10:00-19:00",
      fri: "10:00-19:00",
      sat: "11:00-17:00",
    },
    closedDays: ["sun"],
    services: ["기타 수리", "베이스 수리", "앰프 수리", "프렛 작업"],
    brands: ["Fender", "Gibson", "Marshall"],
    prices: [
      { label: "프렛 크라운 작업", price: 80000 },
      { label: "넥 조정", price: 40000 },
      { label: "픽업 교체", price: 60000 },
    ],
  });

  await seedCompany({
    id: "seed-company-2",
    name: "사운드케어 스피커수리",
    ownerName: "이대표",
    address: "서울특별시 강남구 테헤란로 123",
    region: "서울특별시 강남구",
    phone: "02-2345-6789",
    introduction: "스피커/앰프/믹서 등 음향기기 전문 수리업체입니다.",
    onSiteVisit: true,
    courierDrop: true,
    latitude: 37.5,
    longitude: 127.0364,
    businessHours: {
      mon: "09:00-20:00",
      tue: "09:00-20:00",
      wed: "09:00-20:00",
      thu: "09:00-20:00",
      fri: "09:00-20:00",
      sat: "09:00-20:00",
    },
    closedDays: ["sun"],
    services: ["스피커 수리", "믹서 수리", "앰프 수리"],
    brands: ["JBL", "Yamaha", "QSC"],
    prices: [
      { label: "우퍼 유닛 교체", price: 120000 },
      { label: "전원부 수리", price: 90000 },
    ],
  });

  await seedCompany({
    id: "seed-company-3",
    name: "드럼닥터",
    ownerName: "박사장",
    address: "부산광역시 해운대구 센텀중앙로 45",
    region: "부산광역시 해운대구",
    phone: "051-345-6789",
    introduction: "드럼/타악기 전문 수리 및 튜닝 업체입니다.",
    onSiteVisit: false,
    courierDrop: true,
    latitude: 35.1691,
    longitude: 129.1306,
    businessHours: {
      tue: "10:00-19:00",
      wed: "10:00-19:00",
      thu: "10:00-19:00",
      fri: "10:00-19:00",
      sat: "10:00-19:00",
      sun: "10:00-19:00",
    },
    closedDays: ["mon"],
    services: ["드럼 수리", "헤드 교체", "튜닝"],
    brands: ["Pearl", "Tama", "Yamaha"],
    prices: [
      { label: "헤드 교체 (1개)", price: 25000 },
      { label: "전체 튜닝", price: 50000 },
    ],
  });

  const partner = await prisma.user.upsert({
    where: { email: "partner@repairhub.test" },
    update: { companyId: company.id },
    create: {
      email: "partner@repairhub.test",
      password: hashed,
      name: "테스트 파트너",
      role: "PARTNER",
      companyId: company.id,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@repairhub.test" },
    update: {},
    create: {
      email: "admin@repairhub.test",
      password: hashed,
      name: "테스트 관리자",
      role: "ADMIN",
    },
  });

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@repairhub.test" },
    update: {},
    create: {
      email: "superadmin@repairhub.test",
      password: hashed,
      name: "테스트 최고관리자",
      role: "SUPER_ADMIN",
    },
  });

  const existingReview = await prisma.review.findFirst({
    where: { userId: user.id, companyId: company.id },
  });
  if (!existingReview) {
    await prisma.review.create({
      data: {
        userId: user.id,
        companyId: company.id,
        rating: 5,
        content: "기타 프렛 작업 정말 꼼꼼하게 해주셨어요. 소리가 훨씬 좋아졌습니다.",
      },
    });
  }

  console.log("Seeded accounts (password for all:", PASSWORD, ")");
  console.log({
    user: user.email,
    partner: partner.email,
    admin: admin.email,
    superAdmin: superAdmin.email,
    company: company.name,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
