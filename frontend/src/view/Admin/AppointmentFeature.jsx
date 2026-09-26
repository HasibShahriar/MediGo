import {
  useEffect,
  useMemo,
  useState
} from "react";

import axios from "axios";

import AdminSidebar
  from "../Components/AdminSidebar";

import "../../Style/AdminCSS/AppointmentFeature.css";

import {
  FaSearch,
  FaCalendarCheck,
  FaClock,
  FaMoneyBillWave
} from "react-icons/fa";


const API_URL =
  "http://localhost:5138";


function AppointmentFeature() {

  // =====================================================
  // STATES
  // =====================================================

  const [
    appointmentList,
    setAppointmentList
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    error,
    setError
  ] = useState("");


  const [
    searchText,
    setSearchText
  ] = useState("");


  const [
    currentPage,
    setCurrentPage
  ] = useState(1);


  const appointmentsPerPage =
    10;



  // =====================================================
  // LOAD APPOINTMENTS
  // =====================================================

  useEffect(() => {

    document.title =
      "MediGo | Patient Appointments";


    loadAppointments();

  }, []);



  async function loadAppointments() {

    setLoading(
      true
    );


    setError(
      ""
    );


    try {

      const response =
        await axios.get(

          `${API_URL}/api/admin/appointments`

        );


      console.log(
        "Admin Appointments:",
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
        "Admin Appointment Error:",
        error
      );


      console.log(
        "Backend:",
        error.response?.data
      );


      setAppointmentList(
        []
      );


      setError(

        error.response?.data?.message

        ||

        "Could not load appointments."

      );

    }

    finally {

      setLoading(
        false
      );

    }
  }



  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(
    value
  ) {

    if (!value) {

      return "Not scheduled";

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
  // FORMAT DATE + TIME
  // =====================================================

  function formatDateTime(
    value
  ) {

    if (!value) {

      return "N/A";

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


    return date.toLocaleString(
      "en-GB",
      {
        day:
          "2-digit",

        month:
          "short",

        year:
          "numeric",

        hour:
          "2-digit",

        minute:
          "2-digit"
      }
    );
  }



  // =====================================================
  // FORMAT PATIENT TIME
  // =====================================================

  function formatTime(
    value
  ) {

    if (!value) {

      return "Not scheduled";

    }


    const parts =
      value
        .toString()
        .split(":");


    if (
      parts.length <
      2
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
      hour ===
      0
    ) {

      hour = 12;

    }


    return (
      `${hour}:${minute} ${suffix}`
    );
  }



  // =====================================================
  // SEARCH
  // =====================================================

  const searchedAppointments =
    useMemo(
      () => {

        const search =
          searchText
            .trim()
            .toLowerCase();


        if (!search) {

          return appointmentList;

        }


        return appointmentList.filter(
          appointment => {

            const searchableText =
              [
                appointment.id,

                appointment.patientId,

                appointment.patientName,

                appointment.patientEmail,

                appointment.patientPhone,

                appointment.doctorId,

                appointment.doctorName,

                appointment.doctorEmail,

                appointment.bmdcNumber,

                appointment.paymentStatus,

                appointment.requestStatus,

                appointment.serialNo,

                appointment.appointmentDate
              ]

                .filter(
                  value =>
                    value !== null
                    &&
                    value !== undefined
                )

                .join(" ")

                .toLowerCase();


            return searchableText.includes(
              search
            );

          }
        );

      },
      [
        appointmentList,
        searchText
      ]
    );



  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages =
    Math.ceil(
      searchedAppointments.length
      /
      appointmentsPerPage
    );


  const lastIndex =
    currentPage
    *
    appointmentsPerPage;


  const firstIndex =
    lastIndex
    -
    appointmentsPerPage;


  const currentAppointments =
    searchedAppointments.slice(
      firstIndex,
      lastIndex
    );



  // =====================================================
  // STATUS
  // =====================================================

  function getStatusClass(
    status
  ) {

    const normalizedStatus =
      status
        ?.toLowerCase();


    if (
      normalizedStatus ===
      "approved"
    ) {

      return "admin-appointment-status approved";

    }


    if (
      normalizedStatus ===
      "rejected"
    ) {

      return "admin-appointment-status rejected";

    }


    return "admin-appointment-status pending";
  }



  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="admin-appointment-layout">


      <AdminSidebar />


      <main className="admin-appointment-main">


        <section className="appointment-table-card">


          {/* =================================================
              HEADER
          ================================================= */}

          <div className="appointment-table-header">


            <div>


              <h1>
                Patient Appointments
              </h1>


              <p className="appointment-admin-subtitle">

                View which patient booked an appointment
                with which doctor.

              </p>


            </div>



            <div className="appointment-search-box">


              <FaSearch />


              <input

                type="text"

                placeholder=
                  "Search patient, doctor, status..."

                value={
                  searchText
                }

                onChange={
                  event => {

                    setSearchText(
                      event.target.value
                    );


                    setCurrentPage(
                      1
                    );

                  }
                }

              />


            </div>


          </div>



          {/* =================================================
              LOADING
          ================================================= */}

          {
            loading

            &&

            (

              <div className="no-appointment-found">


                <FaCalendarCheck
                  className="admin-appointment-empty-icon"
                />


                <h3>
                  Loading appointments...
                </h3>


              </div>

            )
          }



          {/* =================================================
              ERROR
          ================================================= */}

          {
            !loading
            &&
            error

            &&

            (

              <div className="no-appointment-found">


                <h3>
                  Could not load appointments
                </h3>


                <p>
                  {error}
                </p>


                <button

                  type="button"

                  className="appointment-retry-btn"

                  onClick={
                    loadAppointments
                  }

                >

                  Try Again

                </button>


              </div>

            )
          }



          {/* =================================================
              TABLE
          ================================================= */}

          {
            !loading
            &&
            !error

            &&

            (

              <>


                <div className="appointment-table-wrapper">


                  <table className="appointment-admin-table">


                    <thead>


                      <tr>


                        <th>
                          ID
                        </th>


                        <th>
                          Patient
                        </th>


                        <th>
                          Doctor
                        </th>


                        <th>
                          Booking Fee
                        </th>


                        <th>
                          Consultation Fee
                        </th>


                        <th>
                          Payment
                        </th>


                        <th>
                          Request Status
                        </th>


                        <th>
                          Appointment
                        </th>


                        <th>
                          Serial
                        </th>


                      </tr>


                    </thead>



                    <tbody>


                      {
                        currentAppointments.map(
                          appointment => (

                            <tr

                              key={
                                appointment.id
                              }

                            >


                              {/* ID */}

                              <td>


                                <strong>

                                  #
                                  {
                                    appointment.id
                                  }

                                </strong>


                              </td>



                              {/* PATIENT */}

                              <td>


                                <div className="admin-appointment-person">


                                  <strong>

                                    {
                                      appointment.patientName
                                    }

                                  </strong>


                                  <span>

                                    Patient ID:{" "}

                                    {
                                      appointment.patientId
                                    }

                                  </span>


                                  <small>

                                    {
                                      appointment.patientEmail
                                    }

                                  </small>


                                  <small>

                                    {
                                      appointment.patientPhone
                                    }

                                  </small>


                                </div>


                              </td>



                              {/* DOCTOR */}

                              <td>


                                <div className="admin-appointment-person">


                                  <strong>

                                    {
                                      appointment.doctorName
                                    }

                                  </strong>


                                  <span>

                                    Doctor ID:{" "}

                                    {
                                      appointment.doctorId
                                    }

                                  </span>


                                  <small>

                                    {
                                      appointment.doctorEmail
                                    }

                                  </small>


                                  {
                                    appointment.bmdcNumber

                                    &&

                                    (

                                      <small>

                                        BMDC:{" "}

                                        {
                                          appointment.bmdcNumber
                                        }

                                      </small>

                                    )
                                  }


                                </div>


                              </td>



                              {/* BOOKING FEE */}

                              <td>


                                <div className="admin-fee-box">


                                  <FaMoneyBillWave />


                                  <strong>

                                    ৳

                                    {
                                      Number(
                                        appointment.bookingFee
                                        ??
                                        50
                                      )
                                      .toFixed(
                                        2
                                      )
                                    }

                                  </strong>


                                </div>


                              </td>



                              {/* CONSULTATION FEE */}

                              <td>


                                {
                                  appointment.consultationFee
                                  !== null

                                  &&

                                  appointment.consultationFee
                                  !== undefined

                                    ? (

                                      <>

                                        <strong>

                                          ৳

                                          {
                                            Number(
                                              appointment.consultationFee
                                            )
                                            .toFixed(
                                              2
                                            )
                                          }

                                        </strong>


                                        <div className="admin-pay-later">

                                          Pay Later

                                        </div>

                                      </>

                                    )

                                    : (

                                      <span className="admin-not-set">

                                        Not set

                                      </span>

                                    )
                                }


                              </td>



                              {/* PAYMENT */}

                              <td>


                                <span className="admin-payment-status">

                                  {
                                    appointment.paymentStatus
                                  }

                                </span>


                              </td>



                              {/* REQUEST STATUS */}

                              <td>


                                <span

                                  className={
                                    getStatusClass(
                                      appointment.requestStatus
                                    )
                                  }

                                >

                                  {
                                    appointment.requestStatus
                                  }

                                </span>


                              </td>



                              {/* DATE + TIME */}

                              <td>


                                {
                                  appointment.requestStatus ===
                                    "Approved"

                                    ? (

                                      <div className="admin-appointment-schedule">


                                        <div>

                                          <FaCalendarCheck />

                                          <span>

                                            {
                                              formatDate(
                                                appointment.appointmentDate
                                              )
                                            }

                                          </span>

                                        </div>


                                        <div>

                                          <FaClock />

                                          <span>

                                            {
                                              formatTime(
                                                appointment.patientTime
                                              )
                                            }

                                          </span>

                                        </div>


                                      </div>

                                    )

                                    : (

                                      <span className="admin-not-set">

                                        {
                                          appointment.requestStatus ===
                                            "Rejected"

                                            ? "Rejected"

                                            : "Waiting for doctor"
                                        }

                                      </span>

                                    )
                                }


                              </td>



                              {/* SERIAL */}

                              <td>


                                {
                                  appointment.serialNo

                                    ? (

                                      <span className="admin-serial-number">

                                        {
                                          appointment.serialNo
                                        }

                                      </span>

                                    )

                                    : (

                                      <span className="admin-not-set">

                                        —

                                      </span>

                                    )
                                }


                              </td>


                            </tr>

                          )
                        )
                      }


                    </tbody>


                  </table>


                </div>



                {/* =================================================
                    EMPTY
                ================================================= */}

                {
                  currentAppointments.length ===
                    0

                  &&

                  (

                    <div className="no-appointment-found">


                      <FaCalendarCheck
                        className="admin-appointment-empty-icon"
                      />


                      <h3>
                        No appointment found
                      </h3>


                      <p>

                        No matching patient appointment
                        was found.

                      </p>


                    </div>

                  )
                }



                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="appointment-table-footer">


                  <p>

                    Showing{" "}

                    {
                      searchedAppointments.length ===
                        0

                        ? 0

                        : firstIndex + 1
                    }

                    {" "}to{" "}

                    {
                      Math.min(
                        lastIndex,
                        searchedAppointments.length
                      )
                    }

                    {" "}of{" "}

                    {
                      searchedAppointments.length
                    }

                    {" "}entries

                  </p>



                  <div className="appointment-pagination">


                    <button

                      type="button"

                      disabled={
                        currentPage ===
                        1
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

                            onClick={
                              () =>
                                setCurrentPage(
                                  page
                                )
                            }

                            className={
                              currentPage ===
                                page

                                ? "active-page"

                                : ""
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


              </>

            )
          }


        </section>


      </main>


    </div>

  );

}


export default AppointmentFeature;