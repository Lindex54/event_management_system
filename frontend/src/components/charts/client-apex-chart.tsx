"use client";

import * as React from "react";
import type { ApexOptions } from "apexcharts";

type ChartType = "area" | "bar" | "donut" | "line";

export function ClientApexChart({
  options,
  series,
  type,
  height,
  width = "100%",
}: {
  options: ApexOptions;
  series: NonNullable<ApexOptions["series"]>;
  type: ChartType;
  height: number;
  width?: string | number;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let cancelled = false;
    let destroyed = false;
    let chart: { render: () => Promise<unknown>; destroy: () => void } | undefined;
    let renderPromise: Promise<unknown> | undefined;

    const destroy = () => {
      if (destroyed || !chart) return;
      destroyed = true;
      chart.destroy();
    };

    void import("apexcharts/client").then(({ default: ApexCharts }) => {
      if (cancelled || !containerRef.current) return;

      chart = new ApexCharts(containerRef.current, {
        ...options,
        chart: { ...options.chart, type, height, width },
        series,
      });
      renderPromise = chart.render();
      return renderPromise.catch((error: unknown) => {
        if (!cancelled) console.error("Unable to render chart", error);
      }).finally(() => {
        if (cancelled) destroy();
      });
    }).catch((error: unknown) => {
      if (!cancelled) console.error("Unable to load chart library", error);
    });

    return () => {
      cancelled = true;
      if (renderPromise) void renderPromise.finally(destroy);
    };
  }, [height, options, series, type, width]);

  return <div ref={containerRef} className="min-w-0" />;
}
