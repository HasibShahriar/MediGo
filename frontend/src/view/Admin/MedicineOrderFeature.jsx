import {
  useEffect,
  useMemo,
  useState
} from "react";

import axios from "axios";

import AdminSidebar
  from "../Components/AdminSidebar";

import "../../Style/AdminCSS/MedicineOrderFeature.css";

import {
  FaSearch,
  FaEye,
  FaShoppingBag,
  FaCheckCircle,
  FaMoneyBillWave,
  FaTimes
} from "react-icons/fa";


const API_URL =
  "http://localhost:5138";


function MedicineOrderFeature() {

  const [
    orders,
    setOrders
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


  const [
    selectedOrder,
    setSelectedOrder
  ] = useState(null);


  const ordersPerPage =
    10;



  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {

    document.title =
      "MediGo | Medicine Orders";


    loadOrders();

  }, []);



  async function loadOrders() {

    setLoading(
      true
    );


    setError(
      ""
    );


    try {

      const response =
        await axios.get(

          `${API_URL}/api/admin/medicine-orders`

        );


      console.log(
        "Admin Medicine Orders:",
        response.data
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
        "Medicine Order Load Error:",
        error
      );


      console.log(
        "Backend:",
        error.response?.data
      );


      setOrders([]);


      setError(

        error.response?.data?.message

        ||

        "Could not load medicine orders."

      );

    }

    finally {

      setLoading(
        false
      );

    }

  }



  // =====================================================
  // MONEY
  // =====================================================

  function formatMoney(
    value
  ) {

    return `৳${Number(
      value
      ??
      0
    ).toFixed(2)}`;

  }



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
  // STATISTICS
  // =====================================================

  const paidOrders =
    orders.filter(
      order =>
        (
          order.paymentStatus
          ||
          ""
        )
        .toLowerCase()
        ===
        "paid"
    );


  const medicineRevenue =
    paidOrders.reduce(
      (
        total,
        order
      ) =>

        total
        +
        Number(
          order.totalAmount
          ||
          0
        ),

      0
    );



  // =====================================================
  // SEARCH
  // =====================================================

  const searchedOrders =
    useMemo(
      () => {

        const search =
          searchText
            .trim()
            .toLowerCase();


        if (!search) {

          return orders;

        }


        return orders.filter(
          order => {

            const medicineNames =
              order.items
                ?.map(
                  item =>
                    item.medicineName
                )
                .join(" ")

              ||
              "";


            const value =
              [
                order.id,
                order.orderNumber,
                order.patientId,
                order.patientName,
                order.patientEmail,
                order.patientPhone,
                order.paymentStatus,
                medicineNames
              ]

                .filter(
                  item =>
                    item !== null
                    &&
                    item !== undefined
                )

                .join(" ")

                .toLowerCase();


            return value.includes(
              search
            );

          }
        );

      },
      [
        orders,
        searchText
      ]
    );



  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages =
    Math.ceil(
      searchedOrders.length
      /
      ordersPerPage
    );


  const lastIndex =
    currentPage
    *
    ordersPerPage;


  const firstIndex =
    lastIndex
    -
    ordersPerPage;


  const currentOrders =
    searchedOrders.slice(
      firstIndex,
      lastIndex
    );



  // =====================================================
  // ITEM QUANTITY
  // =====================================================

  function getTotalQuantity(
    order
  ) {

    return (
      order.items
        ?.reduce(
          (
            total,
            item
          ) =>

            total
            +
            Number(
              item.quantity
              ||
              0
            ),

          0
        )

      ??
      0
    );

  }



  // =====================================================
  // PAYMENT STATUS
  // =====================================================

  function getPaymentClass(
    status
  ) {

    const value =
      (
        status
        ||
        ""
      )
      .toLowerCase();


    if (
      value ===
      "paid"
    ) {

      return "medicine-order-status paid";

    }


    if (
      value ===
        "failed"

      ||

      value ===
        "cancelled"
    ) {

      return "medicine-order-status failed";

    }


    return "medicine-order-status pending";

  }



  return (

    <div className="admin-medicine-order-layout">


      <AdminSidebar />


      <main className="admin-medicine-order-main">


        {/* =================================================
            HEADER
        ================================================= */}

        <section className="medicine-order-header">


          <div>


            <p className="medicine-order-eyebrow">

              PHARMACY MANAGEMENT

            </p>


            <h1>

              Medicine Orders

            </h1>


            <p className="medicine-order-subtitle">

              View all medicine orders placed by
              MediGo patients.

            </p>


          </div>



          <div className="medicine-order-search">


            <FaSearch />


            <input

              type="text"

              placeholder=
                "Search order, patient or medicine..."

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


        </section>



        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="medicine-order-stats">


          <div className="medicine-order-stat-card">


            <span className="medicine-order-stat-icon total">

              <FaShoppingBag />

            </span>


            <div>

              <p>
                Total Orders
              </p>

              <h2>

                {
                  orders.length
                }

              </h2>

            </div>


          </div>



          <div className="medicine-order-stat-card">


            <span className="medicine-order-stat-icon paid">

              <FaCheckCircle />

            </span>


            <div>

              <p>
                Paid Orders
              </p>

              <h2>

                {
                  paidOrders.length
                }

              </h2>

            </div>


          </div>



          <div className="medicine-order-stat-card">


            <span className="medicine-order-stat-icon revenue">

              <FaMoneyBillWave />

            </span>


            <div>

              <p>
                Medicine Revenue
              </p>

              <h2>

                {
                  formatMoney(
                    medicineRevenue
                  )
                }

              </h2>

            </div>


          </div>


        </section>



        {/* =================================================
            TABLE CARD
        ================================================= */}

        <section className="medicine-order-table-card">


          {
            loading

            &&

            (

              <div className="medicine-order-empty">

                <h3>
                  Loading medicine orders...
                </h3>

              </div>

            )
          }



          {
            !loading
            &&
            error

            &&

            (

              <div className="medicine-order-empty">


                <h3>
                  Could not load orders
                </h3>


                <p>
                  {error}
                </p>


                <button

                  type="button"

                  onClick={
                    loadOrders
                  }

                >

                  Try Again

                </button>


              </div>

            )
          }



          {
            !loading
            &&
            !error

            &&

            (

              <>


                <div className="medicine-order-table-wrapper">


                  <table className="medicine-order-table">


                    <thead>


                      <tr>

                        <th>
                          Order
                        </th>

                        <th>
                          Patient
                        </th>

                        <th>
                          Medicines
                        </th>

                        <th>
                          Quantity
                        </th>

                        <th>
                          Total
                        </th>

                        <th>
                          Payment
                        </th>

                        <th>
                          Order Date
                        </th>

                        <th>
                          Details
                        </th>

                      </tr>


                    </thead>



                    <tbody>


                      {
                        currentOrders.map(
                          order => (

                            <tr

                              key={
                                order.id
                              }

                            >


                              {/* ORDER */}

                              <td>


                                <div className="medicine-order-number">


                                  <strong>

                                    {
                                      order.orderNumber
                                      ||
                                      `#${order.id}`
                                    }

                                  </strong>


                                  <span>

                                    ID:{" "}

                                    {
                                      order.id
                                    }

                                  </span>


                                </div>


                              </td>



                              {/* PATIENT */}

                              <td>


                                <div className="medicine-order-patient">


                                  <strong>

                                    {
                                      order.patientName
                                    }

                                  </strong>


                                  <span>

                                    Patient ID:{" "}

                                    {
                                      order.patientId
                                    }

                                  </span>


                                  <small>

                                    {
                                      order.patientEmail
                                    }

                                  </small>


                                  <small>

                                    {
                                      order.patientPhone
                                    }

                                  </small>


                                </div>


                              </td>



                              {/* MEDICINES */}

                              <td>


                                <div className="medicine-order-medicine-preview">


                                  {
                                    order.items
                                      ?.slice(
                                        0,
                                        2
                                      )
                                      .map(
                                        item => (

                                          <span

                                            key={
                                              item.id
                                            }

                                          >

                                            {
                                              item.medicineName
                                            }

                                            {
                                              item.strength

                                                ? ` ${item.strength}`

                                                : ""
                                            }

                                          </span>

                                        )
                                      )
                                  }


                                  {
                                    order.items?.length >
                                      2

                                    &&

                                    (

                                      <small>

                                        +

                                        {
                                          order.items.length
                                          -
                                          2
                                        }

                                        {" "}more

                                      </small>

                                    )
                                  }


                                </div>


                              </td>



                              {/* QUANTITY */}

                              <td>


                                <strong>

                                  {
                                    getTotalQuantity(
                                      order
                                    )
                                  }

                                </strong>


                              </td>



                              {/* TOTAL */}

                              <td>


                                <strong className="medicine-order-total">

                                  {
                                    formatMoney(
                                      order.totalAmount
                                    )
                                  }

                                </strong>


                              </td>



                              {/* PAYMENT */}

                              <td>


                                <span

                                  className={
                                    getPaymentClass(
                                      order.paymentStatus
                                    )
                                  }

                                >

                                  {
                                    order.paymentStatus
                                    ||
                                    "Pending"
                                  }

                                </span>


                              </td>



                              {/* DATE */}

                              <td>


                                <div className="medicine-order-date">


                                  <span>

                                    {
                                      formatDateTime(
                                        order.paidAt
                                        ||
                                        order.createdAt
                                      )
                                    }

                                  </span>


                                  {
                                    order.paidAt

                                    &&

                                    (

                                      <small>
                                        Payment completed
                                      </small>

                                    )
                                  }


                                </div>


                              </td>



                              {/* VIEW */}

                              <td>


                                <button

                                  type="button"

                                  className="medicine-order-view-btn"

                                  onClick={
                                    () =>
                                      setSelectedOrder(
                                        order
                                      )
                                  }

                                  title="View Order"

                                >

                                  <FaEye />

                                </button>


                              </td>


                            </tr>

                          )
                        )
                      }


                    </tbody>


                  </table>


                </div>



                {
                  currentOrders.length ===
                    0

                  &&

                  (

                    <div className="medicine-order-empty">


                      <FaShoppingBag />


                      <h3>
                        No medicine order found
                      </h3>


                      <p>

                        Patient medicine orders will
                        appear here.

                      </p>


                    </div>

                  )
                }



                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="medicine-order-footer">


                  <p>

                    Showing{" "}

                    {
                      searchedOrders.length ===
                        0

                        ? 0

                        : firstIndex + 1
                    }

                    {" "}to{" "}

                    {
                      Math.min(
                        lastIndex,
                        searchedOrders.length
                      )
                    }

                    {" "}of{" "}

                    {
                      searchedOrders.length
                    }

                    {" "}entries

                  </p>



                  <div className="medicine-order-pagination">


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



      {/* =================================================
          ORDER DETAILS MODAL
      ================================================= */}

      {
        selectedOrder

        &&

        (

          <div className="medicine-order-modal-overlay">


            <div className="medicine-order-modal">


              <div className="medicine-order-modal-header">


                <div>


                  <h2>
                    Order Details
                  </h2>


                  <p>

                    {
                      selectedOrder.orderNumber
                    }

                  </p>


                </div>



                <button

                  type="button"

                  className="medicine-order-modal-close"

                  onClick={
                    () =>
                      setSelectedOrder(
                        null
                      )
                  }

                >

                  <FaTimes />

                </button>


              </div>



              {/* PATIENT */}

              <div className="medicine-order-detail-section">


                <h3>
                  Patient Information
                </h3>


                <div className="medicine-order-detail-grid">


                  <div>

                    <small>
                      Patient Name
                    </small>

                    <strong>

                      {
                        selectedOrder.patientName
                      }

                    </strong>

                  </div>



                  <div>

                    <small>
                      Patient ID
                    </small>

                    <strong>

                      {
                        selectedOrder.patientId
                      }

                    </strong>

                  </div>



                  <div>

                    <small>
                      Email
                    </small>

                    <strong>

                      {
                        selectedOrder.patientEmail
                      }

                    </strong>

                  </div>



                  <div>

                    <small>
                      Phone
                    </small>

                    <strong>

                      {
                        selectedOrder.patientPhone
                      }

                    </strong>

                  </div>


                </div>


              </div>



              {/* ORDER INFO */}

              <div className="medicine-order-detail-section">


                <h3>
                  Payment Information
                </h3>


                <div className="medicine-order-detail-grid">


                  <div>

                    <small>
                      Total Amount
                    </small>

                    <strong>

                      {
                        formatMoney(
                          selectedOrder.totalAmount
                        )
                      }

                    </strong>

                  </div>



                  <div>

                    <small>
                      Payment Status
                    </small>

                    <span

                      className={
                        getPaymentClass(
                          selectedOrder.paymentStatus
                        )
                      }

                    >

                      {
                        selectedOrder.paymentStatus
                      }

                    </span>

                  </div>



                  <div>

                    <small>
                      Order Created
                    </small>

                    <strong>

                      {
                        formatDateTime(
                          selectedOrder.createdAt
                        )
                      }

                    </strong>

                  </div>



                  <div>

                    <small>
                      Paid At
                    </small>

                    <strong>

                      {
                        formatDateTime(
                          selectedOrder.paidAt
                        )
                      }

                    </strong>

                  </div>


                </div>


              </div>



              {/* MEDICINES */}

              <div className="medicine-order-detail-section">


                <h3>
                  Purchased Medicines
                </h3>


                <div className="medicine-order-items">


                  {
                    selectedOrder.items?.map(
                      item => (

                        <div

                          className="medicine-order-item"

                          key={
                            item.id
                          }

                        >


                          <div>


                            <strong>

                              {
                                item.medicineName
                              }

                              {
                                item.strength

                                  ? ` ${item.strength}`

                                  : ""
                              }

                            </strong>


                            <p>

                              {
                                item.genericName
                                ||
                                "Generic name not available"
                              }

                            </p>


                          </div>



                          <div className="medicine-order-item-price">


                            <span>

                              {
                                formatMoney(
                                  item.unitPrice
                                )
                              }

                              {" × "}

                              {
                                item.quantity
                              }

                            </span>


                            <strong>

                              {
                                formatMoney(
                                  item.lineTotal
                                )
                              }

                            </strong>


                          </div>


                        </div>

                      )
                    )
                  }


                </div>


              </div>



              <div className="medicine-order-modal-total">


                <span>
                  Total
                </span>


                <strong>

                  {
                    formatMoney(
                      selectedOrder.totalAmount
                    )
                  }

                </strong>


              </div>


            </div>


          </div>

        )
      }


    </div>

  );

}


export default MedicineOrderFeature;