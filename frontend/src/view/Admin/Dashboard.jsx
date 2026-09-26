import {
  useEffect,
  useState
} from "react";

import axios from "axios";

import AdminSidebar
  from "../Components/AdminSidebar";

import "../../Style/AdminCSS/Dashboard.css";


import {
  FaUserMd,
  FaUsers,
  FaHospital,
  FaCalendarCheck,
  FaClock,
  FaMoneyBillWave
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
  Legend
} from "recharts";


const API_URL =
  "http://localhost:5138";


function Dashboard() {

  // =====================================================
  // DASHBOARD DATA
  // =====================================================

  const [
    dashboardData,
    setDashboardData
  ] = useState(null);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    error,
    setError
  ] = useState("");



  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  useEffect(() => {

    document.title =
      "MediGo | Admin Dashboard";


    loadDashboard();

  }, []);



  async function loadDashboard() {

    setLoading(
      true
    );


    setError(
      ""
    );


    try {

      const response =
        await axios.get(

          `${API_URL}/api/admin/dashboard`

        );


      console.log(
        "Admin Dashboard:",
        response.data
      );


      setDashboardData(
        response.data
      );

    }

    catch (error) {

      console.log(
        "Dashboard Load Error:",
        error
      );


      console.log(
        "Backend:",
        error.response?.data
      );


      setDashboardData(
        null
      );


      setError(

        error.response?.data?.message

        ||

        "Could not load dashboard information."

      );

    }

    finally {

      setLoading(
        false
      );

    }

  }



  // =====================================================
  // MONEY FORMAT
  // =====================================================

  function formatMoney(
    amount
  ) {

    return (

      "৳ " +

      Number(
        amount
        ??
        0
      )
      .toLocaleString(
        "en-BD",
        {
          minimumFractionDigits:
            2,

          maximumFractionDigits:
            2
        }
      )

    );

  }



  // =====================================================
  // LOADING
  // =====================================================

  if (
    loading
  ) {

    return (

      <div className="admin-dashboard-layout">


        <AdminSidebar />


        <main className="admin-dashboard-main">


          <div className="dashboard-heading">


            <h1>
              Dashboard
            </h1>


            <p>
              Loading dashboard information...
            </p>


          </div>


        </main>


      </div>

    );

  }



  // =====================================================
  // ERROR
  // =====================================================

  if (
    error
    ||
    !dashboardData
  ) {

    return (

      <div className="admin-dashboard-layout">


        <AdminSidebar />


        <main className="admin-dashboard-main">


          <div className="dashboard-heading">


            <h1>
              Dashboard
            </h1>


            <p>
              {
                error
                ||
                "Dashboard information is unavailable."
              }
            </p>


            <button

              type="button"

              onClick={
                loadDashboard
              }

            >

              Try Again

            </button>


          </div>


        </main>


      </div>

    );

  }



  // =====================================================
  // BACKEND DATA
  // =====================================================

  const cards =
    dashboardData.cards
    ??
    {};


  const revenue =
    dashboardData.revenue
    ??
    {};


  const monthlyUsers =
    dashboardData.monthlyUsers
    ??
    [];


  const monthlyRevenue =
    dashboardData.monthlyRevenue
    ??
    [];



  // =====================================================
  // CARDS
  // =====================================================

  const dashboardCards = [

    {
      title:
        "Total Doctors",

      count:
        cards.totalDoctors
        ??
        0,

      icon:
        <FaUserMd />,

      color:
        "blue"
    },


    {
      title:
        "Total Patients",

      count:
        cards.totalPatients
        ??
        0,

      icon:
        <FaUsers />,

      color:
        "green"
    },


    {
      title:
        "Total Departments",

      count:
        cards.totalDepartments
        ??
        0,

      icon:
        <FaHospital />,

      color:
        "pink"
    },


    {
      title:
        "Total Appointments",

      count:
        cards.totalAppointments
        ??
        0,

      icon:
        <FaCalendarCheck />,

      color:
        "yellow"
    },


    {
      title:
        "Pending Doctor Requests",

      count:
        cards.pendingDoctorRequests
        ??
        0,

      icon:
        <FaClock />,

      color:
        "purple"
    },


    {
      title:
        "Total Revenue",

      count:
        formatMoney(
          cards.totalRevenue
        ),

      icon:
        <FaMoneyBillWave />,

      color:
        "blue"
    }

  ];



  // =====================================================
  // MONTHLY EARNING PIE
  //
  // Shows where this month's money came from.
  // =====================================================

  const monthlyEarning = [

    {
      name:
        "Medicine Sales",

      value:
        Number(
          revenue.thisMonthMedicineRevenue
          ??
          0
        )
    },


    {
      name:
        "Appointment Booking",

      value:
        Number(
          revenue.thisMonthAppointmentRevenue
          ??
          0
        )
    }

  ];



  const pieColors = [
    "#60a5fa",
    "#ec4899"
  ];



  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="admin-dashboard-layout">


      <AdminSidebar />


      <main className="admin-dashboard-main">


        {/* =================================================
            HEADING
        ================================================= */}

        <div className="dashboard-heading">


          <h1>
            Dashboard
          </h1>


          <p>

            MediGo system overview for{" "}

            {
              dashboardData.currentYear
            }

          </p>


        </div>



        {/* =================================================
            CARDS
        ================================================= */}

        <div className="dashboard-card-grid">


          {
            dashboardCards.map(
              (
                card,
                index
              ) => (

                <div

                  className="dashboard-card"

                  key={
                    index
                  }

                >


                  <div>


                    <h3>

                      {
                        card.title
                      }

                    </h3>


                    <h2>

                      {
                        card.count
                      }

                    </h2>


                  </div>



                  <div

                    className={
                      `dashboard-icon ${card.color}`
                    }

                  >

                    {
                      card.icon
                    }

                  </div>


                </div>

              )
            )
          }


        </div>



        {/* =================================================
            CHARTS
        ================================================= */}

        <div className="dashboard-chart-grid">


          {/* =================================================
              MONTHLY REGISTERED USERS
          ================================================= */}

          <div className="monthly-users-card">


            <h2>

              Monthly Registered Users

            </h2>


            <div className="real-chart-box">


              <ResponsiveContainer

                width="100%"

                height={340}

              >


                <BarChart

                  data={
                    monthlyUsers
                  }

                >


                  <CartesianGrid

                    strokeDasharray="3 3"

                  />


                  <XAxis

                    dataKey="month"

                  />


                  <YAxis

                    allowDecimals={
                      false
                    }

                  />


                  <Tooltip />


                  <Legend />


                  <Bar

                    dataKey="patients"

                    name="Patients"

                    fill="#ec4899"

                    radius={[
                      8,
                      8,
                      0,
                      0
                    ]}

                    barSize={22}

                  />


                  <Bar

                    dataKey="doctors"

                    name="Doctors"

                    fill="#60a5fa"

                    radius={[
                      8,
                      8,
                      0,
                      0
                    ]}

                    barSize={22}

                  />


                </BarChart>


              </ResponsiveContainer>


            </div>


          </div>



          {/* =================================================
              MONTHLY EARNING
          ================================================= */}

          <div className="earning-card">


            <div className="earning-card-top">


              <h2>
                Monthly Earning
              </h2>


              <div className="earning-tabs">


                <button className="active">

                  Monthly

                </button>


              </div>


            </div>



            <div className="earning-info">


              <p>
                This Month
              </p>


              <h3>

                {
                  formatMoney(
                    revenue.thisMonthRevenue
                  )
                }

              </h3>


              <div
                style={{
                  marginTop:
                    "8px",

                  fontSize:
                    "12px",

                  color:
                    "#6b7280"
                }}
              >

                Medicine:{" "}

                <strong>

                  {
                    formatMoney(
                      revenue.thisMonthMedicineRevenue
                    )
                  }

                </strong>


                {" • "}


                Appointment:{" "}

                <strong>

                  {
                    formatMoney(
                      revenue.thisMonthAppointmentRevenue
                    )
                  }

                </strong>


              </div>


            </div>



            <div className="real-pie-box">


              {
                Number(
                  revenue.thisMonthRevenue
                  ??
                  0
                ) >
                0

                  ? (

                    <ResponsiveContainer

                      width="100%"

                      height={270}

                    >


                      <PieChart>


                        <Pie

                          data={
                            monthlyEarning
                          }

                          dataKey="value"

                          nameKey="name"

                          cx="50%"

                          cy="50%"

                          outerRadius={90}

                          innerRadius={55}

                        >


                          {
                            monthlyEarning.map(
                              (
                                entry,
                                index
                              ) => (

                                <Cell

                                  key={
                                    entry.name
                                  }

                                  fill={
                                    pieColors[
                                      index
                                    ]
                                  }

                                />

                              )
                            )
                          }


                        </Pie>


                        <Tooltip

                          formatter={
                            value =>

                              formatMoney(
                                value
                              )
                          }

                        />


                        <Legend />


                      </PieChart>


                    </ResponsiveContainer>

                  )

                  : (

                    <div

                      style={{
                        height:
                          "270px",

                        display:
                          "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "center",

                        color:
                          "#6b7280"
                      }}

                    >

                      No income received this month.

                    </div>

                  )
              }


            </div>


          </div>


        </div>



        {/* =================================================
            OPTIONAL MONTH-BY-MONTH REVENUE
        ================================================= */}

        <div

          className="monthly-users-card"

          style={{
            marginTop:
              "24px"
          }}

        >


          <h2>

            Monthly Revenue

          </h2>


          <div className="real-chart-box">


            <ResponsiveContainer

              width="100%"

              height={340}

            >


              <BarChart

                data={
                  monthlyRevenue
                }

              >


                <CartesianGrid

                  strokeDasharray="3 3"

                />


                <XAxis

                  dataKey="month"

                />


                <YAxis />


                <Tooltip

                  formatter={
                    value =>
                      formatMoney(
                        value
                      )
                  }

                />


                <Legend />


                <Bar

                  dataKey="medicineRevenue"

                  name="Medicine"

                  fill="#8b5cf6"

                  radius={[
                    8,
                    8,
                    0,
                    0
                  ]}

                  barSize={22}

                />


                <Bar

                  dataKey="appointmentRevenue"

                  name="Appointment"

                  fill="#ec4899"

                  radius={[
                    8,
                    8,
                    0,
                    0
                  ]}

                  barSize={22}

                />


              </BarChart>


            </ResponsiveContainer>


          </div>


        </div>


      </main>


    </div>

  );

}


export default Dashboard;