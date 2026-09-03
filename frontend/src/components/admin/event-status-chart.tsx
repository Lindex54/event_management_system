"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { useTheme } from "next-themes";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { eventStatusData } from "@/data/admin-dashboard";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function EventStatusChart() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const options: ApexOptions = {
    chart: { fontFamily: "var(--font-plus-jakarta-sans)" },
    labels: eventStatusData.map((item) => item.label),
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
              formatter: () => "148",
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
        <Chart options={options} series={eventStatusData.map((item) => item.value)} type="donut" height={290} width="100%" />
      </CardContent>
    </Card>
  );
}
