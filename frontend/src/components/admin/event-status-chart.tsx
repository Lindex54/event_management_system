"use client";

import type { ApexOptions } from "apexcharts";
import { useTheme } from "next-themes";

import { ClientApexChart } from "@/components/charts/client-apex-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function EventStatusChart({ distribution, total }: { distribution: { label: string; value: number }[]; total: number }) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const options: ApexOptions = {
    chart: { fontFamily: "var(--font-plus-jakarta-sans)" },
    labels: distribution.map((item) => item.label),
    colors: ["#2563EB", "#16A34A", "#64748B", "#DC2626"],
    dataLabels: { enabled: false },
    legend: {
      position: "bottom",
      fontSize: "12px",
      labels: { colors: dark ? "#CBD5E1" : "#475569" },
      markers: { size: 5 },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "All events",
              color: dark ? "#94A3B8" : "#64748B",
              formatter: () => total.toLocaleString(),
            },
            value: {
              color: dark ? "#F8FAFC" : "#111827",
              fontWeight: 700,
            },
          },
        },
      },
    },
    stroke: { width: 3, colors: [dark ? "#111827" : "#FFFFFF"] },
    tooltip: { theme: dark ? "dark" : "light" },
  };

  return (
    <Card className="min-w-0 shadow-none">
      <CardHeader>
        <CardTitle>Event status</CardTitle>
        <CardDescription>Current event distribution</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <ClientApexChart options={options} series={distribution.map((item) => item.value)} type="donut" height={290} />
      </CardContent>
    </Card>
  );
}
