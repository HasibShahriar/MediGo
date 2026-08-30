import { useEffect, useState } from "react";

import AdminSidebar from "../Components/AdminSidebar";
import AppointmentList from "../UserList/AppointmentList";
import "../../Style/AdminCSS/AppointmentFeature.css";

import { FaTrash, FaSearch } from "react-icons/fa";

function AppointmentFeature() {
  useEffect(() => {
    document.title = "MediGo | Patient Appointment";
  }, []);

  const [appointmentList, setAppointmentList] = useState(AppointmentList);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const appointmentsPerPage = 10;

  function deleteAppointment(id) {
    const updatedAppointments = appointmentList.map((appointment) =>
      appointment.id === id
        ? { ...appointment, isVisible: false }
        : appointment
    );

    setAppointmentList(updatedAppointments);
  }

  const searchedAppointments = appointmentList.filter((appointment) => {
    const search = searchText.toLowerCase();

    return (
      appointment.isVisible === true &&
      (
        appointment.id.toString().includes(search) ||
        appointment.doctorName.toLowerCase().includes(search) ||
        appointment.patientName.toLowerCase().includes(search) ||
        (appointment.appointmentDate || "10 Dec 2026")
          .toLowerCase()
          .includes(search)
      )
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
    <div className="admin-appointment-layout">
      <AdminSidebar />

      <main className="admin-appointment-main">
        <section className="appointment-table-card">
          <div className="appointment-table-header">
            <h1>Patient Appointment</h1>

            <div className="appointment-search-box">
              <FaSearch />

              <input
                type="text"
                placeholder="Search appointment..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="appointment-table-wrapper">
            <table className="appointment-admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Doctor Name</th>
                  <th>Patient Name</th>
                  <th>Appointment Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.id}</td>
                    <td>{appointment.doctorName}</td>
                    <td>{appointment.patientName}</td>
                    <td>{appointment.appointmentDate || "10 Dec 2026"}</td>

                    <td>
                      <button
                        className="appointment-delete-btn"
                        onClick={() => deleteAppointment(appointment.id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {currentAppointments.length === 0 && (
              <div className="no-appointment-found">
                <h3>No appointment found</h3>
                <p>Try searching another doctor, patient, or date.</p>
              </div>
            )}
          </div>

          <div className="appointment-table-footer">
            <p>
              Showing {searchedAppointments.length === 0 ? 0 : firstIndex + 1}{" "}
              to {Math.min(lastIndex, searchedAppointments.length)} of{" "}
              {searchedAppointments.length} entries
            </p>

            <div className="appointment-pagination">
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
        </section>
      </main>
    </div>
  );
}

export default AppointmentFeature;