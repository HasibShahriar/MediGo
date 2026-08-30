import { useEffect, useState } from "react";

import axios from "axios";

import AdminSidebar from "../Components/AdminSidebar";

import "../../Style/AdminCSS/DoctorFeature.css";

import {
  FaSearch,
  FaCheck,
  FaTimes,
  FaEye,
} from "react-icons/fa";


function DoctorFeature() {

  // ==========================================
  // DOCTOR REQUEST LIST
  // ==========================================

  const [doctorList, setDoctorList] =
    useState([]);


  const [searchText, setSearchText] =
    useState("");


  const [currentPage, setCurrentPage] =
    useState(1);


  const doctorsPerPage = 10;


  // ==========================================
  // VIEW DOCTOR POPUP
  // ==========================================

  const [
    showDoctorModal,
    setShowDoctorModal
  ] = useState(false);


  const [
    selectedDoctor,
    setSelectedDoctor
  ] = useState(null);


  const [
    detailsLoading,
    setDetailsLoading
  ] = useState(false);



  // ==========================================
  // LOAD DOCTOR REQUESTS
  // ==========================================

  useEffect(() => {

    document.title =
      "MediGo | Doctor Requests";


    loadDoctorRequests();

  }, []);



  function loadDoctorRequests() {

    axios
      .get(
        "http://localhost:5138/api/admin/doctors/requests"
      )

      .then((res) => {

        console.log(
          "Doctor Requests:",
          res.data
        );


        setDoctorList(
          res.data
        );

      })

      .catch((err) => {

        console.log(
          "Doctor Request Load Error:",
          err
        );

      });

  }



  // ==========================================
  // APPROVE DOCTOR
  // ==========================================

  function approveDoctor(id) {

    const confirmed =
      window.confirm(
        "Are you sure you want to approve this doctor?"
      );


    if (!confirmed) {

      return;

    }


    axios
      .post(
        `http://localhost:5138/api/admin/doctors/requests/${id}/approve`
      )

      .then((res) => {

        alert(
          res.data.message ||
          "Doctor approved successfully!"
        );


        // Reload remaining requests
        loadDoctorRequests();

      })

      .catch((err) => {

        console.log(
          "Doctor Approval Error:",
          err
        );


        alert(
          err.response?.data?.message ||
          "Could not approve doctor!"
        );

      });

  }



  // ==========================================
  // REJECT DOCTOR
  // ==========================================

  function rejectDoctor(id) {

    const confirmed =
      window.confirm(
        "Are you sure you want to reject this doctor request?"
      );


    if (!confirmed) {

      return;

    }


    axios
      .delete(
        `http://localhost:5138/api/admin/doctors/requests/${id}/reject`
      )

      .then((res) => {

        alert(
          res.data.message ||
          "Doctor request rejected!"
        );


        // Reload remaining requests
        loadDoctorRequests();

      })

      .catch((err) => {

        console.log(
          "Doctor Rejection Error:",
          err
        );


        alert(
          err.response?.data?.message ||
          "Could not reject doctor!"
        );

      });

  }



  // ==========================================
  // VIEW DOCTOR DETAILS
  // ==========================================

  function viewDoctor(id) {

    // Open popup
    setShowDoctorModal(true);


    // Show loading
    setDetailsLoading(true);


    // Clear previous selected doctor
    setSelectedDoctor(null);


    axios
      .get(
        `http://localhost:5138/api/admin/doctors/requests/${id}`
      )

      .then((res) => {

        console.log(
          "Doctor Details:",
          res.data
        );


        setSelectedDoctor(
          res.data
        );

      })

      .catch((err) => {

        console.log(
          "Doctor Detail Error:",
          err
        );


        alert(
          err.response?.data?.message ||
          "Could not load doctor information!"
        );


        setShowDoctorModal(false);

      })

      .finally(() => {

        setDetailsLoading(false);

      });

  }



  // ==========================================
  // CLOSE POPUP
  // ==========================================

  function closeDoctorModal() {

    setShowDoctorModal(false);

    setSelectedDoctor(null);

  }



  // ==========================================
  // SEARCH
  // ==========================================

  const searchedDoctors =
    doctorList.filter((doctor) => {

      const search =
        searchText
          .trim()
          .toLowerCase();


      return (

        doctor.fullName
          ?.toLowerCase()
          .includes(search)

        ||

        doctor.phone
          ?.toLowerCase()
          .includes(search)

        ||

        doctor.email
          ?.toLowerCase()
          .includes(search)

        ||

        doctor.bmdcNumber
          ?.toLowerCase()
          .includes(search)

        ||

        doctor.requestStatus
          ?.toLowerCase()
          .includes(search)

      );

    });



  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages =
    Math.ceil(
      searchedDoctors.length /
      doctorsPerPage
    );


  const lastIndex =
    currentPage *
    doctorsPerPage;


  const firstIndex =
    lastIndex -
    doctorsPerPage;


  const currentDoctors =
    searchedDoctors.slice(
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



  return (

    <div className="admin-doctor-layout">


      {/* =================================
          ADMIN SIDEBAR
      ================================= */}

      <AdminSidebar />



      <main className="admin-doctor-main">


        <section className="doctor-table-card">


          {/* =================================
              HEADER
          ================================= */}

          <div className="doctor-table-header">


            <h1>
              Doctor Requests
            </h1>



            <div className="doctor-search-box">


              <FaSearch />


              <input

                type="text"

                placeholder="Search by name, phone, email, BMDC or status"

                value={searchText}

                onChange={(e) => {

                  setSearchText(
                    e.target.value
                  );


                  setCurrentPage(1);

                }}

              />


            </div>


          </div>



          {/* =================================
              TABLE
          ================================= */}

          <div className="doctor-table-wrapper">


            <table className="doctor-admin-table">


              <thead>


                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Name
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    BMDC
                  </th>

                  <th>
                    Request Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>


              </thead>



              <tbody>


                {currentDoctors.map(
                  (doctor) => (

                    <tr key={doctor.id}>


                      {/* ID */}

                      <td>

                        {doctor.id}

                      </td>



                      {/* NAME */}

                      <td>


                        <div className="doctor-name-cell">


                          <span>

                            {doctor.fullName}

                          </span>


                        </div>


                      </td>



                      {/* PHONE */}

                      <td>

                        {doctor.phone}

                      </td>



                      {/* EMAIL */}

                      <td>

                        {doctor.email}

                      </td>



                      {/* BMDC */}

                      <td>

                        {doctor.bmdcNumber}

                      </td>



                      {/* REQUEST STATUS */}

                      <td>


                        <span className="pending-badge">

                          Pending

                        </span>


                      </td>



                      {/* ACTIONS */}

                      <td>


                        <div className="table-btn-group">


                          {/* =====================
                              EYE BUTTON
                          ===================== */}

                          <button

                            type="button"

                            className="view-btn"

                            title="View registration information"

                            onClick={() =>
                              viewDoctor(
                                doctor.id
                              )
                            }

                          >

                            <FaEye />

                          </button>



                          {/* =====================
                              APPROVE
                          ===================== */}

                          <button

                            type="button"

                            className="approve-btn"

                            onClick={() =>
                              approveDoctor(
                                doctor.id
                              )
                            }

                          >

                            <FaCheck />

                            Approve

                          </button>



                          {/* =====================
                              REJECT
                          ===================== */}

                          <button

                            type="button"

                            className="reject-btn"

                            onClick={() =>
                              rejectDoctor(
                                doctor.id
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
                )}


              </tbody>


            </table>



            {/* =================================
                NO DOCTOR
            ================================= */}

            {currentDoctors.length === 0 && (

              <div className="no-doctor-found">


                <h3>

                  No doctor request found

                </h3>


                <p>

                  There are no pending doctor
                  registration requests.

                </p>


              </div>

            )}


          </div>



          {/* =================================
              TABLE FOOTER
          ================================= */}

          <div className="doctor-table-footer">


            <p>

              Showing{" "}

              {
                searchedDoctors.length === 0
                  ? 0
                  : firstIndex + 1
              }

              {" "}to{" "}

              {
                Math.min(
                  lastIndex,
                  searchedDoctors.length
                )
              }

              {" "}of{" "}

              {
                searchedDoctors.length
              }

              {" "}entries

            </p>



            {/* PAGINATION */}

            <div className="doctor-pagination">


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
                  currentPage ===
                    totalPages
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
          DOCTOR VERIFICATION POPUP
      ===================================================== */}

      {showDoctorModal && (

        <div className="doctor-details-overlay">


          <div className="doctor-details-modal">


            {/* ==============================
                LOADING
            ============================== */}

            {detailsLoading ? (

              <div className="doctor-details-loading">


                <p>

                  Loading doctor information...

                </p>


              </div>

            ) : selectedDoctor ? (

              <>


                {/* ==============================
                    POPUP HEADER
                ============================== */}

                <div className="doctor-details-header">


                  <div className="doctor-details-icon">

                    <FaEye />

                  </div>


                  <div>

                    <h2>
                      Doctor Verification
                    </h2>

                    <p>

                      Review registration
                      information.

                    </p>

                  </div>


                </div>



                {/* ==============================
                    DOCTOR INFO
                ============================== */}

                <div className="doctor-details-info">


                  {/* DOCTOR NAME */}

                  <div className="doctor-detail-row">


                    <span className="doctor-detail-label">

                      Doctor Name

                    </span>


                    <span className="doctor-detail-value">

                      {selectedDoctor.fullName}

                    </span>


                  </div>



                  {/* BMDC */}

                  <div className="doctor-detail-row">


                    <span className="doctor-detail-label">

                      Registration Number
                      (BMDC)

                    </span>


                    <span className="doctor-detail-value doctor-important-value">

                      {
                        selectedDoctor.bmdcNumber
                      }

                    </span>


                  </div>



                  {/* NATIONAL ID */}

                  <div className="doctor-detail-row">


                    <span className="doctor-detail-label">

                      National ID /
                      Passport Number

                    </span>


                    <span className="doctor-detail-value doctor-important-value">

                      {
                        selectedDoctor.nationalId
                      }

                    </span>


                  </div>


                </div>



                {/* ==============================
                    OK BUTTON
                ============================== */}

                <div className="doctor-modal-bottom">


                  <button

                    type="button"

                    className="doctor-modal-ok-btn"

                    onClick={
                      closeDoctorModal
                    }

                  >

                    OK

                  </button>


                </div>


              </>

            ) : null}


          </div>


        </div>

      )}


    </div>

  );

}


export default DoctorFeature;