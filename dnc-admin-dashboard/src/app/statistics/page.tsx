"use client";  // Đảm bảo đánh dấu file là client component

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
import api from "../../utils/api";  // Import api

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

const StatisticsPage = () => {
  const [bookingsData, setBookingsData] = useState([]);
  const [showtimesData, setShowtimesData] = useState([]);

  useEffect(() => {
    api.get("/bookings/admin/bookings")
      .then((response) => setBookingsData(response.data.bookings))
      .catch((error) => console.error("Error fetching bookings:", error));

    api.get("/showtimes")
      .then((response) => setShowtimesData(response.data))
      .catch((error) => console.error("Error fetching showtimes:", error));
  }, []);
  const paidBookings = bookingsData.filter((booking) => booking.status === "paid");


  // 1. Biểu đồ tăng trưởng số vé đã bán theo tháng
  const bookingsByMonth = {};
  paidBookings.forEach((booking) => {
    const month = booking.expiresAt?.slice(0, 7); // yyyy-mm
    if (!bookingsByMonth[month]) bookingsByMonth[month] = 0;
    bookingsByMonth[month] += 1;
  });
  const ticketsGrowthData = {
    labels: Object.keys(bookingsByMonth),
    datasets: [
      {
        label: "Vé đã bán",
        data: Object.values(bookingsByMonth),
        borderColor: "rgba(75,192,192,1)",
        fill: false,
        tension: 0.4,
      },
    ],
  };


 // 2. Biểu đồ tỷ lệ ghế được đặt theo tháng
const seatRateByMonth = {};

showtimesData.forEach((showtime) => {
  const month = showtime.dateTime?.slice(0, 7); // yyyy-mm, nếu bạn lưu ngày chiếu trong showtime.date
  if (!seatRateByMonth[month]) {
    seatRateByMonth[month] = { booked: 0, total: 0 };
  }
  showtime.seats.forEach((seat) => {
    seatRateByMonth[month].total += 1;
    if (seat.isBooked) seatRateByMonth[month].booked += 1;
  });
});

const sortedMonths = Object.keys(seatRateByMonth).sort(); // đảm bảo đúng thứ tự thời gian
const seatRateLineData = {
  labels: sortedMonths,
  datasets: [
    {
      label: "Tỷ lệ ghế được đặt (%)",
      data: sortedMonths.map((month) => {
        const { booked, total } = seatRateByMonth[month];
        return total === 0 ? 0 : Number(((booked / total) * 100).toFixed(2));
      }),
      borderColor: "#FF6384",
      backgroundColor: "rgba(255,99,132,0.2)",
      tension: 0.4,
      fill: false,
    },
  ],
};

const seatRateLineOptions = {
  responsive: true,
  scales: {
    y: {
      min: 0,
      max: 100,
      ticks: {
        callback: function (value) {
          return value + "%";
        },
      },
      title: {
        display: true,
        text: "Tỷ lệ (%)",
      },
    },
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: function (context) {
          return context.parsed.y + "%";
        },
      },
    },
  },
};



  /// 3. Biểu đồ số suất chiếu theo từng phim
const showtimesCount = {};
showtimesData.forEach((showtime) => {
  const title = showtime.movie.title;
  if (!showtimesCount[title]) showtimesCount[title] = 0;
  showtimesCount[title] += 1;
});

// Sinh màu ngẫu nhiên cho từng phim
const movieTitles = Object.keys(showtimesCount);
const backgroundColors = movieTitles.map(() => getRandomColor(0.6));
const borderColors = backgroundColors.map((color) => color.replace('0.6', '1'));

const showtimeBarData = {
  labels: movieTitles,
  datasets: [
    {
      label: "Số suất chiếu",
      data: Object.values(showtimesCount),
      backgroundColor: backgroundColors,
      borderColor: borderColors,
      borderWidth: 1,
    },
  ],
};

const showtimeBarOptions = {
  plugins: {
    legend: {
      display: true, // Hiển thị chú thích
      position: "bottom", // Có thể là 'top', 'bottom', 'left', 'right'
      labels: {
        generateLabels: function (chart) {
          return movieTitles.map((title, index) => ({
            text: title,
            fillStyle: backgroundColors[index],
            strokeStyle: borderColors[index],
            lineWidth: 1,
            index: index,
          }));
        },
      },
    },
  },
};

// Hàm sinh màu ngẫu nhiên
function getRandomColor(opacity = 1) {
  const r = Math.floor(Math.random() * 200);
  const g = Math.floor(Math.random() * 200);
  const b = Math.floor(Math.random() * 200);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}


//4. Biểu đồ tỷ lệ vé đặt theo phim
const ticketsByMovie = {}; 

paidBookings.forEach((booking) => {
  const movieName = booking.showtime.movie.title; // Giả sử bạn có movie.title trong showtime

  if (!ticketsByMovie[movieName]) ticketsByMovie[movieName] = 0;

  const bookedSeats = booking.seats.length;
  ticketsByMovie[movieName] += bookedSeats;
});

const pieChartOptions = {
  plugins: {
    tooltip: {
      callbacks: {
        label: function (context) {
          const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
          const value = context.raw;
          const percentage = ((value / total) * 100).toFixed(1);
          return `${context.label}: ${value} vé (${percentage}%)`;
        },
      },
    },
    legend: {
      position: 'right',
    },
  },
};


/// Chuẩn bị dữ liệu cho biểu đồ tròn
const pieLabels = Object.keys(ticketsByMovie);
const pieDataValues = Object.values(ticketsByMovie);
const pieColors = pieLabels.map(() => getRandomColor(0.6)); // sinh màu động

const pieChartData = {
  labels: pieLabels,
  datasets: [
    {
      label: "Tỷ lệ đặt vé",
      data: pieDataValues,
      backgroundColor: pieColors,
      hoverOffset: 10,
    },
  ],
};

//5. Biểu đồ doanh thu theo tháng
const revenueByMonth = {}; 

paidBookings.forEach((booking) => {
  const month = booking.expiresAt?.slice(0, 7); 
  if (!month) return; // Nếu không có tháng thì bỏ qua

  

  
  if (!revenueByMonth[month]) revenueByMonth[month] = 0;

  // Lấy số ghế đã đặt
  const seatCount = booking.seats.length; // tính ghế đã đặt
  

  const ticketPrice = booking.showtime.ticketPrice; 
  if (!ticketPrice) console.log('Ticket price is missing!'); // Kiểm tra giá vé

  // Tính doanh thu cho tháng này
  revenueByMonth[month] += seatCount * ticketPrice;
});





const revenueBarData = {
  labels: sortedMonths,
  datasets: [
    {
      label: "Doanh thu (VNĐ)",
      data: sortedMonths.map((month) => revenueByMonth[month]),
      backgroundColor: "rgba(76, 175, 80, 0.6)", 
      borderColor: "#4caf50", 
      borderWidth: 1,
    },
  ],
};


  return (
  <div style={{ padding: 24, fontFamily: "sans-serif", background: "#fff", minHeight: "100vh", }}>
    <h1 style={{ marginBottom: 32, fontSize: 28, fontWeight: 600 }}>Thống kê</h1>

    {/* Dòng 1: Biểu đồ vé và doanh thu - lớn nhất */}
    <div style={{ display: "flex", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
      <div style={{
        flex: 1,
        minWidth: 300,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        padding: 20
      }}>
        <h3 style={{ marginBottom: 12 }}>Tăng trưởng vé bán theo tháng</h3>
        <Line data={ticketsGrowthData} />
      </div>

      <div style={{
        flex: 1,
        minWidth: 300,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        padding: 20
      }}>
        <h3 style={{ marginBottom: 12 }}>Doanh thu theo tháng</h3>
        <Bar
          data={revenueBarData}
          options={{
            responsive: true,
            scales: { y: { beginAtZero: true } },
          }}
        />
      </div>
    </div>

    {/* Dòng 2: 3 biểu đồ phụ */}
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: 24
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        padding: 20
        
      }}>
        <h3 style={{ marginBottom: 12 }}>Tỷ lệ ghế được đặt</h3>
        <Line data={seatRateLineData} options={seatRateLineOptions} />
      </div>

      <div style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        padding: 20
      }}>
        <h3 style={{ marginBottom: 12 }}>Suất chiếu theo phim</h3>
        <Bar data={showtimeBarData} options={showtimeBarOptions} />
      </div>

      <div style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        padding: 20
      }}>
        <h3 style={{ marginBottom: 12 }}>Tỷ lệ vé bán theo phim</h3>
        <Pie data={pieChartData} options={pieChartOptions} />
      </div>
    </div>
  </div>
);

};

export default StatisticsPage;
