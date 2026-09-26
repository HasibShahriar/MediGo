import "../../Style/PatientCSS/PatientAccount.css";

import Nav from "../Components/Nav";
import Footer from "../Components/Footer";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  useLocation,
  useNavigate
} from "react-router-dom";

import axios from "axios";

import {
  ToastContainer,
  toast
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import {
  FaUserMd,
  FaShoppingCart,
  FaFileMedicalAlt,
  FaCalendarCheck,
  FaHistory,
  FaTrash,
  FaPills,
  FaBoxOpen,
  FaArrowRight,
  FaCreditCard,
  FaCheckCircle,
  FaClock,
  FaTimesCircle
} from "react-icons/fa";


const API_URL =
  "http://localhost:5138";


function PatientAccount() {

  const navigate =
    useNavigate();


  const location =
    useLocation();



  // =====================================================
  // PATIENT
  // =====================================================

  const [
    patient,
    setPatient
  ] = useState(null);


  const [
    activeTab,
    setActiveTab
  ] = useState("cart");



  // =====================================================
  // CART
  // =====================================================

  const [
    cartItems,
    setCartItems
  ] = useState([]);


  const [
    cartLoading,
    setCartLoading
  ] = useState(true);


  const [
    confirmingOrder,
    setConfirmingOrder
  ] = useState(false);



  // =====================================================
  // DOCTOR / APPOINTMENT REQUESTS
  // =====================================================

  const [
    doctorRequests,
    setDoctorRequests
  ] = useState([]);


  const [
    doctorRequestsLoading,
    setDoctorRequestsLoading
  ] = useState(false);



  // =====================================================
  // REPORTS SENT
  // =====================================================

  const [
    reports,
    setReports
  ] = useState([]);


  const [
    reportsLoading,
    setReportsLoading
  ] = useState(false);



  // =====================================================
  // MEDICINE ORDERS
  // =====================================================

  const [
    orders,
    setOrders
  ] = useState([]);


  const [
    orderLoading,
    setOrderLoading
  ] = useState(false);



  // =====================================================
  // PENDING REQUESTS
  //
  // SHOW IN:
  // Doctor Request
  // =====================================================

  const pendingDoctorRequests =
    doctorRequests.filter(
      request =>
        request.requestStatus ===
        "Pending"
    );



  // =====================================================
  // APPROVED / REJECTED
  //
  // SHOW IN:
  // Appointment Request
  // =====================================================

  const appointmentRequests =
    doctorRequests.filter(
      request =>

        request.requestStatus ===
          "Approved"

        ||

        request.requestStatus ===
          "Rejected"
    );



  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    document.title =
      "MediGo | Patient Account";


    const savedPatient =
      localStorage.getItem(
        "patient"
      );


    if (!savedPatient) {

      navigate(
        "/patient-login",
        {
          replace:
            true
        }
      );


      return;
    }



    try {

      const parsedPatient =
        JSON.parse(
          savedPatient
        );


      if (!parsedPatient?.id) {

        localStorage.removeItem(
          "patient"
        );


        navigate(
          "/patient-login",
          {
            replace:
              true
          }
        );


        return;
      }



      setPatient(
        parsedPatient
      );



      // CART

      loadCart(
        parsedPatient.id
      );



      // MEDICINE ORDERS

      loadOrders(
        parsedPatient.id
      );



      // APPOINTMENT REQUESTS

      loadDoctorRequests(
        parsedPatient.id
      );



      // REPORTS SENT TO ADMIN

      loadReports(
        parsedPatient.id
      );

    }

    catch (error) {

      console.log(
        "Patient Storage Error:",
        error
      );


      localStorage.removeItem(
        "patient"
      );


      navigate(
        "/patient-login",
        {
          replace:
            true
        }
      );

    }

  }, [
    navigate
  ]);



  // =====================================================
  // PAYMENT RETURN
  // =====================================================

  useEffect(() => {

    if (!patient?.id) {

      return;
    }


    const query =
      new URLSearchParams(
        location.search
      );


    const medicinePayment =
      query.get(
        "payment"
      );


    const appointmentPayment =
      query.get(
        "appointmentPayment"
      );



    // =================================================
    // MEDICINE SUCCESS
    // =================================================

    if (
      medicinePayment ===
      "success"
    ) {

      toast.success(
        "Medicine payment successful. Your order has been confirmed."
      );


      setActiveTab(
        "orders"
      );


      loadCart(
        patient.id
      );


      loadOrders(
        patient.id
      );


      clearQueryString();


      return;
    }



    // =================================================
    // MEDICINE FAILED
    // =================================================

    if (
      medicinePayment ===
      "failed"
    ) {

      toast.error(
        "Medicine payment failed."
      );


      setActiveTab(
        "cart"
      );


      clearQueryString();


      return;
    }



    // =================================================
    // MEDICINE CANCELLED
    // =================================================

    if (
      medicinePayment ===
      "cancelled"
    ) {

      toast.info(
        "Medicine payment was cancelled."
      );


      setActiveTab(
        "cart"
      );


      clearQueryString();


      return;
    }



    // =================================================
    // APPOINTMENT PAYMENT SUCCESS
    //
    // NEW REQUEST IS PENDING
    // SO OPEN DOCTOR REQUEST
    // =================================================

    if (
      appointmentPayment ===
      "success"
    ) {

      toast.success(
        "৳50 booking payment successful. Your request was sent to the doctor."
      );


      setActiveTab(
        "doctor"
      );


      loadDoctorRequests(
        patient.id
      );


      clearQueryString();


      return;
    }



    // =================================================
    // APPOINTMENT FAILED
    // =================================================

    if (
      appointmentPayment ===
      "failed"
    ) {

      toast.error(
        "Appointment booking payment failed."
      );


      setActiveTab(
        "doctor"
      );


      clearQueryString();


      return;
    }



    // =================================================
    // APPOINTMENT CANCELLED
    // =================================================

    if (
      appointmentPayment ===
      "cancelled"
    ) {

      toast.info(
        "Appointment booking payment was cancelled."
      );


      setActiveTab(
        "doctor"
      );


      clearQueryString();

    }

  }, [
    location.search,
    patient?.id
  ]);



  // =====================================================
  // REMOVE QUERY STRING
  // =====================================================

  function clearQueryString() {

    window.history.replaceState(
      {},
      "",
      "/patient-account"
    );
  }



  // =====================================================
  // IMAGE URL
  // =====================================================

  function getImageUrl(
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

      ||

      imagePath.startsWith(
        "data:"
      )

      ||

      imagePath.startsWith(
        "blob:"
      )
    ) {

      return imagePath;
    }


    const cleanPath =
      imagePath
        .replace(
          /\\/g,
          "/"
        )
        .replace(
          /^\/+/,
          ""
        );


    return `${API_URL}/${cleanPath}`;
  }



  // =====================================================
  // LOAD CART
  // =====================================================

  async function loadCart(
    patientId
  ) {

    setCartLoading(
      true
    );


    try {

      const response =
        await axios.get(

          `${API_URL}/api/patient-account/${patientId}/cart`

        );


      setCartItems(

        Array.isArray(
          response.data
        )
          ? response.data
          : []

      );

    }

    catch (error) {

      console.log(
        "Cart Load Error:",
        error
      );


      setCartItems([]);

    }

    finally {

      setCartLoading(
        false
      );

    }
  }



  // =====================================================
  // LOAD DOCTOR / APPOINTMENT REQUESTS
  // =====================================================

  async function loadDoctorRequests(
    patientId
  ) {

    setDoctorRequestsLoading(
      true
    );


    try {

      const response =
        await axios.get(

          `${API_URL}/api/appointments/patient/${patientId}`

        );


      console.log(
        "Doctor Requests:",
        response.data
      );


      setDoctorRequests(

        Array.isArray(
          response.data
        )
          ? response.data
          : []

      );

    }

    catch (error) {

      console.log(
        "Doctor Request Error:",
        error
      );


      console.log(
        "Backend:",
        error.response?.data
      );


      setDoctorRequests([]);

    }

    finally {

      setDoctorRequestsLoading(
        false
      );

    }
  }



  // =====================================================
  // LOAD REPORTS SENT BY THIS PATIENT
  //
  // CORRECT ROUTE:
  // /api/contact/patient/{patientId}
  // =====================================================

  async function loadReports(
    patientId
  ) {

    setReportsLoading(
      true
    );


    try {

      const response =
        await axios.get(

          `${API_URL}/api/contact/patient/${patientId}`

        );


      console.log(
        "Patient Reports:",
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

    }

    finally {

      setReportsLoading(
        false
      );

    }
  }



  // =====================================================
  // LOAD MEDICINE ORDERS
  // =====================================================

  async function loadOrders(
    patientId
  ) {

    setOrderLoading(
      true
    );


    try {

      const response =
        await axios.get(

          `${API_URL}/api/payment/orders/${patientId}`

        );


      setOrders(

        Array.isArray(
          response.data
        )
          ? response.data
          : []

      );

    }

    catch (error) {

      console.log(
        "Order Load Error:",
        error
      );


      setOrders([]);

    }

    finally {

      setOrderLoading(
        false
      );

    }
  }



  // =====================================================
  // DELETE CART ITEM
  // =====================================================

  async function deleteCartItem(
    item
  ) {

    const confirmed =
      window.confirm(

        `Remove "${item.medicineName}" from your cart?`

      );


    if (!confirmed) {

      return;
    }


    try {

      const response =
        await axios.delete(

          `${API_URL}/api/patient-account/cart/${item.id}`

        );


      setCartItems(
        previous =>
          previous.filter(
            current =>
              current.id !==
              item.id
          )
      );


      toast.success(

        `${item.medicineName} removed. ${
          response.data?.returnedQuantity
          ??
          item.quantity
        } item(s) returned to stock.`

      );

    }

    catch (error) {

      toast.error(

        error.response?.data?.message

        ||

        "Could not remove medicine."

      );

    }
  }



  // =====================================================
  // CART TOTAL
  // =====================================================

  const cartTotal =
    useMemo(
      () => {

        return cartItems.reduce(
          (
            total,
            item
          ) => {

            return (

              total

              +

              (
                Number(
                  item.price
                  ||
                  0
                )

                *

                Number(
                  item.quantity
                  ||
                  1
                )
              )

            );

          },
          0
        );

      },
      [
        cartItems
      ]
    );



  // =====================================================
  // CART QUANTITY
  // =====================================================

  const cartQuantity =
    useMemo(
      () => {

        return cartItems.reduce(
          (
            total,
            item
          ) =>

            total

            +

            Number(
              item.quantity
              ||
              1
            ),

          0
        );

      },
      [
        cartItems
      ]
    );



  // =====================================================
  // MEDICINE CHECKOUT
  // =====================================================

  async function confirmOrder() {

    if (!patient?.id) {

      toast.error(
        "Please login first."
      );

      return;
    }


    if (
      cartItems.length ===
      0
    ) {

      toast.error(
        "Your cart is empty."
      );

      return;
    }


    setConfirmingOrder(
      true
    );


    try {

      const response =
        await axios.post(

          `${API_URL}/api/payment/initiate`,

          {
            patientId:
              patient.id
          }

        );


      const paymentUrl =
        response.data?.paymentUrl;


      if (!paymentUrl) {

        toast.error(
          "Payment gateway URL was not received."
        );

        return;
      }


      window.location.href =
        paymentUrl;

    }

    catch (error) {

      console.log(
        "Payment Error:",
        error
      );


      toast.error(

        error.response?.data?.detail

        ||

        error.response?.data?.message

        ||

        "Could not start payment."

      );

    }

    finally {

      setConfirmingOrder(
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
  // FORMAT DATE + TIME FOR REPORT
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
  // FORMAT APPOINTMENT TIME
  // =====================================================

  function formatTime(
    value
  ) {

    if (!value) {

      return "N/A";
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
  // DOCTOR REQUEST
  //
  // PENDING ONLY
  // =====================================================

  function renderDoctorRequests() {

    if (
      doctorRequestsLoading
    ) {

      return (

        <div className="pa-loading">

          <p>
            Loading doctor requests...
          </p>

        </div>

      );
    }


    if (
      pendingDoctorRequests.length ===
      0
    ) {

      return (

        <EmptyState

          icon={
            <FaUserMd />
          }

          title=
            "No pending doctor request"

          text=
            "Paid appointment requests waiting for the doctor's decision will appear here."

        />

      );
    }



    return (

      <div className="pa-doctor-request-list">


        {
          pendingDoctorRequests.map(
            request => (

              <div

                className="pa-doctor-request-card"

                key={
                  request.id
                }

              >


                <div className="pa-doctor-request-top">


                  <DoctorInformation

                    request={
                      request
                    }

                    getImageUrl={
                      getImageUrl
                    }

                  />



                  <span className="pa-request-status pending">

                    <FaClock />

                    Pending

                  </span>


                </div>



                <RequestPaymentInformation

                  request={
                    request
                  }

                  formatDate={
                    formatDate
                  }

                />



                <div className="pa-pending-note">

                  <FaClock />

                  Waiting for the doctor to approve
                  or reject your appointment request.

                </div>


              </div>

            )
          )
        }


      </div>

    );
  }



  // =====================================================
  // APPOINTMENT REQUEST
  //
  // APPROVED + REJECTED ONLY
  // =====================================================

  function renderAppointments() {

    if (
      doctorRequestsLoading
    ) {

      return (

        <div className="pa-loading">

          <p>
            Loading appointment information...
          </p>

        </div>

      );
    }


    if (
      appointmentRequests.length ===
      0
    ) {

      return (

        <EmptyState

          icon={
            <FaCalendarCheck />
          }

          title=
            "No appointment information"

          text=
            "Doctor approved or rejected requests will appear here."

        />

      );
    }



    return (

      <div className="pa-doctor-request-list">


        {
          appointmentRequests.map(
            request => (

              <div

                className="pa-doctor-request-card"

                key={
                  request.id
                }

              >


                <div className="pa-doctor-request-top">


                  <DoctorInformation

                    request={
                      request
                    }

                    getImageUrl={
                      getImageUrl
                    }

                  />



                  {
                    request.requestStatus ===
                      "Approved"

                      ? (

                        <span className="pa-request-status approved">

                          <FaCheckCircle />

                          Approved

                        </span>

                      )

                      : (

                        <span className="pa-request-status rejected">

                          <FaTimesCircle />

                          Rejected

                        </span>

                      )
                  }


                </div>



                <RequestPaymentInformation

                  request={
                    request
                  }

                  formatDate={
                    formatDate
                  }

                />



                {
                  request.requestStatus ===
                    "Approved"

                  &&

                  (

                    <div className="pa-approved-appointment">


                      <div>

                        <small>
                          Serial No
                        </small>

                        <strong>

                          {
                            request.serialNo
                            ||
                            "N/A"
                          }

                        </strong>

                      </div>



                      <div>

                        <small>
                          Appointment Date
                        </small>

                        <strong>

                          {
                            formatDate(
                              request.appointmentDate
                            )
                          }

                        </strong>

                      </div>



                      <div>

                        <small>
                          Patient Coming Time
                        </small>

                        <strong>

                          {
                            formatTime(
                              request.patientTime
                            )
                          }

                        </strong>

                      </div>



                      {
                        request.doctorComment

                        &&

                        (

                          <div className="pa-doctor-comment">


                            <small>
                              Doctor Comment
                            </small>


                            <strong>

                              {
                                request.doctorComment
                              }

                            </strong>


                          </div>

                        )
                      }


                    </div>

                  )
                }



                {
                  request.requestStatus ===
                    "Rejected"

                  &&

                  (

                    <div className="pa-rejected-note">

                      <FaTimesCircle />

                      This appointment request was rejected
                      by the doctor.

                    </div>

                  )
                }


              </div>

            )
          )
        }


      </div>

    );
  }



  // =====================================================
  // REPORTS SENT
  //
  // THESE ARE THE SAME REPORTS SENT TO ADMIN
  // =====================================================

  function renderReports() {

    if (
      reportsLoading
    ) {

      return (

        <div className="pa-loading">

          <p>
            Loading reports...
          </p>

        </div>

      );
    }


    if (
      reports.length ===
      0
    ) {

      return (

        <EmptyState

          icon={
            <FaFileMedicalAlt />
          }

          title=
            "No reports sent"

          text=
            "Reports you send to MediGo administration will appear here."

        />

      );
    }



    return (

      <div className="pa-report-list">


        {
          reports.map(
            report => (

              <div

                className="pa-report-card"

                key={
                  report.id
                }

              >


                <div className="pa-report-header">


                  <div>


                    <h3>

                      {
                        report.concern
                        ||
                        "General Report"
                      }

                    </h3>


                    <p>

                      Sent on{" "}

                      {
                        formatDateTime(
                          report.createdAt
                        )
                      }

                    </p>


                  </div>



                  <span

                    className={
                      report.isRead
                        ? "pa-report-read-badge"
                        : "pa-report-sent-badge"
                    }

                  >

                    {
                      report.isRead
                        ? "Seen by Admin"
                        : "Sent"
                    }

                  </span>


                </div>



                <div className="pa-report-message">


                  <small>
                    Your Message
                  </small>


                  <p>

                    {
                      report.message
                    }

                  </p>


                </div>



                <div className="pa-report-user-info">


                  <span>

                    <strong>
                      Name:
                    </strong>{" "}

                    {
                      report.name
                    }

                  </span>


                  <span>

                    <strong>
                      Email:
                    </strong>{" "}

                    {
                      report.email
                    }

                  </span>


                </div>


              </div>

            )
          )
        }


      </div>

    );
  }



  // =====================================================
  // CART
  // =====================================================

  function renderCart() {

    if (
      cartLoading
    ) {

      return (

        <div className="pa-loading">

          <p>
            Loading your cart...
          </p>

        </div>

      );
    }


    if (
      cartItems.length ===
      0
    ) {

      return (

        <EmptyState

          icon={
            <FaShoppingCart />
          }

          title=
            "Your cart is empty"

          text=
            "Medicines added from MediGo Pharmacy will appear here."

          buttonText=
            "Browse Pharmacy"

          onButtonClick={
            () =>
              navigate(
                "/pharmacy"
              )
          }

        />

      );
    }



    return (

      <div className="pa-cart-layout">


        <div className="pa-cart-list">


          {
            cartItems.map(
              item => (

                <div

                  className="pa-cart-card"

                  key={
                    item.id
                  }

                >


                  <div className="pa-cart-image">


                    {
                      item.image

                        ? (

                          <img

                            src={
                              getImageUrl(
                                item.image
                              )
                            }

                            alt={
                              item.medicineName
                            }

                          />

                        )

                        : (

                          <FaPills />

                        )
                    }


                  </div>



                  <div className="pa-cart-info">


                    <div className="pa-cart-heading">


                      <div>


                        <h3>

                          {
                            item.medicineName
                          }

                          {" "}

                          {
                            item.strength
                          }

                        </h3>


                        <p>

                          {
                            item.genericName
                          }

                        </p>


                      </div>



                      <button

                        type="button"

                        className="pa-delete-btn"

                        onClick={
                          () =>
                            deleteCartItem(
                              item
                            )
                        }

                      >

                        <FaTrash />

                        Delete

                      </button>


                    </div>



                    <div className="pa-cart-price-row">


                      <div>

                        <small>
                          Unit Price
                        </small>

                        <strong>

                          ৳

                          {
                            Number(
                              item.price
                            )
                            .toFixed(2)
                          }

                        </strong>

                      </div>



                      <div>

                        <small>
                          Quantity
                        </small>

                        <strong>

                          {
                            item.quantity
                          }

                        </strong>

                      </div>



                      <div>

                        <small>
                          Subtotal
                        </small>

                        <strong>

                          ৳

                          {
                            (
                              Number(
                                item.price
                              )

                              *

                              Number(
                                item.quantity
                              )
                            )
                            .toFixed(2)
                          }

                        </strong>

                      </div>


                    </div>


                  </div>


                </div>

              )
            )
          }


        </div>



        <aside className="pa-order-summary">


          <FaCreditCard />


          <h2>
            Checkout
          </h2>


          <div className="pa-summary-line">

            <span>
              Total Quantity
            </span>

            <strong>

              {
                cartQuantity
              }

            </strong>

          </div>



          <div className="pa-summary-total">

            <span>
              Total Amount
            </span>

            <strong>

              ৳

              {
                cartTotal.toFixed(2)
              }

            </strong>

          </div>



          <button

            type="button"

            className="pa-confirm-order-btn"

            disabled={
              confirmingOrder
            }

            onClick={
              confirmOrder
            }

          >

            {
              confirmingOrder
                ? "Opening Payment..."
                : "Confirm & Pay"
            }

            <FaArrowRight />

          </button>


        </aside>


      </div>

    );
  }



  // =====================================================
  // MEDICINE ORDER HISTORY
  // =====================================================

  function renderOrders() {

    if (
      orderLoading
    ) {

      return (

        <div className="pa-loading">

          <p>
            Loading orders...
          </p>

        </div>

      );
    }


    if (
      orders.length ===
      0
    ) {

      return (

        <EmptyState

          icon={
            <FaBoxOpen />
          }

          title=
            "No order history"

          text=
            "Successfully paid medicine orders will appear here."

        />

      );
    }



    return (

      <div className="pa-order-history">


        {
          orders.map(
            order => (

              <div

                className="pa-history-card"

                key={
                  order.id
                }

              >


                <div className="pa-history-heading">


                  <div>


                    <h3>

                      Order #

                      {
                        order.orderNumber
                      }

                    </h3>


                    <p>

                      {
                        formatDate(
                          order.paidAt
                          ||
                          order.createdAt
                        )
                      }

                    </p>


                  </div>



                  <span className="pa-status success">

                    {
                      order.paymentStatus
                    }

                  </span>


                </div>



                <div className="pa-ordered-items">


                  {
                    order.items?.map(
                      item => (

                        <div

                          className="pa-ordered-item"

                          key={
                            item.id
                          }

                        >


                          <div>


                            <strong>

                              {
                                item.medicineName
                              }

                              {" "}

                              {
                                item.strength
                              }

                            </strong>


                            <p>

                              {
                                item.genericName
                              }

                            </p>


                          </div>



                          <div>

                            ৳

                            {
                              Number(
                                item.unitPrice
                              )
                              .toFixed(2)
                            }

                            {" × "}

                            {
                              item.quantity
                            }

                            {" = ৳"}

                            {
                              Number(
                                item.lineTotal
                              )
                              .toFixed(2)
                            }

                          </div>


                        </div>

                      )
                    )
                  }


                </div>



                <div className="pa-history-info">


                  <strong>

                    Total: ৳

                    {
                      Number(
                        order.totalAmount
                      )
                      .toFixed(2)
                    }

                  </strong>


                </div>


              </div>

            )
          )
        }


      </div>

    );
  }



  // =====================================================
  // MENU
  // =====================================================

  const menuItems = [

    {
      id:
        "doctor",

      label:
        "Doctor Request",

      icon:
        <FaUserMd />,

      count:
        pendingDoctorRequests.length
    },


    {
      id:
        "cart",

      label:
        "My Cart",

      icon:
        <FaShoppingCart />,

      count:
        cartQuantity
    },


    {
      id:
        "reports",

      label:
        "Reports Sent",

      icon:
        <FaFileMedicalAlt />,

      count:
        reports.length
    },


    {
      id:
        "appointments",

      label:
        "Appointment Request",

      icon:
        <FaCalendarCheck />,

      count:
        appointmentRequests.length
    },


    {
      id:
        "orders",

      label:
        "Order History",

      icon:
        <FaHistory />,

      count:
        orders.length
    }

  ];



  // =====================================================
  // ACTIVE TAB
  // =====================================================

  function renderActiveTab() {

    switch (
      activeTab
    ) {

      case "doctor":

        return renderDoctorRequests();


      case "cart":

        return renderCart();


      case "reports":

        return renderReports();


      case "appointments":

        return renderAppointments();


      case "orders":

        return renderOrders();


      default:

        return renderCart();

    }
  }



  // =====================================================
  // PAGE TITLE
  // =====================================================

  function getPageTitle() {

    switch (
      activeTab
    ) {

      case "doctor":

        return "Doctor Request";


      case "cart":

        return "My Medicine Cart";


      case "reports":

        return "Reports Sent";


      case "appointments":

        return "Appointment Request";


      case "orders":

        return "Order History";


      default:

        return "Patient Account";

    }
  }



  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="patient-account-page">


      <Nav />


      <main className="patient-account-main">


        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="pa-sidebar">


          <section className="pa-profile-card">


            <div className="pa-profile-image">


              {
                patient?.profileImage

                  ? (

                    <img

                      src={
                        getImageUrl(
                          patient.profileImage
                        )
                      }

                      alt={
                        patient.fullName
                      }

                    />

                  )

                  : (

                    <span>

                      {
                        (
                          patient?.fullName
                          ||
                          "P"
                        )
                        .charAt(0)
                        .toUpperCase()
                      }

                    </span>

                  )
              }


            </div>



            <h2>

              {
                patient?.fullName
                ||
                "Patient"
              }

            </h2>


            <p>

              {
                patient?.email
              }

            </p>


          </section>



          <section className="pa-menu">


            {
              menuItems.map(
                item => (

                  <button

                    type="button"

                    key={
                      item.id
                    }

                    className={
                      activeTab ===
                        item.id

                        ? "pa-menu-item active"

                        : "pa-menu-item"
                    }

                    onClick={
                      () =>
                        setActiveTab(
                          item.id
                        )
                    }

                  >


                    <div>


                      <span className="pa-menu-icon">

                        {
                          item.icon
                        }

                      </span>


                      <span>

                        {
                          item.label
                        }

                      </span>


                    </div>



                    <span className="pa-menu-count">

                      {
                        item.count
                      }

                    </span>


                  </button>

                )
              )
            }


          </section>


        </aside>



        {/* =================================================
            CONTENT
        ================================================= */}

        <section className="pa-content">


          <header className="pa-content-header">


            <div>


              <p className="pa-eyebrow">

                MEDIGO PATIENT ACCOUNT

              </p>


              <h1>

                {
                  getPageTitle()
                }

              </h1>


            </div>


          </header>



          <div className="pa-content-body">

            {
              renderActiveTab()
            }

          </div>


        </section>


      </main>


      <Footer />


      <ToastContainer

        position="bottom-right"

        autoClose={2200}

      />


    </div>

  );
}



// =====================================================
// DOCTOR INFORMATION
// =====================================================

function DoctorInformation({
  request,
  getImageUrl
}) {

  return (

    <div className="pa-request-doctor-info">


      {
        request.profileImage

          ? (

            <img

              src={
                getImageUrl(
                  request.profileImage
                )
              }

              alt={
                request.doctorName
              }

            />

          )

          : (

            <div className="pa-request-doctor-placeholder">

              <FaUserMd />

            </div>

          )
      }



      <div>


        <h3>

          {
            request.doctorName
          }

        </h3>


        <p>

          {
            request.qualifications
            ||
            "Doctor"
          }

        </p>


        <span>

          {
            request.specialty
            ||
            "Speciality not provided"
          }

        </span>


      </div>


    </div>

  );
}



// =====================================================
// APPOINTMENT PAYMENT INFORMATION
// =====================================================

function RequestPaymentInformation({
  request,
  formatDate
}) {

  return (

    <div className="pa-request-payment">


      <div>


        <small>
          Booking Fee
        </small>


        <strong>

          ৳

          {
            Number(
              request.bookingFee
              ??
              50
            )
            .toFixed(2)
          }

        </strong>


        <span className="paid-text">
          Paid
        </span>


      </div>



      <div>


        <small>
          Consultation Fee
        </small>


        <strong>

          {
            request.consultationFee !== null
            &&
            request.consultationFee !== undefined

              ? `৳${Number(
                  request.consultationFee
                ).toFixed(2)}`

              : "Not set"
          }

        </strong>


        <span className="later-text">
          Pay Later
        </span>


      </div>



      <div>


        <small>
          Request Date
        </small>


        <strong>

          {
            formatDate(
              request.createdAt
            )
          }

        </strong>


      </div>


    </div>

  );
}



// =====================================================
// EMPTY STATE
// =====================================================

function EmptyState({
  icon,
  title,
  text,
  buttonText,
  onButtonClick
}) {

  return (

    <div className="pa-empty">


      <div className="pa-empty-icon">

        {
          icon
        }

      </div>


      <h2>

        {
          title
        }

      </h2>


      <p>

        {
          text
        }

      </p>


      {
        buttonText

        &&

        (

          <button

            type="button"

            onClick={
              onButtonClick
            }

          >

            {
              buttonText
            }

            <FaArrowRight />

          </button>

        )
      }


    </div>

  );
}


export default PatientAccount;