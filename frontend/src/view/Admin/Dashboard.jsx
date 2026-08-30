import { useEffect } from "react";
import AdminSidebar from "../Components/AdminSidebar";
import "../../Style/AdminCSS/Dashboard.css";

import {
  FaUserMd,
  FaUsers,
  FaHospital,
  FaCalendarCheck,
  FaClock,
  FaMoneyBillWave,
} from "react-icons/fa";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function Dashboard() {
  useEffect(() => {
    document.title = "MediGo | Admin Dashboard";
  }, []);

  const dashboardCards = [
    {
      title: "Total Doctors",
      count: 30,
      icon: <FaUserMd />,
      color: "blue",
    },
    {
      title: "Total Patients",
      count: 120,
      icon: <FaUsers />,
      color: "green",
    },
    {
      title: "Total Departments",
      count: 12,
      icon: <FaHospital />,
      color: "pink",
    },
    {
      title: "Total Appointments",
      count: 45,
      icon: <FaCalendarCheck />,
      color: "yellow",
    },
    {
      title: "Pending Doctor Requests",
      count: 8,
      icon: <FaClock />,
      color: "purple",
    },
    {
      title: "Total Revenue",
      count: "৳ 25,500",
      icon: <FaMoneyBillWave />,
      color: "blue",
    },
  ];

  const monthlyUsers = [
    { month: "Jan", users: 62 },
    { month: "Feb", users: 75 },
    { month: "Mar", users: 61 },
    { month: "Apr", users: 85 },
    { month: "May", users: 70 },
    { month: "Jun", users: 78 },
    { month: "Jul", users: 58 },
    { month: "Aug", users: 70 },
    { month: "Sep", users: 42 },
    { month: "Oct", users: 35 },
    { month: "Nov", users: 45 },
    { month: "Dec", users: 55 },
  ];

  const monthlyEarning = [
    { name: "First 15 Days", value: 40.56 },
    { name: "Last 15 Days", value: 30.56 },
    { name: "Remaining", value: 28.88 },
  ];

  const pieColors = ["#60a5fa", "#fbbf24", "#ec4899"];

  return (
    <div className="admin-dashboard-layout">
      <AdminSidebar />

      <main className="admin-dashboard-main">
        <div className="dashboard-heading">
          <h1>Dashboard</h1>
          <p>Dashboard</p>
        </div>

        <div className="dashboard-card-grid">
          {dashboardCards.map((card, index) => (
            <div className="dashboard-card" key={index}>
              <div>
                <h3>{card.title}</h3>
                <h2>{card.count}</h2>
              </div>

              <div className={`dashboard-icon ${card.color}`}>
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-chart-grid">
          <div className="monthly-users-card">
            <h2>Monthly Registered Users</h2>

            <div className="real-chart-box">
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={monthlyUsers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="users"
                    fill="#ec4899"
                    radius={[8, 8, 0, 0]}
                    barSize={34}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="earning-card">
            <div className="earning-card-top">
              <h2>Monthly Earning</h2>

              <div className="earning-tabs">
                <button className="active">Monthly</button>
              </div>
            </div>

            <div className="earning-info">
              <p>This Month</p>
              <h3>৳ 25,500</h3>
              
            </div>

            <div className="real-pie-box">
              <ResponsiveContainer width="100%" height={270}>
                <PieChart>
                  <Pie
                    data={monthlyEarning}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={55}
                    label
                  >
                    {monthlyEarning.map((entry, index) => (
                      <Cell key={index} fill={pieColors[index]} />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;