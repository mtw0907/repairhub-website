import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { prisma } from "@/lib/prisma";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const companyIds = (ids ?? "").split(",").filter(Boolean).slice(0, 4);

  const companies = companyIds.length
    ? await prisma.company.findMany({
        where: { id: { in: companyIds } },
        include: {
          services: true,
          brands: true,
          priceItems: true,
          reviews: { where: { status: "VISIBLE" }, select: { rating: true } },
        },
      })
    : [];

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <h1 className="mb-6 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          업체 비교
        </h1>

        {companies.length < 2 ? (
          <p className="text-sm text-neutral-500">
            비교하려면{" "}
            <Link href="/companies" className="underline">
              업체 검색
            </Link>
            에서 2개 이상 선택해주세요.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <tbody>
                <tr>
                  <td className="w-32 border-b border-neutral-200 py-3 pr-4 font-medium text-neutral-500 dark:border-neutral-800">
                    업체명
                  </td>
                  {companies.map((c) => (
                    <td key={c.id} className="border-b border-neutral-200 py-3 pr-4 dark:border-neutral-800">
                      <Link href={`/companies/${c.id}`} className="font-semibold hover:underline">
                        {c.name}
                      </Link>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border-b border-neutral-200 py-3 pr-4 font-medium text-neutral-500 dark:border-neutral-800">
                    지역
                  </td>
                  {companies.map((c) => (
                    <td key={c.id} className="border-b border-neutral-200 py-3 pr-4 dark:border-neutral-800">
                      {c.region ?? "-"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border-b border-neutral-200 py-3 pr-4 font-medium text-neutral-500 dark:border-neutral-800">
                    평점
                  </td>
                  {companies.map((c) => {
                    const count = c.reviews.length;
                    const avg = count > 0 ? c.reviews.reduce((s, r) => s + r.rating, 0) / count : null;
                    return (
                      <td key={c.id} className="border-b border-neutral-200 py-3 pr-4 dark:border-neutral-800">
                        {avg ? `★ ${avg.toFixed(1)} (${count})` : "후기 없음"}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="border-b border-neutral-200 py-3 pr-4 font-medium text-neutral-500 dark:border-neutral-800">
                    서비스
                  </td>
                  {companies.map((c) => (
                    <td key={c.id} className="border-b border-neutral-200 py-3 pr-4 dark:border-neutral-800">
                      {c.services.map((s) => s.name).join(", ") || "-"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border-b border-neutral-200 py-3 pr-4 font-medium text-neutral-500 dark:border-neutral-800">
                    취급 브랜드
                  </td>
                  {companies.map((c) => (
                    <td key={c.id} className="border-b border-neutral-200 py-3 pr-4 dark:border-neutral-800">
                      {c.brands.map((b) => b.name).join(", ") || "-"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border-b border-neutral-200 py-3 pr-4 font-medium text-neutral-500 dark:border-neutral-800">
                    가격표
                  </td>
                  {companies.map((c) => (
                    <td key={c.id} className="border-b border-neutral-200 py-3 pr-4 align-top dark:border-neutral-800">
                      <ul className="space-y-1">
                        {c.priceItems.map((p) => (
                          <li key={p.id}>
                            {p.label}: {p.price.toLocaleString()}원
                          </li>
                        ))}
                        {c.priceItems.length === 0 && "-"}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-neutral-500">출장/택배</td>
                  {companies.map((c) => (
                    <td key={c.id} className="py-3 pr-4">
                      {c.onSiteVisit ? "출장 가능" : "출장 불가"} /{" "}
                      {c.courierDrop ? "택배 가능" : "택배 불가"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
