import "../../Style/AdminCSS/AdminMedicine.css";

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
  FaPills,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaTimes,
  FaImage,
  FaBoxes,
  FaPrescriptionBottleAlt,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";


const API_URL =
  "http://localhost:5138";


const categoryOptions = [
  "Pain & Fever",
  "Cold & Flu",
  "Allergy",
  "Digestive Health",
  "Diabetes",
  "Heart & Blood Pressure",
  "Vitamins & Supplements",
  "Skin Care",
  "Eye Care",
  "First Aid"
];


const dosageFormOptions = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Suspension",
  "Injection",
  "Cream",
  "Ointment",
  "Drops",
  "Inhaler",
  "Powder",
  "Gel"
];


const emptyForm = {
  name: "",
  genericName: "",
  brandName: "",
  manufacturer: "",
  category: "",
  strength: "",
  dosageForm: "",
  packSize: "",
  price: "",
  stockQuantity: "",
  prescriptionRequired: false,
  description: "",
  isAvailable: true
};


function AdminMedicine() {

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
  // SEARCH / FILTERS
  // =====================================================

  const [
    searchText,
    setSearchText
  ] = useState("");


  const [
    categoryFilter,
    setCategoryFilter
  ] = useState("all");


  const [
    statusFilter,
    setStatusFilter
  ] = useState("all");


  const [
    prescriptionFilter,
    setPrescriptionFilter
  ] = useState("all");


  // =====================================================
  // PAGINATION
  // =====================================================

  const [
    currentPage,
    setCurrentPage
  ] = useState(1);


  const medicinesPerPage =
    10;


  // =====================================================
  // FORM
  // =====================================================

  const [
    form,
    setForm
  ] = useState(
    emptyForm
  );


  const [
    selectedImage,
    setSelectedImage
  ] = useState(null);


  const [
    imagePreview,
    setImagePreview
  ] = useState("");


  const [
    showModal,
    setShowModal
  ] = useState(false);


  const [
    editingMedicine,
    setEditingMedicine
  ] = useState(null);


  const [
    saving,
    setSaving
  ] = useState(false);



  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    document.title =
      "MediGo | Medicine Management";


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


    loadMedicines();

  }, [
    navigate
  ]);



  // =====================================================
  // RESET PAGE WHEN FILTER CHANGES
  // =====================================================

  useEffect(() => {

    setCurrentPage(1);

  }, [
    searchText,
    categoryFilter,
    statusFilter,
    prescriptionFilter
  ]);



  // =====================================================
  // LOAD MEDICINES
  // =====================================================

  async function loadMedicines() {

    setLoading(true);


    try {

      const response =
        await axios.get(

          `${API_URL}/api/admin/medicines`

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
        "Medicine Load Error:",
        error
      );


      toast.error(

        error.response?.data?.message
        ||
        "Could not load medicines."

      );

    }

    finally {

      setLoading(false);

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
      imagePath.startsWith("http://")
      ||
      imagePath.startsWith("https://")
      ||
      imagePath.startsWith("data:")
      ||
      imagePath.startsWith("blob:")
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
  // FILTER MEDICINES
  // =====================================================

  const filteredMedicines =
    useMemo(
      () => {

        const search =
          searchText
            .trim()
            .toLowerCase();


        return medicines.filter(
          medicine => {

            const matchesSearch =

              search === ""

              ||

              medicine.name
                ?.toLowerCase()
                .includes(search)

              ||

              medicine.genericName
                ?.toLowerCase()
                .includes(search)

              ||

              medicine.brandName
                ?.toLowerCase()
                .includes(search)

              ||

              medicine.manufacturer
                ?.toLowerCase()
                .includes(search);



            const matchesCategory =

              categoryFilter === "all"

              ||

              medicine.category ===
                categoryFilter;



            let matchesStatus =
              true;


            if (
              statusFilter ===
              "available"
            ) {

              matchesStatus =
                medicine.isAvailable ===
                true;

            }

            else if (
              statusFilter ===
              "unavailable"
            ) {

              matchesStatus =
                medicine.isAvailable ===
                false;

            }

            else if (
              statusFilter ===
              "low-stock"
            ) {

              matchesStatus =

                medicine.stockQuantity > 0

                &&

                medicine.stockQuantity <= 10;

            }

            else if (
              statusFilter ===
              "out-of-stock"
            ) {

              matchesStatus =
                medicine.stockQuantity ===
                0;

            }



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
              matchesStatus
              &&
              matchesPrescription

            );

          }
        );

      },
      [
        medicines,
        searchText,
        categoryFilter,
        statusFilter,
        prescriptionFilter
      ]
    );



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
  // KEEP PAGE VALID
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
  // STATS
  // =====================================================

  const availableCount =
    medicines.filter(
      medicine =>

        medicine.isAvailable
        &&
        medicine.stockQuantity > 0

    ).length;


  const lowStockCount =
    medicines.filter(
      medicine =>

        medicine.stockQuantity > 0
        &&
        medicine.stockQuantity <= 10

    ).length;


  const prescriptionCount =
    medicines.filter(
      medicine =>
        medicine.prescriptionRequired
    ).length;



  // =====================================================
  // ADD MODAL
  // =====================================================

  function openAddModal() {

    setEditingMedicine(null);

    setForm(
      emptyForm
    );

    setSelectedImage(null);

    setImagePreview("");

    setShowModal(true);

  }



  // =====================================================
  // EDIT MODAL
  // =====================================================

  function openEditModal(
    medicine
  ) {

    setEditingMedicine(
      medicine
    );


    setForm({

      name:
        medicine.name || "",

      genericName:
        medicine.genericName || "",

      brandName:
        medicine.brandName || "",

      manufacturer:
        medicine.manufacturer || "",

      category:
        medicine.category || "",

      strength:
        medicine.strength || "",

      dosageForm:
        medicine.dosageForm || "",

      packSize:
        medicine.packSize || "",

      price:
        medicine.price ?? "",

      stockQuantity:
        medicine.stockQuantity ?? "",

      prescriptionRequired:
        medicine.prescriptionRequired
        ||
        false,

      description:
        medicine.description || "",

      isAvailable:
        medicine.isAvailable

    });


    setSelectedImage(null);


    setImagePreview(

      getImageUrl(
        medicine.image
      )

    );


    setShowModal(true);

  }



  function closeModal() {

    if (saving) {

      return;

    }


    setShowModal(false);

    setEditingMedicine(null);

    setSelectedImage(null);

    setImagePreview("");

  }



  // =====================================================
  // INPUT
  // =====================================================

  function handleInputChange(
    event
  ) {

    const {
      name,
      value,
      type,
      checked
    } = event.target;


    setForm(
      previous => ({
        ...previous,

        [name]:
          type === "checkbox"
            ? checked
            : value
      })
    );

  }



  // =====================================================
  // IMAGE
  // =====================================================

  function handleImageChange(
    event
  ) {

    const file =
      event.target.files?.[0];


    if (!file) {

      return;

    }


    const allowedTypes = [
      "image/jpeg",
      "image/png"
    ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      toast.error(
        "Only JPG, JPEG and PNG images are allowed."
      );

      event.target.value =
        "";

      return;
    }


    if (
      file.size >
      5 * 1024 * 1024
    ) {

      toast.error(
        "Image must be smaller than 5 MB."
      );

      event.target.value =
        "";

      return;
    }


    setSelectedImage(
      file
    );


    const reader =
      new FileReader();


    reader.onload = () => {

      setImagePreview(
        reader.result
      );

    };


    reader.readAsDataURL(
      file
    );

  }



  // =====================================================
  // VALIDATION
  // =====================================================

  function validateForm() {

    if (
      !form.name.trim()
    ) {

      toast.error(
        "Medicine name is required."
      );

      return false;

    }


    if (
      !form.genericName.trim()
    ) {

      toast.error(
        "Generic name is required."
      );

      return false;

    }


    if (
      !form.manufacturer.trim()
    ) {

      toast.error(
        "Manufacturer is required."
      );

      return false;

    }


    if (
      !form.category
    ) {

      toast.error(
        "Please select a category."
      );

      return false;

    }


    if (
      !form.strength.trim()
    ) {

      toast.error(
        "Strength is required."
      );

      return false;

    }


    if (
      !form.dosageForm
    ) {

      toast.error(
        "Please select a dosage form."
      );

      return false;

    }


    if (
      form.price === ""
      ||
      Number(
        form.price
      ) < 0
    ) {

      toast.error(
        "Please enter a valid price."
      );

      return false;

    }


    if (
      form.stockQuantity === ""
      ||
      Number(
        form.stockQuantity
      ) < 0
    ) {

      toast.error(
        "Please enter a valid stock quantity."
      );

      return false;

    }


    return true;

  }



  // =====================================================
  // SAVE MEDICINE
  // =====================================================

  async function handleSubmit(
    event
  ) {

    event.preventDefault();


    if (
      !validateForm()
    ) {

      return;

    }


    const data =
      new FormData();


    data.append(
      "Name",
      form.name.trim()
    );


    data.append(
      "GenericName",
      form.genericName.trim()
    );


    data.append(
      "BrandName",
      form.brandName.trim()
    );


    data.append(
      "Manufacturer",
      form.manufacturer.trim()
    );


    data.append(
      "Category",
      form.category
    );


    data.append(
      "Strength",
      form.strength.trim()
    );


    data.append(
      "DosageForm",
      form.dosageForm
    );


    data.append(
      "PackSize",
      form.packSize.trim()
    );


    data.append(
      "Price",
      form.price
    );


    data.append(
      "StockQuantity",
      form.stockQuantity
    );


    data.append(
      "PrescriptionRequired",
      form.prescriptionRequired
    );


    data.append(
      "Description",
      form.description.trim()
    );


    data.append(
      "IsAvailable",
      form.isAvailable
    );


    if (
      selectedImage
    ) {

      data.append(
        "Image",
        selectedImage
      );

    }


    setSaving(true);


    try {

      if (
        editingMedicine
      ) {

        const response =
          await axios.put(

            `${API_URL}/api/admin/medicines/${editingMedicine.id}`,

            data

          );


        toast.success(

          response.data?.message
          ||
          "Medicine updated successfully!"

        );

      }

      else {

        const response =
          await axios.post(

            `${API_URL}/api/admin/medicines`,

            data

          );


        toast.success(

          response.data?.message
          ||
          "Medicine added successfully!"

        );

      }


      setShowModal(false);

      setEditingMedicine(null);

      setSelectedImage(null);

      setImagePreview("");

      await loadMedicines();

    }

    catch (error) {

      console.log(
        "Medicine Save Error:",
        error
      );


      toast.error(

        error.response?.data?.message
        ||
        "Could not save medicine."

      );

    }

    finally {

      setSaving(false);

    }

  }



  // =====================================================
  // DELETE
  // =====================================================

  async function deleteMedicine(
    medicine
  ) {

    const confirmed =
      window.confirm(

        `Delete "${medicine.name} ${medicine.strength}" permanently?`

      );


    if (!confirmed) {

      return;

    }


    try {

      const response =
        await axios.delete(

          `${API_URL}/api/admin/medicines/${medicine.id}`

        );


      toast.success(

        response.data?.message
        ||
        "Medicine deleted successfully!"

      );


      setMedicines(
        previous =>
          previous.filter(
            current =>
              current.id !==
              medicine.id
          )
      );

    }

    catch (error) {

      console.log(
        "Medicine Delete Error:",
        error
      );


      toast.error(

        error.response?.data?.message
        ||
        "Could not delete medicine."

      );

    }

  }



  // =====================================================
  // STOCK CLASS
  // =====================================================

  function getStockClass(
    quantity
  ) {

    if (
      quantity === 0
    ) {

      return "out";

    }


    if (
      quantity <= 10
    ) {

      return "low";

    }


    return "good";

  }



  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="admin-medicine-layout">


      <AdminSidebar />


      <main className="admin-medicine-main">


        {/* =================================================
            HEADER
        ================================================= */}

        <section className="medicine-page-header">


          <div>


            <p className="medicine-eyebrow">

              PHARMACY MANAGEMENT

            </p>


            <h1>
              Medicine Management
            </h1>


            <p className="medicine-page-subtitle">

              Add, update, manage stock and
              control medicine availability.

            </p>


          </div>



          <button

            type="button"

            className="medicine-add-btn"

            onClick={
              openAddModal
            }

          >

            <FaPlus />

            Add Medicine

          </button>


        </section>



        {/* =================================================
            STATS
        ================================================= */}

        <section className="medicine-stats">


          <div className="medicine-stat-card">


            <span className="medicine-stat-icon total">

              <FaPills />

            </span>


            <div>

              <p>
                Total Medicines
              </p>

              <h3>
                {medicines.length}
              </h3>

            </div>


          </div>



          <div className="medicine-stat-card">


            <span className="medicine-stat-icon available">

              <FaCheckCircle />

            </span>


            <div>

              <p>
                Available
              </p>

              <h3>
                {availableCount}
              </h3>

            </div>


          </div>



          <div className="medicine-stat-card">


            <span className="medicine-stat-icon low">

              <FaExclamationTriangle />

            </span>


            <div>

              <p>
                Low Stock
              </p>

              <h3>
                {lowStockCount}
              </h3>

            </div>


          </div>



          <div className="medicine-stat-card">


            <span className="medicine-stat-icon prescription">

              <FaPrescriptionBottleAlt />

            </span>


            <div>

              <p>
                Prescription Required
              </p>

              <h3>
                {prescriptionCount}
              </h3>

            </div>


          </div>


        </section>



        {/* =================================================
            TABLE
        ================================================= */}

        <section className="medicine-list-card">


          {/* SEARCH */}

          <div className="medicine-list-header">


            <div>


              <h2>
                Medicine List
              </h2>


              <p>

                Showing medicines stored
                in the MediGo pharmacy.

              </p>


            </div>



            <div className="medicine-search-box">


              <FaSearch />


              <input

                type="text"

                placeholder=
                  "Search medicine..."

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



          {/* FILTERS */}

          <div className="medicine-filter-row">


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
                categoryOptions.map(
                  category => (

                    <option
                      key={category}
                      value={category}
                    >

                      {category}

                    </option>

                  )
                )
              }

            </select>



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
                All Status
              </option>

              <option value="available">
                Available
              </option>

              <option value="unavailable">
                Unavailable
              </option>

              <option value="low-stock">
                Low Stock
              </option>

              <option value="out-of-stock">
                Out of Stock
              </option>

            </select>



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


          </div>



          <div className="medicine-table-wrapper">


            <table className="medicine-admin-table">


              <thead>

                <tr>

                  <th>
                    Medicine
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Form
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Stock
                  </th>

                  <th>
                    Prescription
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
                  currentMedicines.map(
                    medicine => (

                      <tr
                        key={
                          medicine.id
                        }
                      >


                        <td>


                          <div className="medicine-product-cell">


                            <div className="medicine-table-image">


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

                                    />

                                  )

                                  : (

                                    <FaPills />

                                  )
                              }


                            </div>



                            <div>


                              <strong>

                                {medicine.name}

                                {" "}

                                {medicine.strength}

                              </strong>


                              <span>

                                {
                                  medicine.genericName
                                }

                              </span>


                              <small>

                                {
                                  medicine.manufacturer
                                }

                              </small>


                            </div>


                          </div>


                        </td>



                        <td>
                          {medicine.category}
                        </td>



                        <td>
                          {medicine.dosageForm}
                        </td>



                        <td>


                          <strong className="medicine-price">

                            ৳

                            {
                              Number(
                                medicine.price
                              )
                              .toFixed(2)
                            }

                          </strong>


                        </td>



                        <td>


                          <span

                            className={
                              `medicine-stock ${getStockClass(
                                medicine.stockQuantity
                              )}`
                            }

                          >

                            <FaBoxes />

                            {
                              medicine.stockQuantity
                            }

                          </span>


                        </td>



                        <td>


                          <span

                            className={
                              medicine.prescriptionRequired
                                ? "prescription-badge required"
                                : "prescription-badge normal"
                            }

                          >

                            {
                              medicine.prescriptionRequired
                                ? "Required"
                                : "Not Required"
                            }

                          </span>


                        </td>



                        <td>


                          <span

                            className={
                              medicine.isAvailable
                                ? "medicine-status active"
                                : "medicine-status inactive"
                            }

                          >

                            {
                              medicine.isAvailable
                                ? "Available"
                                : "Disabled"
                            }

                          </span>


                        </td>



                        <td>


                          <div className="medicine-action-group">


                            <button

                              type="button"

                              className="medicine-edit-btn"

                              title="Edit Medicine"

                              onClick={
                                () =>
                                  openEditModal(
                                    medicine
                                  )
                              }

                            >

                              <FaEdit />

                            </button>



                            <button

                              type="button"

                              className="medicine-delete-btn"

                              title="Delete Medicine"

                              onClick={
                                () =>
                                  deleteMedicine(
                                    medicine
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



            {
              loading
              &&

              (

                <div className="medicine-empty-state">


                  <div className="medicine-loader">
                  </div>


                  <h3>
                    Loading medicines...
                  </h3>


                </div>

              )
            }



            {
              !loading
              &&
              filteredMedicines.length === 0
              &&

              (

                <div className="medicine-empty-state">


                  <FaPills />


                  <h3>
                    No medicine found
                  </h3>


                  <p>

                    Add a medicine or change
                    your search and filters.

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
            filteredMedicines.length > 0
            &&

            (

              <div className="medicine-table-footer">


                <p>

                  Showing{" "}

                  {
                    firstIndex + 1
                  }

                  {" "}to{" "}

                  {
                    Math.min(
                      lastIndex,
                      filteredMedicines.length
                    )
                  }

                  {" "}of{" "}

                  {
                    filteredMedicines.length
                  }

                  {" "}entries

                </p>



                <div className="medicine-pagination">


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

                          {page}

                        </button>

                      )
                    )
                  }



                  <button

                    type="button"

                    disabled={
                      currentPage === totalPages
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
          ADD / EDIT MODAL
      ================================================= */}

      {
        showModal
        &&

        (

          <div

            className="medicine-modal-overlay"

            onMouseDown={
              closeModal
            }

          >


            <div

              className="medicine-modal"

              onMouseDown={
                event =>
                  event.stopPropagation()
              }

            >


              <div className="medicine-modal-header">


                <div>


                  <p>
                    PHARMACY
                  </p>


                  <h2>

                    {
                      editingMedicine
                        ? "Update Medicine"
                        : "Add New Medicine"
                    }

                  </h2>


                </div>



                <button

                  type="button"

                  className="medicine-modal-close"

                  onClick={
                    closeModal
                  }

                >

                  <FaTimes />

                </button>


              </div>



              <form
                onSubmit={
                  handleSubmit
                }
              >


                <div className="medicine-form-body">


                  {/* IMAGE */}

                  <div className="medicine-image-section">


                    <div className="medicine-image-preview">


                      {
                        imagePreview

                          ? (

                            <img

                              src={
                                imagePreview
                              }

                              alt="Medicine Preview"

                            />

                          )

                          : (

                            <FaImage />

                          )
                      }


                    </div>



                    <div>


                      <label className="medicine-image-upload">


                        <FaImage />


                        {
                          imagePreview
                            ? "Change Image"
                            : "Select Image"
                        }


                        <input

                          type="file"

                          accept=".jpg,.jpeg,.png,image/jpeg,image/png"

                          onChange={
                            handleImageChange
                          }

                        />


                      </label>


                      <p>

                        JPG, JPEG or PNG.
                        Maximum size 5 MB.

                      </p>


                    </div>


                  </div>



                  <div className="medicine-form-grid">


                    <div className="medicine-form-group">

                      <label>
                        Medicine Name *
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Napa"
                      />

                    </div>



                    <div className="medicine-form-group">

                      <label>
                        Generic Name *
                      </label>

                      <input
                        type="text"
                        name="genericName"
                        value={form.genericName}
                        onChange={handleInputChange}
                        placeholder="e.g. Paracetamol"
                      />

                    </div>



                    <div className="medicine-form-group">

                      <label>
                        Brand Name
                      </label>

                      <input
                        type="text"
                        name="brandName"
                        value={form.brandName}
                        onChange={handleInputChange}
                      />

                    </div>



                    <div className="medicine-form-group">

                      <label>
                        Manufacturer *
                      </label>

                      <input
                        type="text"
                        name="manufacturer"
                        value={form.manufacturer}
                        onChange={handleInputChange}
                      />

                    </div>



                    <div className="medicine-form-group">

                      <label>
                        Category *
                      </label>

                      <select
                        name="category"
                        value={form.category}
                        onChange={handleInputChange}
                      >

                        <option value="">
                          Select category
                        </option>

                        {
                          categoryOptions.map(
                            category => (

                              <option
                                key={category}
                                value={category}
                              >

                                {category}

                              </option>

                            )
                          )
                        }

                      </select>

                    </div>



                    <div className="medicine-form-group">

                      <label>
                        Strength *
                      </label>

                      <input
                        type="text"
                        name="strength"
                        value={form.strength}
                        onChange={handleInputChange}
                        placeholder="e.g. 500 mg"
                      />

                    </div>



                    <div className="medicine-form-group">

                      <label>
                        Dosage Form *
                      </label>

                      <select
                        name="dosageForm"
                        value={form.dosageForm}
                        onChange={handleInputChange}
                      >

                        <option value="">
                          Select dosage form
                        </option>

                        {
                          dosageFormOptions.map(
                            item => (

                              <option
                                key={item}
                                value={item}
                              >

                                {item}

                              </option>

                            )
                          )
                        }

                      </select>

                    </div>



                    <div className="medicine-form-group">

                      <label>
                        Pack Size
                      </label>

                      <input
                        type="text"
                        name="packSize"
                        value={form.packSize}
                        onChange={handleInputChange}
                        placeholder="e.g. 10 tablets"
                      />

                    </div>



                    <div className="medicine-form-group">

                      <label>
                        Price (৳) *
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="price"
                        value={form.price}
                        onChange={handleInputChange}
                      />

                    </div>



                    <div className="medicine-form-group">

                      <label>
                        Stock Quantity *
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="1"
                        name="stockQuantity"
                        value={form.stockQuantity}
                        onChange={handleInputChange}
                      />

                    </div>



                    <div className="medicine-form-group full-width">

                      <label>
                        Description
                      </label>

                      <textarea
                        name="description"
                        maxLength={1000}
                        value={form.description}
                        onChange={handleInputChange}
                        placeholder="Short medicine description..."
                      >
                      </textarea>

                    </div>


                  </div>



                  <div className="medicine-switch-area">


                    <label className="medicine-check-card">

                      <input
                        type="checkbox"
                        name="prescriptionRequired"
                        checked={form.prescriptionRequired}
                        onChange={handleInputChange}
                      />

                      <span className="medicine-checkbox">
                      </span>

                      <div>

                        <strong>
                          Prescription Required
                        </strong>

                        <p>
                          Patient must provide a prescription before buying.
                        </p>

                      </div>

                    </label>



                    <label className="medicine-check-card">

                      <input
                        type="checkbox"
                        name="isAvailable"
                        checked={form.isAvailable}
                        onChange={handleInputChange}
                      />

                      <span className="medicine-checkbox">
                      </span>

                      <div>

                        <strong>
                          Available for Sale
                        </strong>

                        <p>
                          Show this medicine in the patient pharmacy.
                        </p>

                      </div>

                    </label>


                  </div>


                </div>



                <div className="medicine-modal-footer">


                  <button

                    type="button"

                    className="medicine-cancel-btn"

                    onClick={
                      closeModal
                    }

                    disabled={
                      saving
                    }

                  >

                    Cancel

                  </button>



                  <button

                    type="submit"

                    className="medicine-save-btn"

                    disabled={
                      saving
                    }

                  >

                    {
                      saving
                        ? "Saving..."
                        : editingMedicine
                          ? "Update Medicine"
                          : "Add Medicine"
                    }

                  </button>


                </div>


              </form>


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


export default AdminMedicine;