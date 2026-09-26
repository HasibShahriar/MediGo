import "../../Style/DoctorCSS/DoctorDashboard.css";

import DoctorSidebar
  from "../Components/DoctorSidebar";

import DoctorTopbar
  from "../Components/DoctorTopbar";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import axios from "axios";

import {
  FaCalendarCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaClock
} from "react-icons/fa";


const API_URL =
  "http://localhost:5138";


function DoctorDashboard() {

  const navigate =
    useNavigate();


  // =====================================================
  // DOCTOR
  // =====================================================

  const [
    doctor,
    setDoctor
  ] = useState(null);


  // =====================================================
  // APPOINTMENTS
  // =====================================================

  const [
    appointmentList,
    setAppointmentList
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  // =====================================================
  // SEARCH
  // =====================================================

  const [
    searchText,
    setSearchText
  ] = useState("");


  // =====================================================
  // STATUS FILTER
  // =====================================================

  const [
    statusFilter,
    setStatusFilter
  ] = useState("all");


  // =====================================================
  // PAGINATION
  // =====================================================

  const [
    currentPage,
    setCurrentPage
  ] = useState(1);


  const patientsPerPage =
    10;



  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    document.title =
      "MediGo | Doctor Dashboard";


    const storedDoctor =
      localStorage.getItem(
        "doctor"
      );


    if (!storedDoctor) {

      navigate(
        "/doctor-login",
        {
          replace: true
        }
      );

      return;
    }


    try {

      const parsedDoctor =
        JSON.parse(
          storedDoctor
        );


      if (!parsedDoctor?.id) {

        localStorage.removeItem(
          "doctor"
        );


        navigate(
          "/doctor-login",
          {
            replace: true
          }
        );


        return;
      }


      setDoctor(
        parsedDoctor
      );


      loadAppointments(
        parsedDoctor.id
      );

    }

    catch (error) {

      console.log(
        "Doctor Storage Error:",
        error
      );


      navigate(
        "/doctor-login",
        {
          replace: true
        }
      );

    }

  }, [
    navigate
  ]);



  // =====================================================
  // REFRESH WHEN APPOINTMENT CHANGES
  // =====================================================

  useEffect(() => {

    function handleUpdated() {

      if (doctor?.id) {

        loadAppointments(
          doctor.id
        );

      }

    }


    window.addEventListener(
      "doctorAppointmentUpdated",
      handleUpdated
    );


    return () => {

      window.removeEventListener(
        "doctorAppointmentUpdated",
        handleUpdated
      );

    };

  }, [
    doctor?.id
  ]);



  // =====================================================
  // LOAD APPOINTMENTS
  // =====================================================

  async function loadAppointments(
    doctorId
  ) {

    setLoading(
      true
    );


    try {

      const response =
        await axios.get(

          `${API_URL}/api/appointments/doctor/${doctorId}`

        );


      console.log(
        "Doctor Dashboard Appointments:",
        response.data
      );


      setAppointmentList(

        Array.isArray(
          response.data
        )
          ? response.data
          : []

      );

    }

    catch (error) {

      console.log(
        "Dashboard Appointment Error:",
        error
      );


      setAppointmentList([]);

    }

    finally {

      setLoading(
        false
      );

    }

  }



  // =====================================================
  // COUNTS
  // =====================================================

  const acceptedAppointments =
    useMemo(
      () => {

        return appointmentList.filter(
          appointment =>

            (
              appointment.requestStatus
              ||
              ""
            )
            .toLowerCase()
            ===
            "approved"

        );

      },
      [
        appointmentList
      ]
    );


  const rejectedAppointments =
    useMemo(
      () => {

        return appointmentList.filter(
          appointment =>

            (
              appointment.requestStatus
              ||
              ""
            )
            .toLowerCase()
            ===
            "rejected"

        );

      },
      [
        appointmentList
      ]
    );


  const totalAccepted =
    acceptedAppointments.length;


  const totalRejected =
    rejectedAppointments.length;


  const totalAppointments =
    appointmentList.length;



  // =====================================================
  // DASHBOARD PATIENT LIST
  //
  // ONLY APPROVED + REJECTED
  // =====================================================

  const decidedAppointments =
    useMemo(
      () => {

        return appointmentList.filter(
          appointment => {

            const status =
              (
                appointment.requestStatus
                ||
                ""
              )
              .toLowerCase();


            return (
              status === "approved"
              ||
              status === "rejected"
            );

          }
        );

      },
      [
        appointmentList
      ]
    );



  // =====================================================
  // SEARCH + STATUS FILTER
  // =====================================================

  const searchedPatients =
    useMemo(
      () => {

        const search =
          searchText
            .trim()
            .toLowerCase();


        return decidedAppointments.filter(
          appointment => {

            const status =
              (
                appointment.requestStatus
                ||
                ""
              )
              .toLowerCase();


            const matchesStatus =

              statusFilter ===
                "all"

              ||

              (
                statusFilter ===
                  "accepted"

                &&

                status ===
                  "approved"
              )

              ||

              (
                statusFilter ===
                  "rejected"

                &&

                status ===
                  "rejected"
              );


            const searchableText =
              [
                appointment.id,
                appointment.patientName,
                appointment.email,
                appointment.phone,
                appointment.serialNo,
                appointment.requestStatus
              ]

                .filter(
                  value =>
                    value !== null
                    &&
                    value !== undefined
                )

                .join(" ")

                .toLowerCase();


            const matchesSearch =

              !search

              ||

              searchableText.includes(
                search
              );


            return (

              matchesStatus
              &&
              matchesSearch

            );

          }
        );

      },
      [
        decidedAppointments,
        searchText,
        statusFilter
      ]
    );



  // =====================================================
  // RESET PAGE
  // =====================================================

  useEffect(() => {

    setCurrentPage(
      1
    );

  }, [
    searchText,
    statusFilter
  ]);



  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages =
    Math.ceil(

      searchedPatients.length
      /
      patientsPerPage

    );


  const lastIndex =
    currentPage
    *
    patientsPerPage;


  const firstIndex =
    lastIndex
    -
    patientsPerPage;


  const currentPatients =
    searchedPatients.slice(
      firstIndex,
      lastIndex
    );



  useEffect(() => {

    if (
      totalPages > 0
      &&
      currentPage > totalPages
    ) {

      setCurrentPage(
        totalPages
      );

    }

  }, [
    totalPages,
    currentPage
  ]);



  // =====================================================
  // DATE
  // =====================================================

  function formatDate(
    value
  ) {

    if (!value) {

      return "—";

    }


    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return value;

    }


    return date.toLocaleDateString(
      "en-GB",
      {
        day:
          "2-digit",

        month:
          "short",

        year:
          "numeric"
      }
    );

  }



  // =====================================================
  // TIME
  // =====================================================

  function formatTime(
    value
  ) {

    if (!value) {

      return "—";

    }


    const parts =
      value
        .toString()
        .split(":");


    if (
      parts.length < 2
    ) {

      return value;

    }


    let hour =
      Number(
        parts[0]
      );


    const minute =
      parts[1];


    const suffix =
      hour >= 12
        ? "PM"
        : "AM";


    hour =
      hour % 12;


    if (
      hour === 0
    ) {

      hour = 12;

    }


    return `${hour}:${minute} ${suffix}`;

  }



  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="doctor-dashboard-page">


      <DoctorSidebar />


      <div className="doctor-dashboard-main">


        <DoctorTopbar />


        <div className="doctor-dashboard-content">


          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="doctor-card-row">


            {/* ACCEPTED */}

            <div className="doctor-info-card card-green">


              <FaCheckCircle
                className="doctor-card-icon"
              />


              <div>


                <p>
                  Total Accepted
                </p>


                <h2>

                  {
                    totalAccepted
                  }

                </h2>




              </div>


            </div>



            {/* REJECTED */}

            <div className="doctor-info-card card-red">


              <FaTimesCircle
                className="doctor-card-icon"
              />


              <div>


                <p>
                  Total Rejected
                </p>


                <h2>

                  {
                    totalRejected
                  }

                </h2>


                


              </div>


            </div>



            {/* TOTAL */}

            <div className="doctor-info-card card-blue">


              <FaCalendarCheck
                className="doctor-card-icon"
              />


              <div>


                <p>
                  Total Appointments
                </p>


                <h2>

                  {
                    totalAppointments
                  }

                </h2>


                


              </div>


            </div>


          </div>



          {/* =================================================
              PATIENT LIST
          ================================================= */}

          <div className="doctor-patient-card">


            <div className="doctor-patient-header">


              <div>


                <h2>
                  Patient List
                </h2>


                <p>

                  Accepted and rejected
                  appointment patients.

                </p>


              </div>



              <div className="doctor-patient-controls">


                <div className="doctor-patient-search">


                  <FaSearch />


                  <input

                    type="text"

                    placeholder=
                      "Search ID, name, email, phone..."

                    value={
                      searchText
                    }

                    onChange={
                      event =>
                        setSearchText(
                          event.target.value
                        )
                    }

                  />


                </div>



                <select

                  value={
                    statusFilter
                  }

                  onChange={
                    event =>
                      setStatusFilter(
                        event.target.value
                      )
                  }

                >

                  <option value="all">

                    All Decisions

                  </option>


                  <option value="accepted">

                    Accepted

                  </option>


                  <option value="rejected">

                    Rejected

                  </option>


                </select>


              </div>


            </div>



            <div className="doctor-patient-table-wrapper">


              <table className="doctor-patient-table">


                <thead>


                  <tr>


                    <th>
                      Request ID
                    </th>


                    <th>
                      Patient
                    </th>


                    <th>
                      Email
                    </th>


                    <th>
                      Phone
                    </th>


                    <th>
                      Status
                    </th>


                    <th>
                      Serial
                    </th>


                    <th>
                      Appointment Date
                    </th>


                    <th>
                      Time
                    </th>


                    <th>
                      Comment
                    </th>


                  </tr>


                </thead>



                <tbody>


                  {
                    !loading
                    &&
                    currentPatients.map(
                      appointment => {

                        const accepted =

                          (
                            appointment.requestStatus
                            ||
                            ""
                          )
                          .toLowerCase()
                          ===
                          "approved";


                        return (

                          <tr
                            key={
                              appointment.id
                            }
                          >


                            <td>

                              #
                              {
                                appointment.id
                              }

                            </td>



                            <td>


                              <strong>

                                {
                                  appointment.patientName
                                }

                              </strong>


                            </td>



                            <td>

                              {
                                appointment.email
                              }

                            </td>



                            <td>

                              {
                                appointment.phone
                              }

                            </td>



                            <td>


                              {
                                accepted

                                  ? (

                                    <span className="doctor-history-status accepted">

                                      <FaCheckCircle />

                                      Accepted

                                    </span>

                                  )

                                  : (

                                    <span className="doctor-history-status rejected">

                                      <FaTimesCircle />

                                      Rejected

                                    </span>

                                  )
                              }


                            </td>



                            <td>


                              {
                                accepted
                                  ? appointment.serialNo
                                    || "—"
                                  : "—"
                              }


                            </td>



                            <td>


                              {
                                accepted

                                  ? formatDate(
                                      appointment.appointmentDate
                                    )

                                  : "—"
                              }


                            </td>



                            <td>


                              {
                                accepted

                                  ? formatTime(
                                      appointment.patientTime
                                    )

                                  : "—"
                              }


                            </td>



                            <td>


                              {
                                accepted
                                  ? appointment.doctorComment
                                    || "—"
                                  : "Request rejected"
                              }


                            </td>


                          </tr>

                        );

                      }
                    )
                  }


                </tbody>


              </table>


            </div>



            {/* =================================================
                LOADING
            ================================================= */}

            {
              loading
              &&

              (

                <div className="doctor-no-patient">


                  <FaClock />


                  <h3>
                    Loading appointment history...
                  </h3>


                </div>

              )
            }



            {/* =================================================
                EMPTY
            ================================================= */}

            {
              !loading
              &&
              searchedPatients.length === 0
              &&

              (

                <div className="doctor-no-patient">


                  <FaCalendarCheck />


                  <h3>
                    No accepted or rejected patient found
                  </h3>


                  <p>

                    After you accept or reject
                    an appointment request,
                    the patient will appear here.

                  </p>


                </div>

              )
            }



            {/* =================================================
                PAGINATION
            ================================================= */}

            {
              !loading
              &&
              searchedPatients.length > 0
              &&

              (

                <div className="doctor-patient-footer">


                  <p>

                    Showing{" "}

                    {
                      firstIndex + 1
                    }

                    {" "}to{" "}

                    {
                      Math.min(
                        lastIndex,
                        searchedPatients.length
                      )
                    }

                    {" "}of{" "}

                    {
                      searchedPatients.length
                    }

                    {" "}entries

                  </p>



                  <div className="doctor-patient-pagination">


                    <button

                      type="button"

                      disabled={
                        currentPage === 1
                      }

                      onClick={
                        () =>
                          setCurrentPage(
                            previous =>
                              previous - 1
                          )
                      }

                    >

                      «

                    </button>



                    {
                      Array.from(
                        {
                          length:
                            totalPages
                        },

                        (
                          _,
                          index
                        ) =>
                          index + 1
                      )

                      .map(
                        page => (

                          <button

                            type="button"

                            key={
                              page
                            }

                            className={
                              currentPage === page
                                ? "active-page"
                                : ""
                            }

                            onClick={
                              () =>
                                setCurrentPage(
                                  page
                                )
                            }

                          >

                            {
                              page
                            }

                          </button>

                        )
                      )
                    }



                    <button

                      type="button"

                      disabled={
                        currentPage ===
                          totalPages

                        ||

                        totalPages ===
                          0
                      }

                      onClick={
                        () =>
                          setCurrentPage(
                            previous =>
                              previous + 1
                          )
                      }

                    >

                      »

                    </button>


                  </div>


                </div>

              )
            }


          </div>


        </div>


      </div>


    </div>

  );

}


export default DoctorDashboard;