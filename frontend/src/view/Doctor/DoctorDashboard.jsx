import "../../Style/DoctorCSS/DoctorDashboard.css";

import DoctorSidebar from "../Components/DoctorSidebar";
import DoctorTopbar from "../Components/DoctorTopbar";
import UserList from "../UserList/Users";

import { useEffect, useState } from "react";
import {
  FaUsers,
  FaUserCheck,
  FaCalendarCheck,
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

function DoctorDashboard() {
  const [patientList, setPatientList] = useState(UserList);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const patientsPerPage = 10;

  useEffect(() => {
    document.title = "MediGo | Doctor Dashboard";
  }, []);

  function deletePatient(id) {
    const updatedPatients = patientList.map((patient) =>
      patient.id === id ? { ...patient, isVisible: false } : patient
    );

    setPatientList(updatedPatients);
  }

  const searchedPatients = patientList.filter((patient) => {
    const search = searchText.toLowerCase();

    return (
      patient.isVisible === true &&
      (patient.id.toString().includes(search) ||
        patient.name.toLowerCase().includes(search) ||
        patient.email.toLowerCase().includes(search) ||
        patient.phone.toLowerCase().includes(search))
    );
  });

  const totalPages = Math.ceil(searchedPatients.length / patientsPerPage);

  const lastIndex = currentPage * patientsPerPage;
  const firstIndex = lastIndex - patientsPerPage;

  const currentPatients = searchedPatients.slice(firstIndex, lastIndex);

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
    <div className="doctor-dashboard-page">
      <DoctorSidebar />

      <div className="doctor-dashboard-main">
        <DoctorTopbar />

        <div className="doctor-dashboard-content">
          <div className="doctor-card-row">
            <div className="doctor-info-card card-blue">
              <FaUsers className="doctor-card-icon" />
              <p>Total Patients</p>
              <h2>{UserList.length}+</h2>
            </div>

            <div className="doctor-info-card card-pink">
              <FaUserCheck className="doctor-card-icon" />
              <p>Active Patients</p>
              <h2>
                {UserList.filter((user) => user.isVisible === true).length}+
              </h2>
            </div>

            <div className="doctor-info-card card-green">
              <FaCalendarCheck className="doctor-card-icon" />
              <p>Appointments</p>
              <h2>35+</h2>
            </div>
          </div>

          <div className="doctor-patient-card">
            <div className="doctor-patient-header">
              <h2>Patient List</h2>

              <div className="doctor-patient-search">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search by ID, name, email or phone"
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            <table className="doctor-patient-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.id}</td>
                    <td>{patient.name}</td>
                    <td>{patient.email}</td>
                    <td>{patient.phone}</td>

                    <td>
                      <div className="patient-action-box">
                        <button className="patient-view-btn">
                          <FaEye />
                        </button>

                        <button className="patient-edit-btn">
                          <FaEdit />
                        </button>

                        <button
                          className="patient-delete-btn"
                          onClick={() => deletePatient(patient.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {currentPatients.length === 0 && (
              <div className="doctor-no-patient">
                <h3>No patient found</h3>
                <p>Try searching another ID, name, email, or phone.</p>
              </div>
            )}

            <div className="doctor-patient-footer">
              <p>
                Showing {searchedPatients.length === 0 ? 0 : firstIndex + 1} to{" "}
                {Math.min(lastIndex, searchedPatients.length)} of{" "}
                {searchedPatients.length} entries
              </p>

              <div className="doctor-patient-pagination">
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
    </div>
  );
}

export default DoctorDashboard;