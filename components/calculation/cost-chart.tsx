"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChargeBreakdownItem {
  tier: number;
  days: number;
  price_per_day: number;
  subtotal: number;
}

interface CostBreakdownChartProps {
  data: ChargeBreakdownItem[];
  /** ISO-4217 currency code (TRY, USD, EUR…). Defaults to TRY. */
  currency?: string;
}

export function CostBreakdownChart({ data, currency = "TRY" }: CostBreakdownChartProps) {
  // Transform data for Recharts: one bar representing the total breakdown
  const chartData = [
    {
      name: "Masraf Kırılımı",
      ...data.reduce((acc, item) => {
        acc[`Kademe ${item.tier}`] = item.subtotal;
        return acc;
      }, {} as Record<string, number>),
    },
  ];

  // Map tiers to colors: 1 -> Emerald, 2 -> Amber, 3 -> Rose
  const tierColors: Record<string, string> = {
    "Kademe 1": "#10b981", // Emerald 500
    "Kademe 2": "#f59e0b", // Amber 500
    "Kademe 3": "#f43f5e", // Rose 500
  };

  const formatTL = (value: number) => {
    try {
      return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    } catch {
      return `${value.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} ${currency}`;
    }
  };

  return (
    <div className="h-[180px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
          <XAxis
            type="number"
            tickFormatter={formatTL}
            fontSize={10}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            hide
          />
          <Tooltip
            formatter={(value: number) => [formatTL(value), "Tutar"]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontSize: "12px",
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
          {data.map((item, idx) => (
            <Bar
              key={`bar-tier-${item.tier}`}
              dataKey={`Kademe ${item.tier}`}
              stackId="a"
              fill={tierColors[`Kademe ${item.tier}`] || "#94a3b8"}
              radius={idx === 0 && data.length === 1 ? [4, 4, 4, 4] : idx === 0 ? [4, 0, 0, 4] : idx === data.length - 1 ? [0, 4, 4, 0] : 0}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
