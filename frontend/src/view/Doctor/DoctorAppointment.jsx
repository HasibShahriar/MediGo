import "../../Style/DoctorCSS/DoctorAppointment.css";

import DoctorSidebar from "../Components/DoctorSidebar";

import DoctorTopbar from "../Components/DoctorTopbar";

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
  FaSearch,
  FaCheck,
  FaTimes,
  FaClock
} from "react-icons/fa";

import {
  ToastContainer,
  toast
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";


const API_URL =
  "http://localhost:5138";


function DoctorAppointment() {

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
  // SEARCH / PAGINATION
  // =====================================================

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
  // APPROVE MODAL
  // =====================================================

  const [
    showModal,
    setShowModal
  ] = useState(false);


  const [
    selectedAppointment,
    setSelectedAppointment
  ] = useState(null);


  const [
    serialNo,
    setSerialNo
  ] = useState("");


  const [
    appointmentDate,
    setAppointmentDate
  ] = useState("");


  const [
    patientTime,
    setPatientTime
  ] = useState("");


  const [
    comment,
    setComment
  ] = useState("");


  const [
    saving,
    setSaving
  ] = useState(false);



  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    document.title =
      "MediGo | Doctor Appointment";


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


      localStorage.removeItem(
        "doctor"
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
  // LOAD ALL APPOINTMENTS FOR THIS DOCTOR
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
        "Doctor Appointments:",
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
        "Appointment Load Error:",
        error
      );


      console.log(
        "Backend:",
        error.response?.data
      );


      setAppointmentList([]);


      toast.error(

        error.response?.data?.message
        ||
        "Could not load appointment requests."

      );

    }

    finally {

      setLoading(
        false
      );

    }

  }



  // =====================================================
  // ONLY PENDING REQUESTS BELONG ON THIS PAGE
  // =====================================================

  const pendingAppointments =
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
            "pending"

        );

      },
      [
        appointmentList
      ]
    );



  // =====================================================
  // SEARCH PENDING REQUESTS
  // =====================================================

  const searchedAppointments =
    useMemo(
      () => {

        const search =
          searchText
            .trim()
            .toLowerCase();


        if (!search) {

          return pendingAppointments;

        }


        return pendingAppointments.filter(
          appointment => {

            const searchable =
              [
                appointment.id,
                appointment.patientName,
                appointment.email,
                appointment.phone
              ]

                .filter(
                  value =>
                    value !== null
                    &&
                    value !== undefined
                )

                .join(" ")

                .toLowerCase();


            return searchable.includes(
              search
            );

          }
        );

      },
      [
        pendingAppointments,
        searchText
      ]
    );



  // =====================================================
  // RESET PAGE AFTER SEARCH
  // =====================================================

  useEffect(() => {

    setCurrentPage(1);

  }, [
    searchText
  ]);



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
  // OPEN APPROVE MODAL
  // =====================================================

  function openApproveModal(
    appointment
  ) {

    setSelectedAppointment(
      appointment
    );


    setSerialNo("");

    setAppointmentDate("");

    setPatientTime("");

    setComment("");


    setShowModal(
      true
    );

  }



  // =====================================================
  // CLOSE MODAL
  // =====================================================

  function closeModal() {

    if (saving) {

      return;

    }


    setShowModal(
      false
    );


    setSelectedAppointment(
      null
    );


    setSerialNo("");

    setAppointmentDate("");

    setPatientTime("");

    setComment("");

  }



  // =====================================================
  // APPROVE REQUEST
  // =====================================================

  async function confirmApprove() {

    if (
      !doctor?.id
      ||
      !selectedAppointment?.id
    ) {

      return;

    }


    if (
      !serialNo.trim()
    ) {

      toast.error(
        "Serial number is required."
      );

      return;

    }


    if (!appointmentDate) {

      toast.error(
        "Appointment date is required."
      );

      return;

    }


    if (!patientTime) {

      toast.error(
        "Patient coming time is required."
      );

      return;

    }


    setSaving(
      true
    );


    try {

      const response =
        await axios.put(

          `${API_URL}/api/appointments/doctor/${doctor.id}/${selectedAppointment.id}/approve`,

          {
            serialNo:
              serialNo.trim(),

            appointmentDate:
              appointmentDate,

            patientTime:
              `${patientTime}:00`,

            comment:
              comment.trim()
          }

        );


      toast.success(

        response.data?.message
        ||
        "Appointment accepted successfully."

      );


      closeModal();


      // Reload from database.
      // The approved request will disappear
      // from this Pending page automatically.

      await loadAppointments(
        doctor.id
      );


      window.dispatchEvent(
        new Event(
          "doctorAppointmentUpdated"
        )
      );

    }

    catch (error) {

      console.log(
        "Approve Appointment Error:",
        error
      );


      console.log(
        "Backend:",
        error.response?.data
      );


      toast.error(

        error.response?.data?.message
        ||
        "Could not accept appointment."

      );

    }

    finally {

      setSaving(
        false
      );

    }

  }



  // =====================================================
  // REJECT REQUEST
  // =====================================================

  async function rejectAppointment(
    appointment
  ) {

    if (!doctor?.id) {

      return;

    }


    const confirmed =
      window.confirm(

        `Reject appointment request from "${appointment.patientName}"?`

      );


    if (!confirmed) {

      return;

    }


    try {

      const response =
        await axios.put(

          `${API_URL}/api/appointments/doctor/${doctor.id}/${appointment.id}/reject`

        );


      toast.success(

        response.data?.message
        ||
        "Appointment rejected successfully."

      );


      // Reload database.
      // Rejected request disappears from
      // Pending requests.

      await loadAppointments(
        doctor.id
      );


      window.dispatchEvent(
        new Event(
          "doctorAppointmentUpdated"
        )
      );

    }

    catch (error) {

      console.log(
        "Reject Appointment Error:",
        error
      );


      toast.error(

        error.response?.data?.message
        ||
        "Could not reject appointment."

      );

    }

  }



  // =====================================================
  // DATE
  // =====================================================

  function formatDate(
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
  // PAGE
  // =====================================================

  return (

    <div className="doctor-appointment-page">


      <DoctorSidebar />


      <div className="doctor-appointment-main">


        <DoctorTopbar />


        <div className="doctor-appointment-content">


          <div className="doctor-appointment-card">


            {/* =============================================
                HEADER
            ============================================= */}

            <div className="doctor-appointment-header">


              <div>


                <h2>
                  Appointment Requests
                </h2>


                <p>

                  Only pending patient requests
                  are shown here.

                </p>


              </div>



              <div className="doctor-appointment-search">


                <FaSearch />


                <input

                  type="text"

                  placeholder=
                    "Search patient name, email, phone or ID"

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


            </div>



            {/* =============================================
                TABLE
            ============================================= */}

            <div className="doctor-appointment-table-wrapper">


              <table className="doctor-appointment-table">


                <thead>


                  <tr>


                    <th>
                      ID
                    </th>


                    <th>
                      Patient Name
                    </th>


                    <th>
                      Email
                    </th>


                    <th>
                      Phone
                    </th>


                    <th>
                      Booking Fee
                    </th>


                    <th>
                      Consultation Fee
                    </th>


                    <th>
                      Request Date
                    </th>


                    <th>
                      Status
                    </th>


                    <th>
                      Actions
                    </th>


                  </tr>


                </thead>



                <tbody>


                  {
                    !loading
                    &&
                    currentAppointments.map(
                      appointment => (

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


                            <strong>

                              ৳

                              {
                                Number(
                                  appointment.bookingFee
                                  ??
                                  50
                                )
                                .toFixed(2)
                              }

                            </strong>


                            <small className="doctor-paid-text">

                              Paid

                            </small>


                          </td>



                          <td>


                            <strong>

                              {
                                appointment.consultationFee
                                !== null
                                &&
                                appointment.consultationFee
                                !== undefined

                                  ? `৳${Number(
                                      appointment.consultationFee
                                    ).toFixed(2)}`

                                  : "Not set"
                              }

                            </strong>


                            <small className="doctor-pay-later-text">

                              Pay Later

                            </small>


                          </td>



                          <td>

                            {
                              formatDate(
                                appointment.createdAt
                              )
                            }

                          </td>



                          <td>


                            <span className="appointment-pending-badge">

                              <FaClock />

                              Pending

                            </span>


                          </td>



                          <td>


                            <div className="appointment-action-box">


                              <button

                                type="button"

                                className="appointment-approve-btn"

                                onClick={
                                  () =>
                                    openApproveModal(
                                      appointment
                                    )
                                }

                              >

                                <FaCheck />

                                Accept

                              </button>



                              <button

                                type="button"

                                className="appointment-reject-btn"

                                onClick={
                                  () =>
                                    rejectAppointment(
                                      appointment
                                    )
                                }

                              >

                                <FaTimes />

                                Reject

                              </button>


                            </div>


                          </td>


                        </tr>

                      )
                    )
                  }


                </tbody>


              </table>


            </div>



            {/* =============================================
                LOADING
            ============================================= */}

            {
              loading
              &&

              (

                <div className="no-appointment-found">


                  <h3>
                    Loading appointment requests...
                  </h3>


                </div>

              )
            }



            {/* =============================================
                EMPTY
            ============================================= */}

            {
              !loading
              &&
              searchedAppointments.length === 0
              &&

              (

                <div className="no-appointment-found">


                  <FaCalendarEmpty />


                  <h3>
                    No pending appointment request
                  </h3>


                  <p>

                    New paid appointment requests
                    will appear here.

                  </p>


                </div>

              )
            }



            {/* =============================================
                PAGINATION
            ============================================= */}

            {
              !loading
              &&
              searchedAppointments.length > 0
              &&

              (

                <div className="doctor-appointment-footer">


                  <p>

                    Showing{" "}

                    {
                      firstIndex + 1
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



                  <div className="doctor-appointment-pagination">


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
                        currentPage === totalPages
                        ||
                        totalPages === 0
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



      {/* =================================================
          APPROVE MODAL
      ================================================= */}

      {
        showModal
        &&

        (

          <div

            className="approve-modal-overlay"

            onMouseDown={
              closeModal
            }

          >


            <div

              className="approve-modal"

              onMouseDown={
                event =>
                  event.stopPropagation()
              }

            >


              <div className="approve-modal-heading">


                <div>


                  <p>
                    APPOINTMENT
                  </p>


                  <h2>
                    Accept Request
                  </h2>


                  <span>

                    Patient:{" "}

                    <strong>

                      {
                        selectedAppointment
                          ?.patientName
                      }

                    </strong>

                  </span>


                </div>



                <button

                  type="button"

                  className="approve-modal-close"

                  onClick={
                    closeModal
                  }

                >

                  <FaTimes />

                </button>


              </div>



              <label>
                Serial No *
              </label>


              <input

                type="text"

                placeholder=
                  "Enter serial number"

                value={
                  serialNo
                }

                onChange={
                  event =>
                    setSerialNo(
                      event.target.value
                    )
                }

              />



              <label>
                Appointment Date *
              </label>


              <input

                type="date"

                value={
                  appointmentDate
                }

                onChange={
                  event =>
                    setAppointmentDate(
                      event.target.value
                    )
                }

              />



              <label>
                Patient Coming Time *
              </label>


              <input

                type="time"

                value={
                  patientTime
                }

                onChange={
                  event =>
                    setPatientTime(
                      event.target.value
                    )
                }

              />



              <label>
                Comment
              </label>


              <textarea

                placeholder=
                  "Write instructions for the patient..."

                value={
                  comment
                }

                onChange={
                  event =>
                    setComment(
                      event.target.value
                    )
                }

              >
              </textarea>



              <div className="approve-modal-buttons">


                <button

                  type="button"

                  className="modal-cancel-btn"

                  disabled={
                    saving
                  }

                  onClick={
                    closeModal
                  }

                >

                  Cancel

                </button>



                <button

                  type="button"

                  className="modal-approve-btn"

                  disabled={
                    saving
                  }

                  onClick={
                    confirmApprove
                  }

                >

                  {
                    saving
                      ? "Accepting..."
                      : "Accept Appointment"
                  }

                </button>


              </div>


            </div>


          </div>

        )
      }



      <ToastContainer

        position="bottom-right"

        autoClose={1800}

      />


    </div>

  );

}


// Simple empty icon
function FaCalendarEmpty() {

  return (

    <FaClock
      className="appointment-empty-icon"
    />

  );

}


export default DoctorAppointment;