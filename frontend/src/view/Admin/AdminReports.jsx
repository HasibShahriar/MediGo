import "../../Style/AdminCSS/AdminReports.css";

import AdminSidebar from "../Components/AdminSidebar";

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
  ToastContainer,
  toast
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import {
  FaSearch,
  FaEye,
  FaTrash,
  FaEnvelope,
  FaEnvelopeOpen,
  FaTimes
} from "react-icons/fa";


const API_URL =
  "http://localhost:5138";


function AdminReport() {

  const navigate =
    useNavigate();


  // =====================================================
  // REPORTS
  // =====================================================

  const [
    reports,
    setReports
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  // =====================================================
  // SEARCH / FILTER
  // =====================================================

  const [
    searchText,
    setSearchText
  ] = useState("");


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


  const reportsPerPage =
    10;


  // =====================================================
  // SELECTED REPORT
  // =====================================================

  const [
    selectedReport,
    setSelectedReport
  ] = useState(null);



  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    document.title =
      "MediGo | Admin Reports";


    const admin =
      localStorage.getItem(
        "admin"
      );


    if (!admin) {

      navigate(
        "/admin-login",
        {
          replace: true
        }
      );


      return;
    }


    loadReports();

  }, [
    navigate
  ]);



  // =====================================================
  // RESET PAGE WHEN SEARCH / FILTER CHANGES
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
  // LOAD REPORTS FROM BACKEND
  // =====================================================

  async function loadReports() {

    setLoading(
      true
    );


    try {

      const response =
        await axios.get(

          `${API_URL}/api/contact/admin/messages`

        );


      console.log(
        "Admin Reports:",
        response.data
      );


      setReports(

        Array.isArray(
          response.data
        )
          ? response.data
          : []

      );

    }

    catch (error) {

      console.log(
        "Report Load Error:",
        error
      );


      console.log(
        "Backend:",
        error.response?.data
      );


      setReports([]);


      toast.error(

        error.response?.data?.message
        ||
        "Could not load reports."

      );

    }

    finally {

      setLoading(
        false
      );

    }

  }



  // =====================================================
  // FILTER REPORTS
  // =====================================================

  const filteredReports =
    useMemo(
      () => {

        const search =
          searchText
            .trim()
            .toLowerCase();


        return reports.filter(
          report => {

            const matchesSearch =

              search === ""

              ||

              report.id
                ?.toString()
                .includes(search)

              ||

              report.patientId
                ?.toString()
                .includes(search)

              ||

              report.name
                ?.toLowerCase()
                .includes(search)

              ||

              report.email
                ?.toLowerCase()
                .includes(search)

              ||

              report.concern
                ?.toLowerCase()
                .includes(search)

              ||

              report.message
                ?.toLowerCase()
                .includes(search);



            let matchesStatus =
              true;


            if (
              statusFilter ===
              "unread"
            ) {

              matchesStatus =
                report.isRead ===
                false;

            }


            else if (
              statusFilter ===
              "read"
            ) {

              matchesStatus =
                report.isRead ===
                true;

            }



            return (

              matchesSearch
              &&
              matchesStatus

            );

          }
        );

      },
      [
        reports,
        searchText,
        statusFilter
      ]
    );



  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages =
    Math.ceil(

      filteredReports.length
      /
      reportsPerPage

    );


  const lastIndex =
    currentPage
    *
    reportsPerPage;


  const firstIndex =
    lastIndex
    -
    reportsPerPage;


  const currentReports =
    filteredReports.slice(
      firstIndex,
      lastIndex
    );



  // =====================================================
  // KEEP CURRENT PAGE VALID
  // =====================================================

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
  // COUNTS
  // =====================================================

  const unreadCount =
    reports.filter(
      report =>
        report.isRead ===
        false
    ).length;


  const readCount =
    reports.filter(
      report =>
        report.isRead ===
        true
    ).length;



  // =====================================================
  // DATE
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
  // VIEW REPORT
  //
  // ALSO MARKS IT AS READ
  // =====================================================

  async function viewReport(
    report
  ) {

    setSelectedReport(
      report
    );


    if (
      report.isRead
    ) {

      return;

    }


    try {

      await axios.put(

        `${API_URL}/api/contact/admin/messages/${report.id}/read`

      );


      setReports(
        previous =>
          previous.map(
            item =>

              item.id ===
                report.id

                ? {
                    ...item,

                    isRead:
                      true
                  }

                : item

          )
      );


      setSelectedReport(
        previous => {

          if (!previous) {

            return previous;

          }


          return {
            ...previous,

            isRead:
              true
          };

        }
      );

    }

    catch (error) {

      console.log(
        "Mark Read Error:",
        error
      );


      console.log(
        "Backend:",
        error.response?.data
      );

    }

  }



  // =====================================================
  // DELETE REPORT
  // =====================================================

  async function deleteReport(
    report
  ) {

    const confirmed =
      window.confirm(

        `Are you sure you want to delete the report from "${report.name}"?`

      );


    if (!confirmed) {

      return;

    }


    try {

      const response =
        await axios.delete(

          `${API_URL}/api/contact/admin/messages/${report.id}`

        );


      toast.success(

        response.data?.message
        ||
        "Report deleted successfully."

      );


      setReports(
        previous =>
          previous.filter(
            item =>
              item.id !==
              report.id
          )
      );


      if (
        selectedReport?.id ===
        report.id
      ) {

        setSelectedReport(
          null
        );

      }

    }

    catch (error) {

      console.log(
        "Delete Report Error:",
        error
      );


      toast.error(

        error.response?.data?.message
        ||
        "Could not delete report."

      );

    }

  }



  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="admin-report-layout">


      <AdminSidebar />


      <main className="admin-report-main">


        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <section className="admin-report-page-header">


          <div>


            <p className="admin-report-eyebrow">

              PATIENT COMMUNICATION

            </p>


            <h1>
              Reports
            </h1>


            <p className="admin-report-subtitle">

              View messages and reports
              submitted by patients.

            </p>


          </div>


        </section>



        {/* =================================================
            REPORT STATISTICS
        ================================================= */}

        <section className="admin-report-stats">


          <div className="admin-report-stat-card">


            <span className="admin-report-stat-icon total">

              <FaEnvelope />

            </span>


            <div>

              <p>
                Total Reports
              </p>

              <h2>
                {reports.length}
              </h2>

            </div>


          </div>



          <div className="admin-report-stat-card">


            <span className="admin-report-stat-icon unread">

              <FaEnvelope />

            </span>


            <div>

              <p>
                Unread Reports
              </p>

              <h2>
                {unreadCount}
              </h2>

            </div>


          </div>



          <div className="admin-report-stat-card">


            <span className="admin-report-stat-icon read">

              <FaEnvelopeOpen />

            </span>


            <div>

              <p>
                Read Reports
              </p>

              <h2>
                {readCount}
              </h2>

            </div>


          </div>


        </section>



        {/* =================================================
            REPORT TABLE CARD
        ================================================= */}

        <section className="admin-report-table-card">


          {/* HEADER */}

          <div className="admin-report-table-header">


            <div>


              <h2>
                Patient Reports
              </h2>


              <p>

                Reports received through
                MediGo.

              </p>


            </div>



            <div className="admin-report-controls">


              {/* SEARCH */}

              <div className="admin-report-search">


                <FaSearch />


                <input

                  type="text"

                  placeholder=
                    "Search ID, patient, email or concern..."

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



              {/* STATUS FILTER */}

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

                  All Reports

                </option>


                <option value="unread">

                  Unread

                </option>


                <option value="read">

                  Read

                </option>


              </select>


            </div>


          </div>



          {/* =================================================
              TABLE
          ================================================= */}

          <div className="admin-report-table-wrapper">


            <table className="admin-report-table">


              <thead>


                <tr>


                  <th>
                    ID
                  </th>


                  <th>
                    Patient
                  </th>


                  <th>
                    Email
                  </th>


                  <th>
                    Concern
                  </th>


                  <th>
                    Message
                  </th>


                  <th>
                    Status
                  </th>


                  <th>
                    Date
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
                  currentReports.map(
                    report => (

                      <tr

                        key={
                          report.id
                        }

                        className={
                          report.isRead

                            ? ""

                            : "admin-report-unread-row"
                        }

                      >


                        {/* ID */}

                        <td>


                          <strong>

                            #
                            {
                              report.id
                            }

                          </strong>


                        </td>



                        {/* PATIENT */}

                        <td>


                          <div className="admin-report-patient">


                            <strong>

                              {
                                report.name
                              }

                            </strong>


                            {
                              report.patientId

                              &&

                              (

                                <small>

                                  Patient ID:{" "}

                                  {
                                    report.patientId
                                  }

                                </small>

                              )
                            }


                          </div>


                        </td>



                        {/* EMAIL */}

                        <td>


                          <span className="admin-report-email">

                            {
                              report.email
                            }

                          </span>


                        </td>



                        {/* CONCERN */}

                        <td>


                          <span className="admin-report-concern">

                            {
                              report.concern
                            }

                          </span>


                        </td>



                        {/* MESSAGE */}

                        <td>


                          <div className="admin-report-message-preview">


                            {
                              report.message?.length >
                              60

                                ? `${report.message.substring(
                                    0,
                                    60
                                  )}...`

                                : report.message
                            }


                          </div>


                        </td>



                        {/* STATUS */}

                        <td>


                          {
                            report.isRead

                              ? (

                                <span className="admin-report-status read">

                                  <FaEnvelopeOpen />

                                  Read

                                </span>

                              )

                              : (

                                <span className="admin-report-status unread">

                                  <FaEnvelope />

                                  Unread

                                </span>

                              )
                          }


                        </td>



                        {/* DATE */}

                        <td>


                          <span className="admin-report-date">

                            {
                              formatDateTime(
                                report.createdAt
                              )
                            }

                          </span>


                        </td>



                        {/* ACTIONS */}

                        <td>


                          <div className="admin-report-actions">


                            <button

                              type="button"

                              className="admin-report-view-btn"

                              title="View Report"

                              onClick={
                                () =>
                                  viewReport(
                                    report
                                  )
                              }

                            >

                              <FaEye />

                            </button>



                            <button

                              type="button"

                              className="admin-report-delete-btn"

                              title="Delete Report"

                              onClick={
                                () =>
                                  deleteReport(
                                    report
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



            {/* LOADING */}

            {
              loading
              &&

              (

                <div className="admin-report-empty">


                  <h3>
                    Loading reports...
                  </h3>


                </div>

              )
            }



            {/* EMPTY */}

            {
              !loading
              &&
              filteredReports.length === 0
              &&

              (

                <div className="admin-report-empty">


                  <FaEnvelope />


                  <h3>
                    No report found
                  </h3>


                  <p>

                    No patient report matches
                    your search or filter.

                  </p>


                </div>

              )
            }


          </div>



          {/* =================================================
              PAGINATION
          ================================================= */}

          {
            !loading
            &&
            filteredReports.length > 0
            &&

            (

              <div className="admin-report-footer">


                {/* SHOWING INFORMATION */}

                <p>

                  Showing{" "}

                  {
                    firstIndex + 1
                  }

                  {" "}to{" "}

                  {
                    Math.min(
                      lastIndex,
                      filteredReports.length
                    )
                  }

                  {" "}of{" "}

                  {
                    filteredReports.length
                  }

                  {" "}entries

                </p>



                {/* PAGINATION BUTTONS */}

                <div className="admin-report-pagination">


                  {/* PREVIOUS */}

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



                  {/* PAGE NUMBERS */}

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
                            currentPage ===
                              page

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



                  {/* NEXT */}

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


        </section>


      </main>



      {/* =================================================
          REPORT DETAILS POPUP
      ================================================= */}

      {
        selectedReport

        &&

        (

          <div

            className="admin-report-modal-overlay"

            onMouseDown={
              () =>
                setSelectedReport(
                  null
                )
            }

          >


            <div

              className="admin-report-modal"

              onMouseDown={
                event =>
                  event.stopPropagation()
              }

            >


              {/* MODAL HEADER */}

              <div className="admin-report-modal-header">


                <div>


                  <p>
                    PATIENT REPORT
                  </p>


                  <h2>

                    {
                      selectedReport.concern
                      ||
                      "Report Details"
                    }

                  </h2>


                </div>



                <button

                  type="button"

                  onClick={
                    () =>
                      setSelectedReport(
                        null
                      )
                  }

                >

                  <FaTimes />

                </button>


              </div>



              {/* DETAILS */}

              <div className="admin-report-detail-grid">


                <div>

                  <small>
                    Report ID
                  </small>

                  <strong>

                    #
                    {
                      selectedReport.id
                    }

                  </strong>

                </div>



                <div>

                  <small>
                    Patient ID
                  </small>

                  <strong>

                    {
                      selectedReport.patientId
                      ||
                      "Not available"
                    }

                  </strong>

                </div>



                <div>

                  <small>
                    Patient Name
                  </small>

                  <strong>

                    {
                      selectedReport.name
                    }

                  </strong>

                </div>



                <div>

                  <small>
                    Email
                  </small>

                  <strong>

                    {
                      selectedReport.email
                    }

                  </strong>

                </div>



                <div>

                  <small>
                    Concern
                  </small>

                  <strong>

                    {
                      selectedReport.concern
                    }

                  </strong>

                </div>



                <div>

                  <small>
                    Status
                  </small>

                  <strong>

                    {
                      selectedReport.isRead
                        ? "Read"
                        : "Unread"
                    }

                  </strong>

                </div>



                <div className="admin-report-full-width">


                  <small>
                    Sent At
                  </small>

                  <strong>

                    {
                      formatDateTime(
                        selectedReport.createdAt
                      )
                    }

                  </strong>


                </div>


              </div>



              {/* MESSAGE */}

              <div className="admin-report-full-message">


                <small>
                  Patient Message
                </small>


                <p>

                  {
                    selectedReport.message
                  }

                </p>


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


export default AdminReport;