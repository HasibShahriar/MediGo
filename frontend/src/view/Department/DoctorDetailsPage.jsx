import {
  useEffect,
  useState
} from "react";

import {
  useNavigate,
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

import {
  ToastContainer,
  toast
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";


const API_URL =
  "http://localhost:5138";


function DoctorDetailsPage() {

  const navigate =
    useNavigate();


  const {
    doctorSlug
  } = useParams();


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


  const [
    booking,
    setBooking
  ] = useState(false);



  const specialtyNames = {

    "general-physician":
      "General Physician",

    pediatrics:
      "Pediatrics",

    "gyne-obs":
      "Gyne & Obs",

    dermatology:
      "Dermatology",

    "internal-medicine":
      "Internal Medicine",

    cardiology:
      "Cardiology",

    neurology:
      "Neurology",

    dentistry:
      "Dentistry",

    ophthalmology:
      "Ophthalmology",

    oncology:
      "Oncology",

    "family-medicine":
      "Family Medicine",

    "physical-medicine":
      "Physical Medicine"
  };



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



  function formatDate(
    value
  ) {

    if (!value) {

      return "Not available";

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

      .then(
        response => {

          setDoctor(
            response.data
          );


          document.title =
            `MediGo | ${response.data.fullName}`;

        }
      )

      .catch(
        error => {

          console.log(
            "Doctor Details Error:",
            error
          );


          setDoctor(null);


          setError(
            error.response?.data?.message
            ||
            "Doctor not found."
          );

        }
      )

      .finally(
        () => {

          setLoading(false);

        }
      );

  }, [
    doctorSlug
  ]);



  // =====================================================
  // BOOK ONLINE APPOINTMENT
  // =====================================================

  async function bookOnlineAppointment() {

    const savedPatient =
      localStorage.getItem(
        "patient"
      );


    if (!savedPatient) {

      toast.info(
        "Please login as a patient first."
      );


      setTimeout(
        () => {

          navigate(
            "/patient-login"
          );

        },
        800
      );


      return;
    }



    let patient;


    try {

      patient =
        JSON.parse(
          savedPatient
        );

    }

    catch {

      localStorage.removeItem(
        "patient"
      );


      navigate(
        "/patient-login"
      );


      return;
    }



    if (!patient?.id) {

      toast.error(
        "Patient information is missing."
      );

      return;
    }


    if (!doctor?.id) {

      toast.error(
        "Doctor information is missing."
      );

      return;
    }



    setBooking(true);


    try {

      const response =
        await axios.post(

          `${API_URL}/api/appointment-payment/initiate`,

          {
            patientId:
              patient.id,

            doctorId:
              doctor.id
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
        "Appointment Payment Error:",
        error.response?.data
      );


      toast.error(
        error.response?.data?.message
        ||
        error.response?.data?.detail
        ||
        "Could not start appointment payment."
      );

    }

    finally {

      setBooking(false);

    }
  }



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



  return (

    <div>


      <Nav />


      <section className="doctor-details-page">


        <div className="doctor-profile-card">


          <div className="doctor-profile-top">


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

                onError={
                  event => {

                    event.currentTarget.src =
                      defaultDoctorProfile;

                  }
                }

              />


              <div className="doctor-main-info">


                <h1>
                  {doctor.fullName}
                </h1>


                <p>

                  {
                    doctor.qualifications
                    ||
                    "Qualification not added"
                  }

                </p>


                <p>
                  {specialtyName}
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



            <div className="doctor-profile-right">


              <h3>
                Consultation Fee
              </h3>


              {
                doctor.consultationFee !== null
                &&
                doctor.consultationFee !== undefined

                  ? (

                    <h2>

                      ৳{" "}
                      {
                        doctor.consultationFee
                      }

                      <span>
                        {" "}(Pay Later)
                      </span>

                    </h2>

                  )

                  : (

                    <h2>
                      Not set
                    </h2>

                  )
              }



              <div className="appointment-booking-fee">

                <small>
                  Online Booking Fee
                </small>

                <strong>
                  ৳50
                </strong>

                <span>
                  Pay Now
                </span>

              </div>



              <button

                type="button"

                className="appointment-btn"

                onClick={
                  bookOnlineAppointment
                }

                disabled={
                  booking
                }

              >

                <FaCalendarAlt />

                {
                  booking
                    ? "Opening Payment..."
                    : "Book Online Appointment - ৳50"
                }

              </button>


            </div>


          </div>



          <div className="doctor-stats">


            <div>

              <p>
                Total Experience
              </p>

              <h4>

                {
                  doctor.experienceYears !== null
                  &&
                  doctor.experienceYears !== undefined

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
                  ??
                  0
                }

              </h4>

            </div>


          </div>



          <div className="doctor-tabs">


            <span

              onClick={
                () =>
                  setActiveTab(
                    "info"
                  )
              }

              className={
                activeTab ===
                "info"

                  ? "active-tab"

                  : ""
              }

            >

              <FaInfoCircle />

              Info

            </span>



            <span

              onClick={
                () =>
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



        <div className="doctor-details-grid">


          <div className="doctor-about-card">


            {
              activeTab ===
                "info"

              &&

              (

                <>

                  <h2>

                    About{" "}

                    {
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
                        doctor.experienceYears !== null
                        &&
                        doctor.experienceYears !== undefined

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
                      {specialtyName}
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



          <div className="doctor-side-area">


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
                      doctor.consultationFee !== null
                      &&
                      doctor.consultationFee !== undefined

                        ? `৳ ${doctor.consultationFee}`

                        : "Not set"
                    }

                  </h4>

                  <small>
                    Pay Later
                  </small>

                </div>



                <div>

                  <p>
                    Booking Fee
                  </p>

                  <h4>
                    ৳ 50
                  </h4>

                  <small>
                    Pay Now
                  </small>

                </div>



                <div>

                  <p>
                    Follow-up Fee
                  </p>

                  <h4>

                    {
                      doctor.followUpFee !== null
                      &&
                      doctor.followUpFee !== undefined

                        ? `৳ ${doctor.followUpFee}`

                        : "Not set"
                    }

                  </h4>

                </div>



                <div>

                  <p>
                    Patient Attended
                  </p>

                  <h4>

                    {
                      doctor.patientsAttended
                      ??
                      0
                    }

                  </h4>

                </div>



                <div>

                  <p>
                    Doctor Code
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


      <ToastContainer

        position="bottom-right"

        autoClose={2200}

      />


    </div>

  );
}


export default DoctorDetailsPage;