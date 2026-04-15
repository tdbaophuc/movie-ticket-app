"use client";

import React, { useEffect, useState } from "react";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from "chart.js";
import api from "../../utils/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Deterministic color palette — no Math.random(), no module-level calls
const PALETTE = [
  'rgba(59, 130, 246, 0.6)',  'rgba(16, 185, 129, 0.6)',  'rgba(245, 158, 11, 0.6)',
  'rgba(239, 68, 68, 0.6)',  'rgba(139, 92, 246, 0.6)',  'rgba(236, 72, 153, 0.6)',
  'rgba(6, 182, 212, 0.6)',  'rgba(34, 197, 94, 0.6)',   'rgba(168, 85, 247, 0.6)',
  'rgba(20, 184, 166, 0.6)',
];
function getPaletteColor(index: number, opacity = 0.6) {
  return PALETTE[index % PALETTE.length].replace('0.6', String(opacity));
}

export default function StatisticsPage() {
  const [bookingsData, setBookingsData] = useState<any[]>([]);
  const [showtimesData, setShowtimesData] = useState<any[]>([]);

  useEffect(() => {
    api.get("/bookings/admin/bookings")
      .then((response) => setBookingsData(response.data.bookings ?? []))
      .catch((error) => console.error("Error fetching bookings:", error));

    api.get("/showtimes")
      .then((response) => setShowtimesData(response.data ?? []))
      .catch((error) => console.error("Error fetching showtimes:", error));
  }, []);

  const paidBookings = bookingsData.filter((b) => b.status === "paid");

  // Stable color arrays derived from actual data
  const paidMovieTitles = [...new Set(paidBookings.map((b) => b.showtime?.movie?.title).filter(Boolean))];
  const showtimeMovieTitles = [...new Set(showtimesData.map((s) => s.movie?.title).filter(Boolean))];
  const paidBgColors    = paidMovieTitles.map((_, i) => getPaletteColor(i, 0.6));
  const paidBorderColors = paidMovieTitles.map((_, i) => getPaletteColor(i, 1));
  const showtimeBgColors = showtimeMovieTitles.map((_, i) => getPaletteColor(i + 5, 0.6));
  const showtimeBorderColors = showtimeMovieTitles.map((_, i) => getPaletteColor(i + 5, 1));

  // ── 1. Tăng trưởng vé bán theo tháng ───────────────────────────────────
  const bookingsByMonth: Record<string, number> = {};
  paidBookings.forEach((booking) => {
    const month = booking.expiresAt?.slice(0, 7);
    if (!month) return;
    bookingsByMonth[month] = (bookingsByMonth[month] ?? 0) + 1;
  });
  const ticketsGrowthData = {
    labels: Object.keys(bookingsByMonth).sort(),
    datasets: [{
      label: "Vé đã bán",
      data: Object.keys(bookingsByMonth).sort().map((m) => bookingsByMonth[m]),
      borderColor: "rgba(75,192,192,1)",
      fill: false,
      tension: 0.4,
    }],
  };

  // ── 2. Tỷ lệ ghế được đặt theo tháng ───────────────────────────────────
  const seatRateByMonth: Record<string, { booked: number; total: number }> = {};
  showtimesData.forEach((showtime) => {
    const month = showtime.dateTime?.slice(0, 7);
    if (!month) return;
    if (!seatRateByMonth[month]) seatRateByMonth[month] = { booked: 0, total: 0 };
    showtime.seats?.forEach((seat: any) => {
      seatRateByMonth[month].total += 1;
      if (seat.isBooked) seatRateByMonth[month].booked += 1;
    });
  });
  const sortedMonths = Object.keys(seatRateByMonth).sort();
  const seatRateLineData = {
    labels: sortedMonths,
    datasets: [{
      label: "Tỷ lệ ghế được đặt (%)",
      data: sortedMonths.map((m) => {
        const { booked, total } = seatRateByMonth[m];
        return total === 0 ? 0 : Number(((booked / total) * 100).toFixed(2));
      }),
      borderColor: "#FF6384",
      backgroundColor: "rgba(255,99,132,0.2)",
      tension: 0.4,
      fill: false,
    }],
  };
  const seatRateLineOptions = {
    responsive: true,
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { callback: (v: any) => `${v}%` },
        title: { display: true, text: "Tỷ lệ (%)" },
      },
    },
    plugins: {
      tooltip: { callbacks: { label: (ctx: any) => `${ctx.parsed.y}%` } },
    },
  };

  // ── 3. Số suất chiếu theo phim ───────────────────────────────────────────
  const showtimesCount: Record<string, number> = {};
  showtimesData.forEach((showtime) => {
    const title = showtime.movie?.title;
    if (!title) return;
    showtimesCount[title] = (showtimesCount[title] ?? 0) + 1;
  });
  const movieTitles = Object.keys(showtimesCount);
  const showtimeBarData = {
    labels: movieTitles,
    datasets: [{
      label: "Số suất chiếu",
      data: movieTitles.map((t) => showtimesCount[t]),
      backgroundColor: showtimeBgColors,
      borderColor: showtimeBorderColors,
      borderWidth: 1,
    }],
  };

  // ── 4. Tỷ lệ vé đặt theo phim (pie) ─────────────────────────────────────
  const ticketsByMovie: Record<string, number> = {};
  paidBookings.forEach((booking) => {
    const title = booking.showtime?.movie?.title;
    if (!title) return;
    ticketsByMovie[title] = (ticketsByMovie[title] ?? 0) + booking.seats?.length;
  });
  const pieLabels = Object.keys(ticketsByMovie);
  const pieChartData = {
    labels: pieLabels,
    datasets: [{
      label: "Tỷ lệ đặt vé",
      data: pieLabels.map((l) => ticketsByMovie[l]),
      backgroundColor: paidBgColors,
      borderColor: paidBorderColors,
      hoverOffset: 10,
    }],
  };
  const pieChartOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const total = ctx.dataset.data.reduce((s: number, v: number) => s + v, 0);
            return `${ctx.label}: ${ctx.raw} vé (${((ctx.raw / total) * 100).toFixed(1)}%)`;
          },
        },
      },
      legend: { position: 'right' as const },
    },
  };

  // ── 5. Doanh thu theo tháng ──────────────────────────────────────────────
  const revenueByMonth: Record<string, number> = {};
  paidBookings.forEach((booking) => {
    const month = booking.expiresAt?.slice(0, 7);
    if (!month) return;
    revenueByMonth[month] = (revenueByMonth[month] ?? 0)
      + (booking.seats?.length ?? 0) * (booking.showtime?.ticketPrice ?? 0);
  });
  const revenueBarData = {
    labels: sortedMonths,
    datasets: [{
      label: "Doanh thu (VNĐ)",
      data: sortedMonths.map((m) => revenueByMonth[m] ?? 0),
      backgroundColor: "rgba(76, 175, 80, 0.6)",
      borderColor: "#4caf50",
      borderWidth: 1,
    }],
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", background: "#fff", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: 32, fontSize: 28, fontWeight: 600 }}>Thống kê</h1>

      {/* Dòng 1: vé bán + doanh thu */}
      <div style={{ display: "flex", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 300, background: "#fff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Tăng trưởng vé bán theo tháng</h3>
          <Line data={ticketsGrowthData} />
        </div>
        <div style={{ flex: 1, minWidth: 300, background: "#fff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Doanh thu theo tháng</h3>
          <Bar data={revenueBarData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
        </div>
      </div>

      {/* Dòng 2: 3 biểu đồ phụ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Tỷ lệ lấp đầy ghế</h3>
          <Line data={seatRateLineData} options={seatRateLineOptions} />
        </div>
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Suất chiếu theo phim</h3>
          <Bar data={showtimeBarData} />
        </div>
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Tỷ lệ vé bán theo phim</h3>
          <Pie data={pieChartData} options={pieChartOptions} />
        </div>
      </div>
    </div>
  );
}
