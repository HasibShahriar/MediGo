import Nav from "../Components/Nav";
import Footer from "../Components/Footer";

import "../../Style/DepartmentCSS/AllDeptCSSPage.css";

import {
  NavLink,
  useParams
} from "react-router-dom";

import {
  useEffect,
  useState
} from "react";

import axios from "axios";

import {
  FaArrowRight
} from "react-icons/fa";

import defaultDoctorProfile
  from "../../assets/doctor-profile.png";


const API_URL =
  "http://localhost:5138";



function Dept() {

  const {
    speciality
  } = useParams();


  const [
    doctors,
    setDoctors
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
    sortBy,
    setSortBy
  ] = useState("relevance");


  const [
    maxFee,
    setMaxFee
  ] = useState(8000);



  // =====================================================
  // SPECIALTY NAMES
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



  const departmentName =
    specialtyNames[speciality]
    ||
    speciality;



  // =====================================================
  // IMAGE URL
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
  // LOAD DOCTORS
  // =====================================================

  useEffect(() => {

    document.title =
      `MediGo | ${departmentName}`;


    setLoading(true);

    setError("");


    axios
      .get(
        `${API_URL}/api/public-doctors/speciality/${encodeURIComponent(
          speciality
        )}`
      )

      .then((res) => {

        console.log(
          "Department Doctors:",
          res.data
        );


        setDoctors(
          res.data
        );

      })

      .catch((err) => {

        console.log(
          "Doctor load error:",
          err
        );


        setDoctors([]);


        setError(
          err.response?.data?.message
          ||
          "Could not load doctors."
        );

      })

      .finally(() => {

        setLoading(false);

      });

  }, [
    speciality,
    departmentName
  ]);



  // =====================================================
  // FEE FILTER
  // =====================================================

  const filteredDoctors =
    doctors.filter(
      (doctor) => {

        if (
          doctor.consultationFee === null
          ||
          doctor.consultationFee === undefined
        ) {

          return true;

        }


        return (
          Number(
            doctor.consultationFee
          )
          <=
          maxFee
        );

      }
    );



  // =====================================================
  // SORT
  // =====================================================

  const sortedDoctors =
    [...filteredDoctors]
      .sort(
        (a, b) => {

          // =========================================
          // LOW FEE
          // =========================================

          if (
            sortBy === "low-fee"
          ) {

            const feeA =
              a.consultationFee
              ?? Number.MAX_VALUE;


            const feeB =
              b.consultationFee
              ?? Number.MAX_VALUE;


            return feeA - feeB;

          }



          // =========================================
          // HIGH FEE
          // =========================================

          if (
            sortBy === "high-fee"
          ) {

            const feeA =
              a.consultationFee
              ?? -1;


            const feeB =
              b.consultationFee
              ?? -1;


            return feeB - feeA;

          }



          // =========================================
          // EXPERIENCE
          // =========================================

          if (
            sortBy === "experience"
          ) {

            return (
              (b.experienceYears ?? 0)
              -
              (a.experienceYears ?? 0)
            );

          }



          // Relevance/default

          return a.id - b.id;

        }
      );



  // =====================================================
  // RESET
  // =====================================================

  function resetFilters() {

    setSortBy(
      "relevance"
    );


    setMaxFee(
      8000
    );

  }



  // =====================================================
  // JSX
  // =====================================================

  return (

    <div>


      <Nav />



      <section className="dept-page">


        {/* =================================================
            FILTER SIDEBAR
        ================================================= */}

        <aside className="filter-sidebar">


          <div className="filter-top">


            <h3>
              Filters
            </h3>


            <button
              onClick={
                resetFilters
              }
            >

              Reset

            </button>


          </div>



          {/* =============================================
              CONSULTATION FEE
          ============================================= */}

          <div className="filter-box">


            <h4>
              Consultation Fee
            </h4>


            <input

              type="range"

              min="0"

              max="8000"

              step="100"

              value={
                maxFee
              }

              onChange={(e) =>
                setMaxFee(
                  Number(
                    e.target.value
                  )
                )
              }

              className="fee-slider"

            />


            <div className="fee-values">

              <p>
                Up to ৳ {maxFee}
              </p>

            </div>


          </div>



          {/* =============================================
              SORT
          ============================================= */}

          <div className="filter-box">


            <h4>
              Sort By
            </h4>



            <label>

              <input
                type="radio"
                name="sort"
                checked={
                  sortBy ===
                  "relevance"
                }
                onChange={() =>
                  setSortBy(
                    "relevance"
                  )
                }
              />

              Relevance (Default)

            </label>



            <label>

              <input
                type="radio"
                name="sort"
                checked={
                  sortBy ===
                  "low-fee"
                }
                onChange={() =>
                  setSortBy(
                    "low-fee"
                  )
                }
              />

              Fees: low to high

            </label>



            <label>

              <input
                type="radio"
                name="sort"
                checked={
                  sortBy ===
                  "high-fee"
                }
                onChange={() =>
                  setSortBy(
                    "high-fee"
                  )
                }
              />

              Fees: high to low

            </label>



            <label>

              <input
                type="radio"
                name="sort"
                checked={
                  sortBy ===
                  "experience"
                }
                onChange={() =>
                  setSortBy(
                    "experience"
                  )
                }
              />

              Experience

            </label>


          </div>


        </aside>



        {/* =================================================
            DOCTOR RESULTS
        ================================================= */}

        <main className="doctor-result-area">


          <h2>

            {
              loading
                ? "Loading doctors..."
                : `${sortedDoctors.length} Doctors found in ${departmentName} department`
            }

          </h2>



          {/* =============================================
              ERROR
          ============================================= */}

          {
            !loading &&
            error &&
            (

              <div className="no-doctor">

                <h3>
                  Could not load doctors
                </h3>

                <p>
                  {error}
                </p>

              </div>

            )
          }



          {/* =============================================
              NO DOCTOR
          ============================================= */}

          {
            !loading &&
            !error &&
            sortedDoctors.length === 0 &&
            (

              <div className="no-doctor">

                <h3>
                  No doctors found
                </h3>

                <p>
                  No doctor is available
                  in this department
                  right now.
                </p>

              </div>

            )
          }



          {/* =============================================
              DOCTOR CARDS
          ============================================= */}

          {
            !loading &&
            !error &&
            sortedDoctors.map(
              (doctor) => (

                <NavLink

                  to={
                    `/doctor/${doctor.id}`
                  }

                  className=
                    "doctor-card-link"

                  key={
                    doctor.id
                  }

                >


                  <div className="doctor-list-card">


                    {/* =================================
                        LEFT
                    ================================= */}

                    <div className="doctor-basic-info">


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



                      <div>


                        <h3>

                          {
                            doctor.fullName
                          }

                        </h3>



                        <p className="degree">

                          {
                            doctor.qualifications
                            ||
                            "Qualification not added"
                          }

                        </p>



                        <p className="label-text">

                          Speciality

                        </p>


                        <p className="speciality-text">

                          {
                            specialtyNames[
                              doctor.specialty
                            ]
                            ||
                            doctor.specialty
                          }

                        </p>


                      </div>


                    </div>



                    {/* =================================
                        MIDDLE
                    ================================= */}

                    <div className="doctor-hospital-info">


                      <p className="label-text">

                        Working in

                      </p>


                      <h4>

                        {
                          doctor.workingPlace
                          ||
                          "Not added"
                        }

                      </h4>



                      <div className="doctor-extra-info">


                        <div>

                          <p className="label-text">

                            Total Experience

                          </p>


                          <strong>

                            {
                              doctor.experienceYears
                              !== null
                              &&
                              doctor.experienceYears
                              !== undefined
                                ? `${doctor.experienceYears}+ Years`
                                : "Not added"
                            }

                          </strong>

                        </div>



                        <div>

                          <p className="label-text">

                            Patients Attended

                          </p>


                          <strong>

                            {
                              doctor.patientsAttended
                              ?? 0
                            }

                          </strong>

                        </div>


                      </div>


                    </div>



                    {/* =================================
                        FEE
                    ================================= */}

                    <div className="doctor-fee-box">


                      {
                        doctor.consultationFee
                        !== null
                        &&
                        doctor.consultationFee
                        !== undefined
                          ? (

                            <>

                              <h3>

                                ৳ {
                                  doctor.consultationFee
                                }

                                <span>
                                  (incl. VAT)
                                </span>

                              </h3>


                              <p>
                                Per consultation
                              </p>

                            </>

                          )
                          : (

                            <>

                              <h3>
                                Fee not set
                              </h3>

                              <p>
                                Contact later
                              </p>

                            </>

                          )
                      }


                      <FaArrowRight
                        className=
                          "doctor-arrow"
                      />


                    </div>


                  </div>


                </NavLink>

              )
            )
          }


        </main>


      </section>



      <Footer />


    </div>

  );

}


export default Dept;