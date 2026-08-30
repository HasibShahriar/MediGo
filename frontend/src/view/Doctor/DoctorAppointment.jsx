import "../../Style/DoctorCSS/DoctorAppointment.css";

import DoctorSidebar from "../Components/DoctorSidebar";
import DoctorTopbar from "../Components/DoctorTopbar";
import UserList from "../UserList/Users";

import { useEffect, useState } from "react";
import { FaSearch, FaCheck, FaTimes } from "react-icons/fa";

function DoctorAppointment() {
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [patientTime, setPatientTime] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");

  const [appointmentList, setAppointmentList] = useState(
    UserList.map((user) => ({
      ...user,
      requestStatus: "pending",
      isVisible: true,
      appointmentDate: "",
      patientTime: "",
      serialNo: "",
      comment: "",
    }))
  );

  const [showModal, setShowModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [serialNo, setSerialNo] = useState("");
  const [comment, setComment] = useState("");

  const appointmentsPerPage = 10;

  useEffect(() => {
    document.title = "MediGo | Doctor Appointment";
  }, []);

  function openApproveModal(id) {
  setSelectedAppointmentId(id);
  setSerialNo("");
  setAppointmentDate("");
  setPatientTime("");
  setComment("");
  setShowModal(true);
  }

function confirmApprove() {
  const updatedList = appointmentList.map((appointment) =>
    appointment.id === selectedAppointmentId
      ? {
          ...appointment,
          requestStatus: "approved",
          serialNo: serialNo,
          appointmentDate: appointmentDate,
          patientTime: patientTime,
          comment: comment,
        }
      : appointment
  );

  setAppointmentList(updatedList);
  setShowModal(false);
}

  function rejectAppointment(id) {
    const updatedList = appointmentList.map((appointment) =>
      appointment.id === id
        ? { ...appointment, isVisible: false }
        : appointment
    );

    setAppointmentList(updatedList);
  }

  const searchedAppointments = appointmentList.filter((appointment) => {
    const search = searchText.toLowerCase();

    return (
      appointment.isVisible === true &&
      (appointment.id.toString().includes(search) ||
        appointment.name.toLowerCase().includes(search) ||
        appointment.email.toLowerCase().includes(search) ||
        appointment.phone.toLowerCase().includes(search) ||
        appointment.requestStatus.toLowerCase().includes(search))
    );
  });

  const totalPages = Math.ceil(
    searchedAppointments.length / appointmentsPerPage
  );

  const lastIndex = currentPage * appointmentsPerPage;
  const firstIndex = lastIndex - appointmentsPerPage;

  const currentAppointments = searchedAppointments.slice(
    firstIndex,
    lastIndex
  );

  const paginationButtons = [];

  for (let page = 1; page <= totalPages; page++) {
    paginationButtons.push(
      <button
        key={page}
        onClick={() => setCurrentPage(page)}
        className={currentPage === page ? "active-page" : ""}
      >
        {page}
      </button>
    );
  }

  return (
    <div className="doctor-appointment-page">
      <DoctorSidebar />

      <div className="doctor-appointment-main">
        <DoctorTopbar />

        <div className="doctor-appointment-content">
          <div className="doctor-appointment-card">
            <div className="doctor-appointment-header">
              <h2>Appointment Request List</h2>

              <div className="doctor-appointment-search">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search by ID, name, email, phone or status"
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            <table className="doctor-appointment-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Request Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.id}</td>
                    <td>{appointment.name}</td>
                    <td>{appointment.email}</td>
                    <td>{appointment.phone}</td>

                    <td>
                      {appointment.requestStatus === "approved" ? (
                        <span className="appointment-approved-badge">
                          Approved
                        </span>
                      ) : (
                        <span className="appointment-pending-badge">
                          Pending
                        </span>
                      )}
                    </td>

                    <td>
                      {appointment.requestStatus === "approved" ? (
                        <span className="appointment-done-text">Approved</span>
                      ) : (
                        <div className="appointment-action-box">
                          <button
                            className="appointment-approve-btn"
                            onClick={() => openApproveModal(appointment.id)}
                          >
                            <FaCheck /> Approve
                          </button>

                          <button
                            className="appointment-reject-btn"
                            onClick={() => rejectAppointment(appointment.id)}
                          >
                            <FaTimes /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="doctor-appointment-footer">
              <p>
                Showing{" "}
                {searchedAppointments.length === 0 ? 0 : firstIndex + 1} to{" "}
                {Math.min(lastIndex, searchedAppointments.length)} of{" "}
                {searchedAppointments.length} entries
              </p>

              <div className="doctor-appointment-pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  «
                </button>

                {paginationButtons}

                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  »
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

     {showModal && (
  <div className="approve-modal-overlay">
    <div className="approve-modal">
      <h2>Approve Appointment</h2>

      <label>Serial No</label>
      <input
        type="text"
        placeholder="Enter serial number"
        value={serialNo}
        onChange={(e) => setSerialNo(e.target.value)}
      />

      <label>Appointment Date</label>
      <input
        type="date"
        value={appointmentDate}
        onChange={(e) => setAppointmentDate(e.target.value)}
      />

      <label>Patient Coming Time</label>
      <input
        type="time"
        value={patientTime}
        onChange={(e) => setPatientTime(e.target.value)}
      />

      <label>Comment</label>
      <textarea
        placeholder="Write your comment here"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      ></textarea>

      <div className="approve-modal-buttons">
        <button
          className="modal-cancel-btn"
          onClick={() => setShowModal(false)}
        >
          Cancel
        </button>

        <button className="modal-approve-btn" onClick={confirmApprove}>
          Approve
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default DoctorAppointment;