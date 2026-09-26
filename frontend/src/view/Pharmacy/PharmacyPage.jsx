import "../../Style/PharmacyCSS/PharmacyPage.css";

import Nav from "../Components/Nav";
import Footer from "../Components/Footer";

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
  FaShoppingCart,
  FaPills,
  FaPrescriptionBottleAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaBoxes,
  FaArrowLeft,
  FaArrowRight
} from "react-icons/fa";

import {
  ToastContainer,
  toast
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";


const API_URL =
  "http://localhost:5138";


function PharmacyPage() {

  const navigate =
    useNavigate();


  // =====================================================
  // MEDICINES
  // =====================================================

  const [
    medicines,
    setMedicines
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);



  // =====================================================
  // PATIENT
  // =====================================================

  const [
    patient,
    setPatient
  ] = useState(null);



  // =====================================================
  // CART
  // =====================================================

  const [
    cartCount,
    setCartCount
  ] = useState(0);


  const [
    addingMedicineId,
    setAddingMedicineId
  ] = useState(null);



  // =====================================================
  // SEARCH
  // =====================================================

  const [
    searchText,
    setSearchText
  ] = useState("");



  // =====================================================
  // FILTERS
  // =====================================================

  const [
    categoryFilter,
    setCategoryFilter
  ] = useState("all");


  const [
    stockFilter,
    setStockFilter
  ] = useState("all");


  const [
    prescriptionFilter,
    setPrescriptionFilter
  ] = useState("all");


  const [
    sortBy,
    setSortBy
  ] = useState("default");



  // =====================================================
  // PAGINATION
  // =====================================================

  const [
    currentPage,
    setCurrentPage
  ] = useState(1);


  const medicinesPerPage =
    20;



  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    document.title =
      "MediGo | Pharmacy";


    const savedPatient =
      localStorage.getItem(
        "patient"
      );


    if (savedPatient) {

      try {

        const parsedPatient =
          JSON.parse(
            savedPatient
          );


        setPatient(
          parsedPatient
        );


        if (
          parsedPatient?.id
        ) {

          loadCartCount(
            parsedPatient.id
          );

        }

      }

      catch (error) {

        console.log(
          "Patient Storage Error:",
          error
        );

      }

    }


    loadMedicines();

  }, []);



  // =====================================================
  // LOAD MEDICINES
  //
  // CORRECT ENDPOINT:
  // GET /api/pharmacy/medicines
  // =====================================================

  async function loadMedicines() {

    setLoading(
      true
    );


    try {

      const response =
        await axios.get(

          `${API_URL}/api/pharmacy/medicines`

        );


      console.log(
        "Pharmacy Medicines:",
        response.data
      );


      setMedicines(

        Array.isArray(
          response.data
        )
          ? response.data
          : []

      );

    }

    catch (error) {

      console.log(
        "Pharmacy Load Error:",
        error
      );


      console.log(
        "Backend:",
        error.response?.data
      );


      setMedicines([]);


      toast.error(

        error.response?.data?.message
        ||
        "Could not load medicines."

      );

    }

    finally {

      setLoading(
        false
      );

    }

  }



  // =====================================================
  // LOAD CART COUNT
  //
  // CORRECT ENDPOINT:
  // GET /api/pharmacy/cart/{patientId}/count
  // =====================================================

  async function loadCartCount(
    patientId
  ) {

    try {

      const response =
        await axios.get(

          `${API_URL}/api/pharmacy/cart/${patientId}/count`

        );


      console.log(
        "Cart Count:",
        response.data
      );


      const count =

        response.data?.count

        ??

        response.data?.cartCount

        ??

        (
          typeof response.data ===
          "number"

            ? response.data

            : 0
        );


      setCartCount(
        Number(
          count
        )
      );

    }

    catch (error) {

      console.log(
        "Cart Count Error:",
        error
      );


      console.log(
        "Backend:",
        error.response?.data
      );


      setCartCount(
        0
      );

    }

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
  // CATEGORY LIST
  // =====================================================

  const categories =
    useMemo(
      () => {

        const values =
          medicines

            .map(
              medicine =>
                medicine.category
            )

            .filter(
              category =>
                category
            );


        return [

          ...new Set(
            values
          )

        ].sort();

      },
      [
        medicines
      ]
    );



  // =====================================================
  // SEARCH + FILTER + SORT
  // =====================================================

  const filteredMedicines =
    useMemo(
      () => {

        const search =
          searchText
            .trim()
            .toLowerCase();


        let result =
          medicines.filter(
            medicine => {

              // =========================================
              // ONLY MEDICINES ENABLED BY ADMIN
              // =========================================

              if (
                medicine.isAvailable ===
                false
              ) {

                return false;

              }



              // =========================================
              // SEARCH
              // =========================================

              const matchesSearch =

                search === ""

                ||

                medicine.name
                  ?.toLowerCase()
                  .includes(
                    search
                  )

                ||

                medicine.genericName
                  ?.toLowerCase()
                  .includes(
                    search
                  )

                ||

                medicine.brandName
                  ?.toLowerCase()
                  .includes(
                    search
                  )

                ||

                medicine.manufacturer
                  ?.toLowerCase()
                  .includes(
                    search
                  )

                ||

                medicine.strength
                  ?.toLowerCase()
                  .includes(
                    search
                  );



              // =========================================
              // CATEGORY
              // =========================================

              const matchesCategory =

                categoryFilter ===
                  "all"

                ||

                medicine.category ===
                  categoryFilter;



              // =========================================
              // STOCK
              // =========================================

              let matchesStock =
                true;


              const stock =
                Number(
                  medicine.stockQuantity
                  ??
                  0
                );


              if (
                stockFilter ===
                  "in-stock"
              ) {

                matchesStock =
                  stock >
                  0;

              }


              else if (
                stockFilter ===
                  "low-stock"
              ) {

                matchesStock =

                  stock >
                  0

                  &&

                  stock <=
                  10;

              }


              else if (
                stockFilter ===
                  "out-of-stock"
              ) {

                matchesStock =
                  stock ===
                  0;

              }



              // =========================================
              // PRESCRIPTION
              // =========================================

              let matchesPrescription =
                true;


              if (
                prescriptionFilter ===
                  "required"
              ) {

                matchesPrescription =
                  medicine.prescriptionRequired ===
                  true;

              }


              else if (
                prescriptionFilter ===
                  "not-required"
              ) {

                matchesPrescription =
                  medicine.prescriptionRequired ===
                  false;

              }



              return (

                matchesSearch

                &&

                matchesCategory

                &&

                matchesStock

                &&

                matchesPrescription

              );

            }
          );



        // =============================================
        // COPY BEFORE SORTING
        // =============================================

        result = [
          ...result
        ];



        // =============================================
        // NAME A-Z
        // =============================================

        if (
          sortBy ===
          "name"
        ) {

          result.sort(
            (
              first,
              second
            ) =>

              (
                first.name
                ||
                ""
              )
              .localeCompare(
                second.name
                ||
                ""
              )
          );

        }



        // =============================================
        // PRICE LOW → HIGH
        // =============================================

        else if (
          sortBy ===
          "price-low"
        ) {

          result.sort(
            (
              first,
              second
            ) =>

              Number(
                first.price
                ??
                0
              )

              -

              Number(
                second.price
                ??
                0
              )
          );

        }



        // =============================================
        // PRICE HIGH → LOW
        // =============================================

        else if (
          sortBy ===
          "price-high"
        ) {

          result.sort(
            (
              first,
              second
            ) =>

              Number(
                second.price
                ??
                0
              )

              -

              Number(
                first.price
                ??
                0
              )
          );

        }



        // =============================================
        // HIGHEST STOCK
        // =============================================

        else if (
          sortBy ===
          "stock-high"
        ) {

          result.sort(
            (
              first,
              second
            ) =>

              Number(
                second.stockQuantity
                ??
                0
              )

              -

              Number(
                first.stockQuantity
                ??
                0
              )
          );

        }



        return result;

      },
      [
        medicines,
        searchText,
        categoryFilter,
        stockFilter,
        prescriptionFilter,
        sortBy
      ]
    );



  // =====================================================
  // RESET PAGE TO 1 WHEN SEARCH/FILTER CHANGES
  // =====================================================

  useEffect(() => {

    setCurrentPage(
      1
    );

  }, [
    searchText,
    categoryFilter,
    stockFilter,
    prescriptionFilter,
    sortBy
  ]);



  // =====================================================
  // PAGINATION CALCULATION
  // =====================================================

  const totalPages =
    Math.ceil(

      filteredMedicines.length
      /
      medicinesPerPage

    );


  const lastIndex =
    currentPage
    *
    medicinesPerPage;


  const firstIndex =
    lastIndex
    -
    medicinesPerPage;


  const currentMedicines =
    filteredMedicines.slice(
      firstIndex,
      lastIndex
    );



  // =====================================================
  // KEEP CURRENT PAGE VALID
  // =====================================================

  useEffect(() => {

    if (
      totalPages >
        0

      &&

      currentPage >
        totalPages
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
  // ADD MEDICINE TO CART
  //
  // CORRECT ENDPOINT:
  // POST /api/pharmacy/cart
  // =====================================================

  async function addToCart(
    medicine
  ) {

    // =============================================
    // LOGIN CHECK
    // =============================================

    if (
      !patient?.id
    ) {

      toast.info(
        "Please login as a patient first."
      );


      setTimeout(
        () => {

          navigate(
            "/patient-login"
          );

        },
        700
      );


      return;

    }



    // =============================================
    // STOCK CHECK
    // =============================================

    if (
      Number(
        medicine.stockQuantity
        ??
        0
      )
      <=
      0
    ) {

      toast.error(
        "This medicine is out of stock."
      );


      return;

    }



    setAddingMedicineId(
      medicine.id
    );


    try {

      const response =
        await axios.post(

          `${API_URL}/api/pharmacy/cart`,

          {
            patientId:
              patient.id,

            medicineId:
              medicine.id,

            quantity:
              1
          }

        );


      toast.success(

        response.data?.message

        ||

        `${medicine.name} added to cart.`

      );



      // =============================================
      // STOCK IS RESERVED WHEN ADDED TO CART
      // SO RELOAD MEDICINES
      // =============================================

      await loadMedicines();



      // =============================================
      // REFRESH CART COUNT
      // =============================================

      await loadCartCount(
        patient.id
      );



      // =============================================
      // OTHER COMPONENTS CAN LISTEN TO THIS
      // =============================================

      window.dispatchEvent(
        new Event(
          "cartUpdated"
        )
      );

    }

    catch (error) {

      console.log(
        "Add Cart Error:",
        error
      );


      console.log(
        "Backend:",
        error.response?.data
      );


      toast.error(

        error.response?.data?.message

        ||

        "Could not add medicine to cart."

      );

    }

    finally {

      setAddingMedicineId(
        null
      );

    }

  }



  // =====================================================
  // CHANGE PAGE
  // =====================================================

  function changePage(
    page
  ) {

    if (
      page <
        1

      ||

      page >
        totalPages
    ) {

      return;

    }


    setCurrentPage(
      page
    );


    setTimeout(
      () => {

        document
          .getElementById(
            "pharmacy-medicine-section"
          )
          ?.scrollIntoView(
            {
              behavior:
                "smooth",

              block:
                "start"
            }
          );

      },
      50
    );

  }



  // =====================================================
  // PAGE NUMBER BUTTONS
  //
  // ONLY MAXIMUM 5 PAGE BUTTONS SHOWN
  // =====================================================

  function getVisiblePages() {

    if (
      totalPages <=
      5
    ) {

      return Array.from(
        {
          length:
            totalPages
        },

        (
          _,
          index
        ) =>
          index + 1
      );

    }


    let start =
      Math.max(
        1,
        currentPage - 2
      );


    let end =
      Math.min(
        totalPages,
        start + 4
      );


    if (
      end - start <
      4
    ) {

      start =
        Math.max(
          1,
          end - 4
        );

    }


    return Array.from(
      {
        length:
          end - start + 1
      },

      (
        _,
        index
      ) =>
        start + index
    );

  }



  // =====================================================
  // STOCK CSS CLASS
  // =====================================================

  function getStockClass(
    stock
  ) {

    const quantity =
      Number(
        stock
        ??
        0
      );


    if (
      quantity ===
      0
    ) {

      return "out";

    }


    if (
      quantity <=
      10
    ) {

      return "low";

    }


    return "good";

  }



  // =====================================================
  // RESET FILTERS
  // =====================================================

  function resetFilters() {

    setSearchText(
      ""
    );


    setCategoryFilter(
      "all"
    );


    setStockFilter(
      "all"
    );


    setPrescriptionFilter(
      "all"
    );


    setSortBy(
      "default"
    );


    setCurrentPage(
      1
    );

  }



  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="pharmacy-page">


      <Nav />



      {/* =================================================
          HERO
      ================================================= */}

      <section className="pharmacy-hero">


        <div className="pharmacy-hero-content">


          <p className="pharmacy-eyebrow">

            MEDIGO PHARMACY

          </p>


          <h1>

            Medicines at your fingertips

          </h1>


          <p>

            Search and order medicines
            easily from MediGo Pharmacy.

          </p>


        </div>



        <button

          type="button"

          className="pharmacy-cart-button"

          onClick={
            () => {

              if (
                patient?.id
              ) {

                navigate(
                  "/patient-account"
                );

              }

              else {

                navigate(
                  "/patient-login"
                );

              }

            }
          }

        >

          <FaShoppingCart />


          My Cart


          {
            cartCount >
              0

            &&

            (

              <span>

                {
                  cartCount
                }

              </span>

            )
          }


        </button>


      </section>



      {/* =================================================
          MAIN
      ================================================= */}

      <main

        className="pharmacy-main"

        id="pharmacy-medicine-section"

      >


        {/* =================================================
            TITLE
        ================================================= */}

        <section className="pharmacy-section-heading">


          <div>


            <p className="pharmacy-section-eyebrow">

              PHARMACY

            </p>


            <h2>

              Available Medicines

            </h2>


            <p>

              Browse medicines available
              from MediGo.

            </p>


          </div>


        </section>



        {/* =================================================
            SEARCH + FILTER
        ================================================= */}

        <section className="pharmacy-toolbar">


          {/* SEARCH */}

          <div className="pharmacy-search-box">


            <FaSearch />


            <input

              type="text"

              placeholder=
                "Search by medicine, generic name, brand..."

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



          {/* FILTERS */}

          <div className="pharmacy-filter-grid">


            {/* CATEGORY */}

            <select

              value={
                categoryFilter
              }

              onChange={
                event =>
                  setCategoryFilter(
                    event.target.value
                  )
              }

            >

              <option value="all">

                All Categories

              </option>


              {
                categories.map(
                  category => (

                    <option

                      key={
                        category
                      }

                      value={
                        category
                      }

                    >

                      {
                        category
                      }

                    </option>

                  )
                )
              }


            </select>



            {/* STOCK */}

            <select

              value={
                stockFilter
              }

              onChange={
                event =>
                  setStockFilter(
                    event.target.value
                  )
              }

            >

              <option value="all">

                All Stock

              </option>


              <option value="in-stock">

                In Stock

              </option>


              <option value="low-stock">

                Low Stock

              </option>


              <option value="out-of-stock">

                Out of Stock

              </option>


            </select>



            {/* PRESCRIPTION */}

            <select

              value={
                prescriptionFilter
              }

              onChange={
                event =>
                  setPrescriptionFilter(
                    event.target.value
                  )
              }

            >

              <option value="all">

                All Prescription Types

              </option>


              <option value="required">

                Prescription Required

              </option>


              <option value="not-required">

                No Prescription Required

              </option>


            </select>



            {/* SORT */}

            <select

              value={
                sortBy
              }

              onChange={
                event =>
                  setSortBy(
                    event.target.value
                  )
              }

            >

              <option value="default">

                Sort By

              </option>


              <option value="name">

                Name A-Z

              </option>


              <option value="price-low">

                Price Low to High

              </option>


              <option value="price-high">

                Price High to Low

              </option>


              <option value="stock-high">

                Highest Stock

              </option>


            </select>


          </div>



          {/* FILTER BOTTOM */}

          <div className="pharmacy-filter-bottom">


            <span>

              {
                filteredMedicines.length
              }

              {" "}medicine

              {
                filteredMedicines.length !==
                  1

                  ? "s"

                  : ""
              }

              {" "}found

            </span>



            <button

              type="button"

              onClick={
                resetFilters
              }

            >

              Reset Filters

            </button>


          </div>


        </section>



        {/* =================================================
            LOADING
        ================================================= */}

        {
          loading

          &&

          (

            <section className="pharmacy-empty-state">


              <div className="pharmacy-loader">
              </div>


              <h3>

                Loading medicines...

              </h3>


            </section>

          )
        }



        {/* =================================================
            NO MEDICINE
        ================================================= */}

        {
          !loading

          &&

          filteredMedicines.length ===
            0

          &&

          (

            <section className="pharmacy-empty-state">


              <FaPills />


              <h3>

                No medicine found

              </h3>


              <p>

                Try changing your search
                or filters.

              </p>


              <button

                type="button"

                onClick={
                  resetFilters
                }

              >

                Reset Filters

              </button>


            </section>

          )
        }



        {/* =================================================
            MEDICINES
            ONLY 20 MEDICINES CURRENT PAGE
        ================================================= */}

        {
          !loading

          &&

          currentMedicines.length >
            0

          &&

          (

            <section className="pharmacy-medicine-grid">


              {
                currentMedicines.map(
                  medicine => {

                    const stock =
                      Number(
                        medicine.stockQuantity
                        ??
                        0
                      );


                    const outOfStock =
                      stock <=
                      0;


                    return (

                      <article

                        className="pharmacy-medicine-card"

                        key={
                          medicine.id
                        }

                      >


                        {/* =================================
                            IMAGE
                        ================================= */}

                        <div className="pharmacy-medicine-image">


                          {
                            medicine.image

                              ? (

                                <img

                                  src={
                                    getImageUrl(
                                      medicine.image
                                    )
                                  }

                                  alt={
                                    medicine.name
                                  }

                                  onError={
                                    event => {

                                      event.currentTarget.style.display =
                                        "none";

                                    }
                                  }

                                />

                              )

                              : (

                                <FaPills />

                              )
                          }



                          {
                            medicine.prescriptionRequired

                            &&

                            (

                              <span className="pharmacy-prescription-top-badge">

                                Rx

                              </span>

                            )
                          }


                        </div>



                        {/* =================================
                            BODY
                        ================================= */}

                        <div className="pharmacy-medicine-body">


                          <div className="pharmacy-medicine-top">


                            <span className="pharmacy-category">

                              {
                                medicine.category
                                ||
                                "Medicine"
                              }

                            </span>



                            <span

                              className={
                                `pharmacy-stock-badge ${getStockClass(
                                  stock
                                )}`
                              }

                            >

                              <FaBoxes />


                              {
                                stock
                              }

                            </span>


                          </div>



                          {/* MEDICINE NAME */}

                          <h3>

                            {
                              medicine.name
                            }


                            {
                              medicine.strength

                              &&

                              (

                                <>

                                  {" "}

                                  {
                                    medicine.strength
                                  }

                                </>

                              )
                            }

                          </h3>



                          {/* GENERIC */}

                          <p className="pharmacy-generic-name">

                            {
                              medicine.genericName
                              ||
                              "Generic name not available"
                            }

                          </p>



                          {/* BRAND */}

                          {
                            medicine.brandName

                            &&

                            (

                              <p className="pharmacy-brand-name">

                                Brand:{" "}

                                <strong>

                                  {
                                    medicine.brandName
                                  }

                                </strong>

                              </p>

                            )
                          }



                          {/* FORM + PACK */}

                          <div className="pharmacy-medicine-meta">


                            <span>

                              {
                                medicine.dosageForm
                                ||
                                "Medicine"
                              }

                            </span>



                            {
                              medicine.packSize

                              &&

                              (

                                <span>

                                  {
                                    medicine.packSize
                                  }

                                </span>

                              )
                            }


                          </div>



                          {/* DESCRIPTION */}

                          {
                            medicine.description

                            &&

                            (

                              <p className="pharmacy-description">

                                {
                                  medicine.description.length >
                                    100

                                    ? `${medicine.description.substring(
                                        0,
                                        100
                                      )}...`

                                    : medicine.description
                                }

                              </p>

                            )
                          }



                          {/* =================================
                              PRESCRIPTION
                          ================================= */}

                          <div

                            className={
                              medicine.prescriptionRequired

                                ? "pharmacy-prescription-info required"

                                : "pharmacy-prescription-info normal"
                            }

                          >


                            {
                              medicine.prescriptionRequired

                                ? (

                                  <>

                                    <FaPrescriptionBottleAlt />

                                    Prescription Required

                                  </>

                                )

                                : (

                                  <>

                                    <FaCheckCircle />

                                    No Prescription Required

                                  </>

                                )
                            }


                          </div>



                          {/* =================================
                              PRICE
                          ================================= */}

                          <div className="pharmacy-price-row">


                            <div>


                              <small>

                                Price

                              </small>


                              <strong>

                                ৳

                                {
                                  Number(
                                    medicine.price
                                    ??
                                    0
                                  )
                                  .toFixed(
                                    2
                                  )
                                }

                              </strong>


                            </div>



                            {
                              outOfStock

                                ? (

                                  <span className="pharmacy-out-stock">

                                    <FaTimesCircle />

                                    Out of Stock

                                  </span>

                                )

                                : (

                                  <span className="pharmacy-in-stock">

                                    <FaCheckCircle />

                                    In Stock

                                  </span>

                                )
                            }


                          </div>



                          {/* =================================
                              ADD TO CART
                          ================================= */}

                          <button

                            type="button"

                            className="pharmacy-add-cart-btn"

                            disabled={
                              outOfStock

                              ||

                              addingMedicineId ===
                                medicine.id
                            }

                            onClick={
                              () =>
                                addToCart(
                                  medicine
                                )
                            }

                          >

                            <FaShoppingCart />


                            {
                              addingMedicineId ===
                                medicine.id

                                ? "Adding..."

                                : outOfStock

                                  ? "Out of Stock"

                                  : "Add to Cart"
                            }


                          </button>


                        </div>


                      </article>

                    );

                  }
                )
              }


            </section>

          )
        }



        {/* =================================================
            PAGINATION
        ================================================= */}

        {
          !loading

          &&

          filteredMedicines.length >
            0

          &&

          (

            <section className="pharmacy-pagination-area">


              {/* SHOWING TEXT */}

              <p>

                Showing{" "}

                <strong>

                  {
                    firstIndex + 1
                  }

                </strong>

                {" "}to{" "}

                <strong>

                  {
                    Math.min(
                      lastIndex,
                      filteredMedicines.length
                    )
                  }

                </strong>

                {" "}of{" "}

                <strong>

                  {
                    filteredMedicines.length
                  }

                </strong>

                {" "}medicines

              </p>



              {/* PAGE BUTTONS */}

              <div className="pharmacy-pagination">


                {/* PREVIOUS */}

                <button

                  type="button"

                  className="pharmacy-page-arrow"

                  disabled={
                    currentPage ===
                      1
                  }

                  onClick={
                    () =>
                      changePage(
                        currentPage -
                          1
                      )
                  }

                  title="Previous Page"

                >

                  <FaArrowLeft />

                </button>



                {/* PAGE NUMBERS */}

                {
                  getVisiblePages()
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
                              changePage(
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

                  className="pharmacy-page-arrow"

                  disabled={
                    currentPage ===
                      totalPages

                    ||

                    totalPages ===
                      0
                  }

                  onClick={
                    () =>
                      changePage(
                        currentPage +
                          1
                      )
                  }

                  title="Next Page"

                >

                  <FaArrowRight />

                </button>


              </div>


            </section>

          )
        }


      </main>



      <Footer />



      <ToastContainer

        position="bottom-right"

        autoClose={1800}

      />


    </div>

  );

}


export default PharmacyPage;