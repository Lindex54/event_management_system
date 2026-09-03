"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { useTheme } from "next-themes";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function ChartCard({ title, description, type, categories, series, height = 280, horizontal = false }: {
  title: string;
  description: string;
  type: "area" | "line" | "bar" | "donut";
  categories?: string[];
  series: { name: string; data: number[] }[] | number[];
  height?: number;
  horizontal?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const isDonut = type === "donut";
  const options: ApexOptions = {
    chart: { toolbar: { show: false }, zoom: { enabled: false }, fontFamily: "var(--font-plus-jakarta-sans)" },
    colors: isDonut ? ["#2563EB", "#F59E0B", "#64748B", "#DC2626"] : ["#2563EB", "#F59E0B"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: type === "bar" ? 0 : 3 },
    fill: type === "area" ? { type: "gradient", gradient: { opacityFrom: 0.3, opacityTo: 0.03 } } : undefined,
    grid: { borderColor: dark ? "#293548" : "#E2E8F0", strokeDashArray: 4 },
    xaxis: { categories, labels: { style: { colors: dark ? "#94A3B8" : "#64748B" } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: dark ? "#94A3B8" : "#64748B" } } },
    plotOptions: { bar: { borderRadius: 4, horizontal, columnWidth: "52%" }, pie: { donut: { size: "70%" } } },
    labels: isDonut ? categories : undefined,
    legend: { position: "bottom", labels: { colors: dark ? "#CBD5E1" : "#475569" } },
    tooltip: { theme: dark ? "dark" : "light" },
  };
  return <Card className="min-w-0 shadow-none"><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent className="min-w-0"><Chart options={options} series={series} type={type} height={height} width="100%" /></CardContent></Card>;
}
