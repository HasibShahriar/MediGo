import AdminSidebar
  from "../Components/AdminSidebar";

import "../../Style/AdminCSS/PatientFeature.css";

import {
  useEffect,
  useState
} from "react";

import axios from "axios";

import {
  FaSearch,
  FaEye,
  FaTrash,
  FaUser
} from "react-icons/fa";

import {
  ToastContainer,
  toast
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";


const API_URL =
  "http://localhost:5138";


function AdminPatientFeature() {

  // =====================================================
  // PATIENT LIST
  // =====================================================

  const [
    patientList,
    setPatientList
  ] = useState([]);


  // =====================================================
  // SEARCH + PAGINATION
  // =====================================================

  const [
    searchText,
    setSearchText
  ] = useState("");


  const [
    currentPage,
    setCurrentPage
  ] = useState(1);


  const patientsPerPage = 10;


  // =====================================================
  // MODAL
  // =====================================================

  const [
    showPatientModal,
    setShowPatientModal
  ] = useState(false);


  const [
    selectedPatient,
    setSelectedPatient
  ] = useState(null);


  const [
    detailsLoading,
    setDetailsLoading
  ] = useState(false);


  // =====================================================
  // PAGE LOADING
  // =====================================================

  const [
    loading,
    setLoading
  ] = useState(true);


  // =====================================================
  // PAGE LOAD
  // =====================================================

  useEffect(() => {

    document.title =
      "MediGo | Patient List";


    loadPatients();

  }, []);


  // =====================================================
  // LOAD ALL PATIENTS FROM SQL
  // =====================================================

  function loadPatients() {

    setLoading(true);


    axios
      .get(
        `${API_URL}/api/admin/patients`
      )

      .then((res) => {

        console.log(
          "Patients:",
          res.data
        );


        setPatientList(
          res.data
        );

      })

      .catch((err) => {

        console.log(
          "Patient Load Error:",
          err
        );


        toast.error(
          err.response?.data?.message ||
          "Could not load patients."
        );

      })

      .finally(() => {

        setLoading(false);

      });

  }


  // =====================================================
  // VIEW PATIENT
  // =====================================================

  function viewPatient(id) {

    setShowPatientModal(
      true
    );


    setSelectedPatient(
      null
    );


    setDetailsLoading(
      true
    );


    axios
      .get(
        `${API_URL}/api/admin/patients/${id}`
      )

      .then((res) => {

        setSelectedPatient(
          res.data
        );

      })

      .catch((err) => {

        console.log(
          "Patient Details Error:",
          err
        );


        toast.error(
          err.response?.data?.message ||
          "Could not load patient details."
        );


        setShowPatientModal(
          false
        );

      })

      .finally(() => {

        setDetailsLoading(
          false
        );

      });

  }


  // =====================================================
  // CLOSE POPUP
  // =====================================================

  function closePatientModal() {

    setShowPatientModal(
      false
    );


    setSelectedPatient(
      null
    );

  }


  // =====================================================
  // DELETE PATIENT PERMANENTLY
  // =====================================================

  function deletePatient(
    id,
    patientName
  ) {

    const confirmed =
      window.confirm(
        `Are you sure you want to permanently delete ${patientName}?`
      );


    if (!confirmed) {
      return;
    }


    axios
      .delete(
        `${API_URL}/api/admin/patients/${id}`
      )

      .then((res) => {

        toast.success(
          res.data.message ||
          "Patient deleted successfully."
        );


        // Remove from table immediately
        setPatientList(
          (previousPatients) =>
            previousPatients.filter(
              (patient) =>
                patient.id !== id
            )
        );


        // If deleted patient's popup was open
        if (
          selectedPatient?.id === id
        ) {

          closePatientModal();

        }

      })

      .catch((err) => {

        console.log(
          "Patient Delete Error:",
          err
        );


        console.log(
          "Backend Error:",
          err.response?.data
        );


        toast.error(
          err.response?.data?.message ||
          "Could not delete patient."
        );

      });

  }


  // =====================================================
  // SEARCH
  // =====================================================

  const searchedPatients =
    patientList.filter(
      (patient) => {

        const search =
          searchText
            .trim()
            .toLowerCase();


        if (!search) {
          return true;
        }


        return (
          (patient.fullName || "")
            .toLowerCase()
            .includes(search)
          ||
          (patient.email || "")
            .toLowerCase()
            .includes(search)
          ||
          (patient.phone || "")
            .toLowerCase()
            .includes(search)
          ||
          patient.id
            .toString()
            .includes(search)
        );

      }
    );


  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages =
    Math.ceil(
      searchedPatients.length /
      patientsPerPage
    );


  const lastIndex =
    currentPage *
    patientsPerPage;


  const firstIndex =
    lastIndex -
    patientsPerPage;


  const currentPatients =
    searchedPatients.slice(
      firstIndex,
      lastIndex
    );


  const paginationButtons = [];


  for (
    let page = 1;
    page <= totalPages;
    page++
  ) {

    paginationButtons.push(

      <button

        key={page}

        onClick={() =>
          setCurrentPage(page)
        }

        className={
          currentPage === page
            ? "active-page"
            : ""
        }

      >

        {page}

      </button>

    );

  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(value) {

    if (!value) {

      return "Not provided";

    }


    const date =
      new Date(value);


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
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );

  }


  // =====================================================
  // IMAGE URL
  // =====================================================

  function getProfileImageUrl(
    imagePath
  ) {

    if (!imagePath) {
      return "";
    }


    if (
      imagePath.startsWith(
        "http://"
      )
      ||
      imagePath.startsWith(
        "https://"
      )
    ) {

      return imagePath;

    }


    const cleanPath =
      imagePath
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");


    return `${API_URL}/${cleanPath}`;

  }


  // =====================================================
  // JSX
  // =====================================================

  return (

    <div className="admin-patient-layout">


      <AdminSidebar />


      <main className="admin-patient-main">


        <section className="patient-table-card">


          {/* =========================================
              HEADER
          ========================================= */}

          <div className="patient-table-header">


            <h1>
              Patient List
            </h1>


            <div className="patient-search-box">


              <FaSearch />


              <input

                type="text"

                placeholder=
                  "Search by ID, name, email or phone"

                value={
                  searchText
                }

                onChange={(e) => {

                  setSearchText(
                    e.target.value
                  );

                  setCurrentPage(1);

                }}

              />


            </div>


          </div>



          {/* =========================================
              TABLE
          ========================================= */}

          <div className="patient-table-wrapper">


            <table className="patient-admin-table">


              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Name
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>



              <tbody>


                {
                  !loading &&
                  currentPatients.map(
                    (patient) => (

                      <tr key={patient.id}>


                        <td>
                          {patient.id}
                        </td>


                        <td>
                          {patient.fullName}
                        </td>


                        <td>
                          {patient.email}
                        </td>


                        <td>
                          {patient.phone}
                        </td>


                        <td>


                          <div className="patient-action-group">


                            {/* =========================
                                VIEW
                            ========================= */}

                            <button

                              type="button"

                              className="patient-view-btn"

                              title="View Patient"

                              onClick={() =>
                                viewPatient(
                                  patient.id
                                )
                              }

                            >

                              <FaEye />

                            </button>



                            {/* =========================
                                DELETE
                            ========================= */}

                            <button

                              type="button"

                              className="patient-delete-btn"

                              title="Delete Patient"

                              onClick={() =>
                                deletePatient(
                                  patient.id,
                                  patient.fullName
                                )
                              }

                            >

                              <FaTrash />

                            </button>


                          </div>


                        </td>


                      </tr>

                    )
                  )
                }


              </tbody>


            </table>



            {/* =========================================
                LOADING
            ========================================= */}

            {
              loading &&
              (

                <div className="no-patient-found">

                  <h3>
                    Loading patients...
                  </h3>

                </div>

              )
            }



            {/* =========================================
                NO RESULTS
            ========================================= */}

            {
              !loading &&
              currentPatients.length === 0 &&
              (

                <div className="no-patient-found">


                  <h3>
                    No patient found
                  </h3>


                  <p>
                    Try searching another ID,
                    name, email or phone.
                  </p>


                </div>

              )
            }


          </div>



          {/* =========================================
              FOOTER
          ========================================= */}

          <div className="patient-table-footer">


            <p>

              Showing{" "}

              {
                searchedPatients.length === 0
                  ? 0
                  : firstIndex + 1
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



            <div className="patient-pagination">


              <button

                disabled={
                  currentPage === 1
                }

                onClick={() =>
                  setCurrentPage(
                    currentPage - 1
                  )
                }

              >

                «

              </button>



              {paginationButtons}



              <button

                disabled={
                  currentPage === totalPages
                  ||
                  totalPages === 0
                }

                onClick={() =>
                  setCurrentPage(
                    currentPage + 1
                  )
                }

              >

                »

              </button>


            </div>


          </div>


        </section>


      </main>



      {/* =====================================================
          PATIENT DETAILS POPUP
      ===================================================== */}

      {
        showPatientModal &&
        (

          <div
            className="patient-details-overlay"

            onClick={
              closePatientModal
            }
          >


            <div

              className="patient-details-modal"

              onClick={(e) =>
                e.stopPropagation()
              }

            >


              {
                detailsLoading
                  ? (

                    <div className="patient-details-loading">

                      Loading patient details...

                    </div>

                  )
                  : selectedPatient
                  ? (

                    <>


                      {/* ===============================
                          HEADER
                      =============================== */}

                      <div className="patient-details-header">


                        <div className="patient-details-icon">

                          <FaUser />

                        </div>


                        <div>

                          <h2>
                            Patient Details
                          </h2>

                          <p>
                            MediGo patient information
                          </p>

                        </div>


                      </div>



                      {/* ===============================
                          PROFILE IMAGE
                      =============================== */}

                      {
                        selectedPatient.profileImage &&
                        (

                          <div className="patient-modal-image">


                            <img

                              src={
                                getProfileImageUrl(
                                  selectedPatient.profileImage
                                )
                              }

                              alt={
                                selectedPatient.fullName
                              }

                            />


                          </div>

                        )
                      }



                      {/* ===============================
                          DETAILS
                      =============================== */}

                      <div className="patient-details-info">


                        <div className="patient-detail-row">

                          <span className="patient-detail-label">

                            Patient ID

                          </span>

                          <span className="patient-detail-value">

                            {
                              selectedPatient.id
                            }

                          </span>

                        </div>



                        <div className="patient-detail-row">

                          <span className="patient-detail-label">

                            Full Name

                          </span>

                          <span className="patient-detail-value patient-important-value">

                            {
                              selectedPatient.fullName
                            }

                          </span>

                        </div>



                        <div className="patient-detail-row">

                          <span className="patient-detail-label">

                            Email

                          </span>

                          <span className="patient-detail-value">

                            {
                              selectedPatient.email
                              ||
                              "Not provided"
                            }

                          </span>

                        </div>



                        <div className="patient-detail-row">

                          <span className="patient-detail-label">

                            Phone Number

                          </span>

                          <span className="patient-detail-value">

                            {
                              selectedPatient.phone
                              ||
                              "Not provided"
                            }

                          </span>

                        </div>



                        <div className="patient-detail-row">

                          <span className="patient-detail-label">

                            Date of Birth

                          </span>

                          <span className="patient-detail-value">

                            {
                              formatDate(
                                selectedPatient.dateOfBirth
                              )
                            }

                          </span>

                        </div>



                        <div className="patient-detail-row">

                          <span className="patient-detail-label">

                            Gender

                          </span>

                          <span className="patient-detail-value">

                            {
                              selectedPatient.gender
                              ||
                              "Not provided"
                            }

                          </span>

                        </div>



                        <div className="patient-detail-row">

                          <span className="patient-detail-label">

                            Address

                          </span>

                          <span className="patient-detail-value">

                            {
                              selectedPatient.address
                              ||
                              "Not provided"
                            }

                          </span>

                        </div>


                      </div>



                      {/* ===============================
                          BOTTOM BUTTON
                      =============================== */}

                      <div className="patient-modal-bottom">


                        <button

                          type="button"

                          className="patient-modal-ok-btn"

                          onClick={
                            closePatientModal
                          }

                        >

                          OK

                        </button>


                      </div>


                    </>

                  )
                  : null
              }


            </div>


          </div>

        )
      }



      <ToastContainer
        position="bottom-right"
        autoClose={1500}
      />


    </div>

  );

}


export default AdminPatientFeature;