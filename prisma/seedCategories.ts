// 수리 대상 카테고리 트리 시드. slug 기준 upsert라 여러 번 실행해도 안전하다
// (기존 회원/업체 데이터를 건드리는 prisma/seed.ts와는 완전히 별개 스크립트).
//
// 실행: npm run db:seed:categories
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type CategorySeed = {
  name: string;
  slug: string;
  icon: string;
  children: { name: string; slug: string }[];
};

const CATEGORY_TREE: CategorySeed[] = [
  {
    name: "악기",
    slug: "instrument",
    icon: "guitar",
    children: [
      { name: "기타", slug: "instrument-guitar" },
      { name: "베이스", slug: "instrument-bass" },
      { name: "바이올린/현악기", slug: "instrument-strings" },
      { name: "피아노/키보드", slug: "instrument-piano" },
      { name: "관악기", slug: "instrument-wind" },
      { name: "타악기", slug: "instrument-percussion" },
      { name: "전자악기", slug: "instrument-electronic" },
      { name: "기타 악기", slug: "instrument-etc" },
    ],
  },
  {
    name: "음향기기",
    slug: "audio",
    icon: "speaker",
    children: [
      { name: "스피커", slug: "audio-speaker" },
      { name: "앰프", slug: "audio-amp" },
      { name: "믹서", slug: "audio-mixer" },
      { name: "마이크", slug: "audio-mic" },
      { name: "오디오 인터페이스", slug: "audio-interface" },
      { name: "헤드폰/이어폰", slug: "audio-headphone" },
      { name: "PA 시스템", slug: "audio-pa-system" },
      { name: "기타 음향기기", slug: "audio-etc" },
    ],
  },
  {
    name: "DJ/공연장비",
    slug: "dj-stage",
    icon: "disc3",
    children: [
      { name: "DJ 컨트롤러", slug: "dj-controller" },
      { name: "턴테이블", slug: "dj-turntable" },
      { name: "믹서", slug: "dj-mixer" },
      { name: "이펙터", slug: "dj-effector" },
      { name: "무선마이크", slug: "dj-wireless-mic" },
      { name: "공연용 조명", slug: "dj-stage-lighting" },
      { name: "기타 공연장비", slug: "dj-stage-etc" },
    ],
  },
  {
    name: "사진장비",
    slug: "photo",
    icon: "camera",
    children: [
      { name: "DSLR", slug: "photo-dslr" },
      { name: "미러리스", slug: "photo-mirrorless" },
      { name: "필름카메라", slug: "photo-film-camera" },
      { name: "렌즈", slug: "photo-lens" },
      { name: "플래시", slug: "photo-flash" },
      { name: "삼각대", slug: "photo-tripod" },
      { name: "짐벌", slug: "photo-gimbal" },
      { name: "기타 사진장비", slug: "photo-etc" },
    ],
  },
  {
    name: "영상장비",
    slug: "video",
    icon: "video",
    children: [
      { name: "캠코더", slug: "video-camcorder" },
      { name: "시네마 카메라", slug: "video-cinema-camera" },
      { name: "영상 모니터", slug: "video-monitor" },
      { name: "영상 스위처", slug: "video-switcher" },
      { name: "영상 조명", slug: "video-lighting" },
      { name: "녹음장비", slug: "video-recording-gear" },
      { name: "기타 영상장비", slug: "video-etc" },
    ],
  },
  {
    name: "드론",
    slug: "drone",
    icon: "plane",
    children: [
      { name: "드론 본체", slug: "drone-body" },
      { name: "조종기", slug: "drone-controller" },
      { name: "짐벌", slug: "drone-gimbal" },
      { name: "배터리", slug: "drone-battery" },
      { name: "프로펠러", slug: "drone-propeller" },
      { name: "카메라", slug: "drone-camera" },
      { name: "기타 드론 장비", slug: "drone-etc" },
    ],
  },
  {
    name: "3D프린터/제작장비",
    slug: "3d-printer",
    icon: "printer",
    children: [
      { name: "FDM 3D 프린터", slug: "printer-fdm" },
      { name: "레진 3D 프린터", slug: "printer-resin" },
      { name: "레이저 커터", slug: "printer-laser-cutter" },
      { name: "CNC", slug: "printer-cnc" },
      { name: "노즐/헤드", slug: "printer-nozzle-head" },
      { name: "베드", slug: "printer-bed" },
      { name: "모터/구동부", slug: "printer-motor-drive" },
      { name: "기타 제작장비", slug: "printer-etc" },
    ],
  },
  {
    name: "취미/전자장비",
    slug: "hobby",
    icon: "gamepad",
    children: [
      { name: "RC카", slug: "hobby-rc-car" },
      { name: "RC비행기", slug: "hobby-rc-plane" },
      { name: "전동 장난감", slug: "hobby-electric-toy" },
      { name: "게임기", slug: "hobby-game-console" },
      { name: "전자키트", slug: "hobby-electronic-kit" },
      { name: "기타 취미 전자장비", slug: "hobby-etc" },
    ],
  },
  {
    name: "아웃도어 장비",
    slug: "outdoor",
    icon: "tent",
    children: [
      { name: "캠핑 장비", slug: "outdoor-camping" },
      { name: "등산 장비", slug: "outdoor-hiking" },
      { name: "자전거 관련 장비", slug: "outdoor-bike" },
      { name: "낚시 장비", slug: "outdoor-fishing" },
      { name: "기타 레저장비", slug: "outdoor-etc" },
    ],
  },
];

async function main() {
  for (let i = 0; i < CATEGORY_TREE.length; i++) {
    const top = CATEGORY_TREE[i];
    const parent = await prisma.category.upsert({
      where: { slug: top.slug },
      update: { name: top.name, icon: top.icon, sortOrder: i },
      create: { name: top.name, slug: top.slug, icon: top.icon, sortOrder: i, parentId: null },
    });

    for (let j = 0; j < top.children.length; j++) {
      const child = top.children[j];
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: { name: child.name, parentId: parent.id, sortOrder: j },
        create: { name: child.name, slug: child.slug, parentId: parent.id, sortOrder: j },
      });
    }

    console.log(`✓ ${top.name} (${top.children.length}개 세부 품목)`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("카테고리 시드 완료");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
