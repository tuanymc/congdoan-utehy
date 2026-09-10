import type { LegalExamResultsDto } from "@congdoan/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

const SCORE_BUCKETS = [
  { label: "< 50", min: 0, max: 50 },
  { label: "50–59", min: 50, max: 60 },
  { label: "60–69", min: 60, max: 70 },
  { label: "70–79", min: 70, max: 80 },
  { label: "80–89", min: 80, max: 90 },
  { label: "90–100", min: 90, max: 101 }
] as const;

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const even = sorted.length % 2 === 0;
  const left = sorted[mid - 1];
  const right = sorted[mid];
  if (even && left !== undefined && right !== undefined) return (left + right) / 2;
  return right ?? left ?? null;
}

function BarRow({
  label,
  value,
  max,
  display,
  colorClass = "bg-primary"
}: {
  label: string;
  value: number;
  max: number;
  display: string;
  colorClass?: string;
}) {
  const width = max > 0 ? Math.max((value / max) * 100, value > 0 ? 2 : 0) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="min-w-0 truncate">{label}</span>
        <span className="shrink-0 text-muted-foreground">{display}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted" role="img" aria-label={`${label}: ${display}`}>
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function Donut({
  passed,
  failed,
  passRate
}: {
  passed: number;
  failed: number;
  passRate: number;
}) {
  const total = passed + failed;
  const passedDeg = total > 0 ? (passed / total) * 360 : 0;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative size-40 shrink-0">
        <div
          className="size-40 rounded-full"
          style={{
            background:
              total === 0
                ? "var(--muted)"
                : `conic-gradient(var(--chart-2) 0deg ${passedDeg}deg, var(--destructive) ${passedDeg}deg 360deg)`
          }}
          role="img"
          aria-label={`Đạt ${passed}, không đạt ${failed}`}
        />
        <div className="absolute inset-8 flex flex-col items-center justify-center rounded-full bg-card text-center">
          <span className="text-2xl font-semibold">{total === 0 ? "—" : formatPercent(passRate)}</span>
          <span className="text-xs text-muted-foreground">tỷ lệ đạt</span>
        </div>
      </div>
      <ul className="flex flex-col gap-2 text-sm">
        <li className="flex items-center gap-2">
          <span className="size-2.5 rounded-full" style={{ background: "var(--chart-2)" }} />
          Đạt: {passed.toLocaleString("vi-VN")}
        </li>
        <li className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-destructive" />
          Không đạt: {failed.toLocaleString("vi-VN")}
        </li>
        <li className="text-muted-foreground">Tổng nộp chính thức: {total.toLocaleString("vi-VN")}</li>
      </ul>
    </div>
  );
}

export function LegalEducationResultsCharts({ results }: { results: LegalExamResultsDto }) {
  const percents = results.individuals.map((row) => row.percent).filter((value): value is number => value !== null);
  const average = percents.length === 0 ? null : percents.reduce((sum, value) => sum + value, 0) / percents.length;
  const highest = percents.length === 0 ? null : Math.max(...percents);
  const lowest = percents.length === 0 ? null : Math.min(...percents);
  const medianScore = median(percents);
  const failedCount = Math.max(0, results.officialSubmittedCount - results.officialPassedCount);
  const passRate =
    results.officialSubmittedCount > 0 ? (results.officialPassedCount / results.officialSubmittedCount) * 100 : 0;
  const eligibleCount = results.units.reduce((sum, unit) => sum + unit.eligibleCount, 0);
  const submittedInUnits = results.units.reduce((sum, unit) => sum + unit.submittedCount, 0);
  const participationRate = eligibleCount > 0 ? (submittedInUnits / eligibleCount) * 100 : null;

  const buckets = SCORE_BUCKETS.map((bucket) => ({
    ...bucket,
    count: percents.filter((value) => value >= bucket.min && value < bucket.max).length
  }));
  const bucketMax = Math.max(1, ...buckets.map((bucket) => bucket.count));

  const officialRows = results.rows.filter((row) => !row.isPractice);
  const practiceRows = results.rows.filter((row) => row.isPractice);
  const statusCounts = [
    { label: "Đã nộp", value: results.rows.filter((row) => row.status === "SUBMITTED").length, colorClass: "bg-[var(--chart-2)]" },
    { label: "Hết giờ", value: results.rows.filter((row) => row.status === "EXPIRED").length, colorClass: "bg-destructive" },
    { label: "Đang làm", value: results.rows.filter((row) => row.status === "IN_PROGRESS").length, colorClass: "bg-[var(--chart-1)]" }
  ];
  const kindCounts = [
    { label: "Chính thức", value: officialRows.length, colorClass: "bg-[var(--chart-1)]" },
    { label: "Thi thử", value: practiceRows.length, colorClass: "bg-[var(--chart-4)]" }
  ];
  const kindMax = Math.max(1, ...kindCounts.map((item) => item.value), ...statusCounts.map((item) => item.value));

  const byDay = new Map<string, number>();
  for (const row of results.individuals) {
    if (!row.submittedAt) continue;
    const key = new Date(row.submittedAt).toLocaleDateString("vi-VN");
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }
  const timeline = [...byDay.entries()].sort((a, b) => {
    const [da, db] = [a[0], b[0]];
    const pa = da.split("/").reverse().join("-");
    const pb = db.split("/").reverse().join("-");
    return pa.localeCompare(pb);
  });
  const timelineMax = Math.max(1, ...timeline.map(([, count]) => count));

  const topUnits = results.units.slice(0, 12);
  const unitScoreMax = Math.max(1, ...topUnits.map((unit) => unit.unitScore));
  const topIndividuals = results.individuals.slice(0, 10);
  const leadingUnit = results.units[0];
  const leadingPerson = results.individuals[0];

  const kpis = [
    { label: "Nộp chính thức", value: results.officialSubmittedCount.toLocaleString("vi-VN"), hint: "Lượt tốt nhất mỗi người" },
    { label: "Đạt", value: results.officialPassedCount.toLocaleString("vi-VN"), hint: `Ngưỡng ${results.passingScorePercent}%` },
    { label: "Tỷ lệ đạt", value: results.officialSubmittedCount === 0 ? "—" : formatPercent(passRate), hint: `${failedCount} không đạt` },
    { label: "Điểm TB", value: average === null ? "—" : formatPercent(average), hint: medianScore === null ? undefined : `Trung vị ${formatPercent(medianScore)}` },
    { label: "Cao nhất / thấp nhất", value: highest === null || lowest === null ? "—" : `${formatPercent(highest)} / ${formatPercent(lowest)}`, hint: "Theo bài chính thức" },
    {
      label: "Tỷ lệ tham gia",
      value: participationRate === null ? "—" : formatPercent(participationRate),
      hint: eligibleCount > 0 ? `${submittedInUnits}/${eligibleCount} tài khoản` : "Chưa gắn bộ phận"
    }
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Báo cáo kết quả</h2>
        <p className="text-sm text-muted-foreground">
          {results.officialSubmittedCount === 0
            ? "Chưa có lượt thi chính thức để thống kê."
            : [
                `Đợt thi có ${results.officialSubmittedCount.toLocaleString("vi-VN")} đoàn viên nộp bài chính thức, trong đó ${results.officialPassedCount.toLocaleString("vi-VN")} đạt (${formatPercent(passRate)}).`,
                average === null ? null : `Điểm trung bình ${formatPercent(average)}.`,
                leadingPerson ? `Cá nhân dẫn đầu: ${leadingPerson.fullName} (${formatPercent(leadingPerson.percent ?? 0)}).` : null,
                leadingUnit
                  ? `Công đoàn bộ phận dẫn đầu: ${leadingUnit.departmentName} (điểm đơn vị ${leadingUnit.unitScore.toFixed(2)}).`
                  : null
              ]
                .filter(Boolean)
                .join(" ")}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{kpi.value}</p>
            {kpi.hint ? <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p> : null}
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tỷ lệ đạt / không đạt</CardTitle>
            <CardDescription>Chỉ tính lượt thi chính thức tốt nhất của mỗi đoàn viên.</CardDescription>
          </CardHeader>
          <CardContent>
            <Donut passed={results.officialPassedCount} failed={failedCount} passRate={passRate} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân bố điểm</CardTitle>
            <CardDescription>Số thí sinh theo khoảng điểm phần trăm.</CardDescription>
          </CardHeader>
          <CardContent>
            {percents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có điểm để vẽ phân bố.</p>
            ) : (
              <div className="flex h-44 items-end gap-2">
                {buckets.map((bucket) => (
                  <div key={bucket.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                    <span className="text-xs font-medium">{bucket.count}</span>
                    <div className="flex h-32 w-full items-end">
                      <div
                        className="mx-auto w-full max-w-10 rounded-t-md bg-[var(--chart-1)]"
                        style={{ height: `${(bucket.count / bucketMax) * 100}%` }}
                      />
                    </div>
                    <span className="text-center text-[10px] text-muted-foreground">{bucket.label}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cơ cấu lượt thi</CardTitle>
            <CardDescription>Gồm cả thi thử, đang làm và hết giờ.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {kindCounts.map((item) => (
                <BarRow
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  max={kindMax}
                  display={item.value.toLocaleString("vi-VN")}
                  colorClass={item.colorClass}
                />
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {statusCounts.map((item) => (
                <BarRow
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  max={kindMax}
                  display={item.value.toLocaleString("vi-VN")}
                  colorClass={item.colorClass}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tiến độ nộp bài theo ngày</CardTitle>
            <CardDescription>Số đoàn viên hoàn thành bài thi chính thức.</CardDescription>
          </CardHeader>
          <CardContent>
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có mốc nộp bài.</p>
            ) : (
              <div className="flex h-44 items-end gap-2 overflow-x-auto">
                {timeline.map(([day, count]) => (
                  <div key={day} className="flex min-w-10 flex-1 flex-col items-center gap-1">
                    <span className="text-xs font-medium">{count}</span>
                    <div className="flex h-32 w-full items-end">
                      <div
                        className="mx-auto w-full max-w-10 rounded-t-md bg-[var(--chart-3)]"
                        style={{ height: `${(count / timelineMax) * 100}%` }}
                      />
                    </div>
                    <span className="text-center text-[10px] leading-tight text-muted-foreground">{day}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Xếp hạng công đoàn bộ phận</CardTitle>
          <CardDescription>Điểm đơn vị = 50% điểm TB + 30% tỷ lệ tham gia + 20% tỷ lệ đạt.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {topUnits.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có công đoàn bộ phận nào có đoàn viên gắn tài khoản.</p>
          ) : (
            topUnits.map((unit) => (
              <BarRow
                key={unit.departmentId}
                label={`${unit.rank}. ${unit.departmentName}`}
                value={unit.unitScore}
                max={unitScoreMax}
                display={`${unit.unitScore.toFixed(2)} · tham gia ${formatPercent(unit.participationPercent)} · đạt ${formatPercent(unit.passPercent)}`}
                colorClass="bg-[var(--chart-1)]"
              />
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 cá nhân</CardTitle>
          <CardDescription>Theo điểm phần trăm bài thi chính thức tốt nhất.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {topIndividuals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có thí sinh chính thức.</p>
          ) : (
            topIndividuals.map((row) => (
              <BarRow
                key={row.attemptId}
                label={`${row.rank}. ${row.fullName}${row.departmentName ? ` — ${row.departmentName}` : ""}`}
                value={row.percent ?? 0}
                max={100}
                display={row.percent === null ? "—" : formatPercent(row.percent)}
                colorClass={row.passed ? "bg-[var(--chart-2)]" : "bg-destructive"}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
