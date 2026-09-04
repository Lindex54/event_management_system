"use client";

import type { ApexOptions } from "apexcharts";
import { useTheme } from "next-themes";

import { ClientApexChart } from "@/components/charts/client-apex-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function RegistrationOverviewChart({ trend }: { trend: { categories: string[]; values: number[] } }) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const options: ApexOptions = {
    chart: { toolbar: { show: false }, zoom: { enabled: false }, fontFamily: "var(--font-plus-jakarta-sans)" },
    colors: [dark ? "#60A5FA" : "#2563EB"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 0.15, opacityFrom: 0.28, opacityTo: 0.02, stops: [0, 90, 100] },
    },
    grid: { borderColor: dark ? "#293548" : "#E2E8F0", strokeDashArray: 4, padding: { left: 8, right: 8 } },
    xaxis: {
      categories: trend.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: dark ? "#94A3B8" : "#64748B" } },
    },
    yaxis: { labels: { style: { colors: dark ? "#94A3B8" : "#64748B" } } },
    tooltip: { theme: dark ? "dark" : "light" },
  };

  return (
    <Card className="min-w-0 shadow-none">
      <CardHeader>
        <CardTitle>Registration overview</CardTitle>
        <CardDescription>Registrations received over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <ClientApexChart options={options} series={[{ name: "Registrations", data: trend.values }]} type="area" height={290} />
      </CardContent>
    </Card>
  );
}
