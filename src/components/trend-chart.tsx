"use client";

import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

type TrendSeries = {
  label: string;
  color: string;
  data: Array<{ date: string; value: number }>;
};

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export function TrendChart({ series }: { series: TrendSeries[] }) {
  const { labels, datasets } = useMemo(() => {
    const labelSet = new Set<string>();
    series.forEach((s) => s.data.forEach((point) => labelSet.add(point.date)));
    const sortedLabels = Array.from(labelSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const mappedDatasets = series.map((s) => {
      const values = sortedLabels.map((label) => {
        const point = s.data.find((d) => d.date === label);
        return point ? Number(point.value.toFixed(1)) : null;
      });

      return {
        label: s.label,
        data: values,
        borderColor: s.color,
        backgroundColor: `${s.color}22`,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: true,
      };
    });

    return { labels: sortedLabels, datasets: mappedDatasets };
  }, [series]);

  return (
    <Line
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top" as const,
            labels: {
              color: "#594f49",
              boxWidth: 12,
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: "rgba(33, 27, 24, 0.9)",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderColor: "rgba(255, 255, 255, 0.2)",
            borderWidth: 1,
            displayColors: false,
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.formattedValue} kg`,
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#8d847f",
              maxRotation: 0,
            },
          },
          y: {
            grid: {
              color: "rgba(90, 80, 74, 0.08)",
            },
            ticks: {
              color: "#8d847f",
              callback: (value) => `${value} kg`,
            },
          },
        },
      }}
      data={{ labels, datasets }}
    />
  );
}
