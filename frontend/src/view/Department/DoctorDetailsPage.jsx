import {
  useEffect,
  useState
} from "react";

import {
  useParams
} from "react-router-dom";

import axios from "axios";

import Nav from "../Components/Nav";
import Footer from "../Components/Footer";

import defaultDoctorProfile
  from "../../assets/doctor-profile.png";

import "../../Style/DepartmentCSS/DoctorDetailsPage.css";

import {
  FaCalendarAlt,
  FaInfoCircle,
  FaBriefcase
} from "react-icons/fa";


const API_URL =
  "http://localhost:5138";


function DoctorDetailsPage() {

  const [
    activeTab,
    setActiveTab
  ] = useState("info");


  const [
    doctor,
    setDoctor
  ] = useState(null);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    error,
    setError
  ] = useState("");


  const {
    doctorSlug
  } = useParams();



  // =====================================================
  // SPECIALTY DISPLAY NAMES
  // =====================================================

  const specialtyNames = {

    "general-physician":
      "General Physician",

    "pediatrics":
      "Pediatrics",

    "gyne-obs":
      "Gyne & Obs",

    "dermatology":
      "Dermatology",

    "internal-medicine":
      "Internal Medicine",

    "cardiology":
      "Cardiology",

    "neurology":
      "Neurology",

    "dentistry":
      "Dentistry",

    "ophthalmology":
      "Ophthalmology",

    "oncology":
      "Oncology",

    "family-medicine":
      "Family Medicine",

    "physical-medicine":
      "Physical Medicine"

  };



  // =====================================================
  // IMAGE
  // =====================================================

  function getProfileImageUrl(
    imagePath
  ) {

    if (!imagePath) {

      return defaultDoctorProfile;

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


    return (
      `${API_URL}/${cleanPath}`
    );

  }



  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(
    value
  ) {

    if (!value) {

      return "Not available";

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
  // CONSULTATION DURATION
  // =====================================================

  function formatMinutes(
    value
  ) {

    if (
      value === null
      ||
      value === undefined
    ) {

      return "Not set";

    }


    return `${value} Minutes`;

  }



  // =====================================================
  // LOAD DOCTOR
  // =====================================================

  useEffect(() => {

    setLoading(true);

    setError("");


    axios
      .get(
        `${API_URL}/api/public-doctors/${doctorSlug}`
      )

      .then((res) => {

        console.log(
          "Doctor Details:",
          res.data
        );


        setDoctor(
          res.data
        );


        document.title =
          `MediGo | ${res.data.fullName}`;

      })

      .catch((err) => {

        console.log(
          "Doctor details error:",
          err
        );


        setDoctor(null);


        setError(
          err.response?.data?.message
          ||
          "Doctor not found."
        );

      })

      .finally(() => {

        setLoading(false);

      });

  }, [
    doctorSlug
  ]);



  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div>

        <Nav />

        <h1 className="doctor-not-found">

          Loading doctor...

        </h1>

        <Footer />

      </div>

    );

  }



  // =====================================================
  // NOT FOUND
  // =====================================================

  if (
    !doctor
    ||
    error
  ) {

    return (

      <div>

        <Nav />

        <h1 className="doctor-not-found">

          {
            error
            ||
            "Doctor not found"
          }

        </h1>

        <Footer />

      </div>

    );

  }



  const specialtyName =
    specialtyNames[
      doctor.specialty
    ]
    ||
    doctor.specialty
    ||
    "Not added";



  // =====================================================
  // JSX
  // =====================================================

  return (

    <div>


      <Nav />



      <section className="doctor-details-page">


        {/* =================================================
            TOP DOCTOR CARD
        ================================================= */}

        <div className="doctor-profile-card">


          <div className="doctor-profile-top">


            {/* =============================================
                LEFT
            ============================================= */}

            <div className="doctor-profile-left">


              <img

                src={
                  getProfileImageUrl(
                    doctor.profileImage
                  )
                }

                alt={
                  doctor.fullName
                }

                onError={(e) => {

                  e.currentTarget.src =
                    defaultDoctorProfile;

                }}

              />



              <div className="doctor-main-info">


                <h1>

                  {
                    doctor.fullName
                  }

                </h1>



                <p>

                  {
                    doctor.qualifications
                    ||
                    "Qualification not added"
                  }

                </p>



                <p>

                  {
                    specialtyName
                  }

                </p>



                <p className="working-text">

                  Working at{" "}

                  <strong>

                    {
                      doctor.workingPlace
                      ||
                      "Not added"
                    }

                  </strong>

                </p>


              </div>


            </div>



            {/* =============================================
                RIGHT
            ============================================= */}

            <div className="doctor-profile-right">


              <h3>
                Consultation Fee
              </h3>



              {
                doctor.consultationFee
                !== null
                &&
                doctor.consultationFee
                !== undefined
                  ? (

                    <h2>

                      ৳ {
                        doctor.consultationFee
                      }

                      <span>
                        (incl. VAT)
                      </span>

                    </h2>

                  )
                  : (

                    <h2>
                      Not set
                    </h2>

                  )
              }



              <button className="appointment-btn">

                <FaCalendarAlt />

                Book Online Appointment

              </button>


            </div>


          </div>



          {/* =================================================
              STATS
          ================================================= */}

          <div className="doctor-stats">


            <div>

              <p>
                Total Experience
              </p>

              <h4>

                {
                  doctor.experienceYears
                  !== null
                  &&
                  doctor.experienceYears
                  !== undefined
                    ? `${doctor.experienceYears}+ Years`
                    : "Not added"
                }

              </h4>

            </div>



            <div>

              <p>
                BMDC Number
              </p>

              <h4>

                {
                  doctor.bmdcNumber
                  ||
                  "Not available"
                }

              </h4>

            </div>



            <div>

              <p>
                Joined MediGo
              </p>

              <h4>

                {
                  formatDate(
                    doctor.joinedAt
                  )
                }

              </h4>

            </div>



            <div>

              <p>
                Patients Attended
              </p>

              <h4>

                {
                  doctor.patientsAttended
                  ?? 0
                }

              </h4>

            </div>


          </div>



          {/* =================================================
              TABS
          ================================================= */}

          <div className="doctor-tabs">


            <span

              onClick={() =>
                setActiveTab(
                  "info"
                )
              }

              className={
                activeTab === "info"
                  ? "active-tab"
                  : ""
              }

            >

              <FaInfoCircle />

              Info

            </span>



            <span

              onClick={() =>
                setActiveTab(
                  "experience"
                )
              }

              className={
                activeTab ===
                "experience"
                  ? "active-tab"
                  : ""
              }

            >

              <FaBriefcase />

              Experience

            </span>


          </div>


        </div>



        {/* =================================================
            LOWER AREA
        ================================================= */}

        <div className="doctor-details-grid">


          {/* =============================================
              ABOUT / EXPERIENCE
          ============================================= */}

          <div className="doctor-about-card">


            {
              activeTab === "info"
              &&
              (

                <>

                  <h2>

                    About {
                      doctor.fullName
                    }

                    {
                      doctor.qualifications
                        ? ` - ${doctor.qualifications}`
                        : ""
                    }

                  </h2>


                  <p>

                    {
                      doctor.bio
                      ||
                      "Doctor has not added a professional bio yet."
                    }

                  </p>


                  {
                    doctor.workingDescription
                    &&
                    (

                      <>

                        <h2>
                          Professional Information
                        </h2>


                        <p>

                          {
                            doctor.workingDescription
                          }

                        </p>

                      </>

                    )
                  }

                </>

              )
            }



            {
              activeTab ===
                "experience"
              &&
              (

                <>

                  <h2>
                    Experience
                  </h2>


                  <p>

                    {
                      doctor.fullName
                    }{" "}

                    has{" "}

                    <strong>

                      {
                        doctor.experienceYears
                        !== null
                        &&
                        doctor.experienceYears
                        !== undefined
                          ? `${doctor.experienceYears}+ years`
                          : "no experience information added"
                      }

                    </strong>{" "}

                    of medical experience.

                  </p>



                  <p>

                    Currently working at{" "}

                    <strong>

                      {
                        doctor.workingPlace
                        ||
                        "Not added"
                      }

                    </strong>.

                  </p>



                  <p>

                    Speciality:{" "}

                    <strong>

                      {
                        specialtyName
                      }

                    </strong>

                  </p>



                  <p>

                    Qualification:{" "}

                    <strong>

                      {
                        doctor.qualifications
                        ||
                        "Not added"
                      }

                    </strong>

                  </p>


                </>

              )
            }


          </div>



          {/* =============================================
              RIGHT SIDE
          ============================================= */}

          <div className="doctor-side-area">


            {/* =========================================
                CONSULTATION TIME
            ========================================= */}

            <div className="availability-card">


              <h2>
                Consultation
              </h2>



              <div className="availability-block">


                <p>
                  Instant Consultation Time
                </p>


                <h4>

                  {
                    formatMinutes(
                      doctor.instantConsultationMinutes
                    )
                  }

                </h4>


              </div>



              <div className="availability-block">


                <p>
                  Appointment Consultation Time
                </p>


                <h4>

                  {
                    formatMinutes(
                      doctor.appointmentConsultationMinutes
                    )
                  }

                </h4>


              </div>


            </div>



            {/* =========================================
                AT A GLANCE
            ========================================= */}

            <div className="glance-card">


              <h2>
                At a Glance
              </h2>



              <div className="glance-grid">


                <div>

                  <p>
                    Consultation Fee
                  </p>


                  <h4>

                    {
                      doctor.consultationFee
                      !== null
                      &&
                      doctor.consultationFee
                      !== undefined
                        ? `৳ ${doctor.consultationFee}`
                        : "Not set"
                    }

                  </h4>

                </div>



                <div>

                  <p>
                    Follow-up fee
                  </p>


                  <h4>

                    {
                      doctor.followUpFee
                      !== null
                      &&
                      doctor.followUpFee
                      !== undefined
                        ? `৳ ${doctor.followUpFee}`
                        : "Not set"
                    }

                  </h4>


                  <small>
                    Follow-up consultation
                  </small>

                </div>



                <div>

                  <p>
                    Patient attended
                  </p>


                  <h4>

                    {
                      doctor.patientsAttended
                      ?? 0
                    }

                  </h4>

                </div>



                <div>

                  <p>
                    Doctor code
                  </p>


                  <h4>

                    {
                      doctor.doctorCode
                      ||
                      "Not available"
                    }

                  </h4>

                </div>


              </div>


            </div>


          </div>


        </div>


      </section>



      <Footer />


    </div>

  );

}


export default DoctorDetailsPage;