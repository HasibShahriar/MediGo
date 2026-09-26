import "../../Style/HomeCSS/Home.css";

import Nav from "../Components/Nav";
import AiDoctorAssistant from "../Components/AiDoctorAssistant";

import healthPlanImg from "../../assets/HealthPlan.png";

import Faq from "../Home/FaqLogic";
import Touch from "../Home/GetTouch";
import Footer from "../Components/Footer";
import Dept from "../Home/HomeDep";

import {
  useEffect,
  useState
} from "react";

import {
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";

import {
  FaUserDoctor,
  FaCalendarCheck,
  FaHeartPulse,
  FaTruckMedical,
  FaRegClock,
  FaLaptopMedical,
  FaRegStar
} from "react-icons/fa6";

import {
  FiDownload
} from "react-icons/fi";

import {
  NavLink
} from "react-router-dom";


function Home() {

  // =====================================================
  // PAGE TITLE
  // =====================================================

  useEffect(() => {

    document.title =
      "MediGo | Home";

  }, []);


  // =====================================================
  // HERO SLIDER IMAGES
  // =====================================================

  const images = [
    "/HeroSlides/banner1.jpg",
    "/HeroSlides/banner2.jpg",
    "/HeroSlides/banner3.jpg",
    "/HeroSlides/banner4.jpg",
    "/HeroSlides/banner5.jpg"
  ];


  // =====================================================
  // CURRENT SLIDE
  // =====================================================

  const [
    currentSlide,
    setCurrentSlide
  ] = useState(0);


  // =====================================================
  // AUTO SLIDE
  // =====================================================

  useEffect(() => {

    const timer =
      setInterval(() => {

        setCurrentSlide(
          (prevSlide) =>
            prevSlide === images.length - 1
              ? 0
              : prevSlide + 1
        );

      }, 3000);


    return () =>
      clearInterval(timer);

  }, []);


  // =====================================================
  // PREVIOUS SLIDE
  // =====================================================

  function previous_slide() {

    setCurrentSlide(
      currentSlide === 0
        ? images.length - 1
        : currentSlide - 1
    );

  }


  // =====================================================
  // NEXT SLIDE
  // =====================================================

  function next_slide() {

    setCurrentSlide(
      currentSlide === images.length - 1
        ? 0
        : currentSlide + 1
    );

  }


  // =====================================================
  // JSX
  // =====================================================

  return (

    <div>


      {/* =================================================
          NAVBAR
      ================================================= */}

      <Nav />


      {/* =================================================
          HERO IMAGE SLIDER
      ================================================= */}

      <div
        className="photo-slider"
      >

        <button

          className="
            slider-btn
            left-btn
          "

          onClick={
            previous_slide
          }

          aria-label="
            Previous slide
          "
        >

          <FaChevronLeft />

        </button>


        <img

          src={
            images[currentSlide]
          }

          alt="
            MediGo Banner
          "

          className="
            slider-image
          "

        />


        <button

          className="
            slider-btn
            right-btn
          "

          onClick={
            next_slide
          }

          aria-label="
            Next slide
          "
        >

          <FaChevronRight />

        </button>

      </div>


      {/* =================================================
          SERVICES
      ================================================= */}

      <section
        className="
          service-section
        "
      >


        {/* ===============================================
            ONLINE DOCTOR CONSULTATION
        =============================================== */}

        <NavLink

          to="/consultation"

          className="
            service-link
          "
        >

          <div
            className="
              service-card
            "
          >

            <div
              className="
                service-icon
              "
            >

              <FaUserDoctor />

            </div>


            <h3>
              Online Doctor Consultation
            </h3>


            <p>
              Consult verified doctors
              online from home anytime.
            </p>

          </div>

        </NavLink>


        {/* ===============================================
            APPOINTMENT
        =============================================== */}

        <NavLink

          to="/consultation"

          className="
            service-link
          "
        >

          <div
            className="
              service-card
            "
          >

            <div
              className="
                service-icon
              "
            >

              <FaCalendarCheck />

            </div>


            <h3>
              Book Doctor Appointment
            </h3>


            <p>
              Find doctors by specialty
              and book appointments easily.
            </p>

          </div>

        </NavLink>


        {/* ===============================================
            HEALTH PACKAGES
        =============================================== */}

        <NavLink

          to="/health-plan"

          className="
            service-link
          "
        >

          <div
            className="
              service-card
            "
          >

            <div
              className="
                service-icon
              "
            >

              <FaHeartPulse />

            </div>


            <h3>
              Health Packages
            </h3>


            <p>
              Choose affordable health
              checkup plans for your family.
            </p>

          </div>

        </NavLink>


        {/* ===============================================
            EMERGENCY SUPPORT
        =============================================== */}

        <NavLink

          to="/health-plan"

          className="
            service-link
          "
        >

          <div
            className="
              service-card
            "
          >

            <div
              className="
                service-icon
              "
            >

              <FaTruckMedical />

            </div>


            <h3>
              Emergency Support
            </h3>


            <p>
              Get quick medical support
              during urgent health situations.
            </p>

          </div>

        </NavLink>

      </section>


      {/* =================================================
          STATISTICS
      ================================================= */}

      <section
        className="
          stats-section
        "
      >


        {/* ===============================================
            VERIFIED DOCTORS
        =============================================== */}

        <div
          className="
            stats-card
          "
        >

          <div
            className="
              stats-icon
            "
          >

            <FaUserDoctor />

          </div>


          <h2>
            500+
          </h2>


          <p>
            Verified Doctors
          </p>

        </div>


        {/* ===============================================
            WAITING TIME
        =============================================== */}

        <div
          className="
            stats-card
          "
        >

          <div
            className="
              stats-icon
            "
          >

            <FaRegClock />

          </div>


          <h2>
            15 Minutes
          </h2>


          <p>
            Average Waiting Time
          </p>

        </div>


        {/* ===============================================
            ONLINE CONSULTATIONS
        =============================================== */}

        <div
          className="
            stats-card
          "
        >

          <div
            className="
              stats-icon
            "
          >

            <FaLaptopMedical />

          </div>


          <h2>
            10K+
          </h2>


          <p>
            Online Consultations
          </p>

        </div>


        {/* ===============================================
            PATIENT SATISFACTION
        =============================================== */}

        <div
          className="
            stats-card
          "
        >

          <div
            className="
              stats-icon
            "
          >

            <FaRegStar />

          </div>


          <h2>
            95%
          </h2>


          <p>
            Patient Satisfaction
          </p>

        </div>


        {/* ===============================================
            APP DOWNLOADS
        =============================================== */}

        <div
          className="
            stats-card
          "
        >

          <div
            className="
              stats-icon
            "
          >

            <FiDownload />

          </div>


          <h2>
            1M+
          </h2>


          <p>
            App Downloads
          </p>

        </div>

      </section>


      {/* =================================================
          DEPARTMENTS / SPECIALITIES
      ================================================= */}

      <Dept />


      {/* =================================================
          PREMIUM HEALTH PACKAGE
      ================================================= */}

      <section
        className="
          premium-section
        "
      >


        {/* ===============================================
            IMAGE
        =============================================== */}

        <div
          className="
            premium-image
          "
        >

          <img

            src={
              healthPlanImg
            }

            alt="
              MediGo Health Package
            "

          />

        </div>


        {/* ===============================================
            CONTENT
        =============================================== */}

        <div
          className="
            premium-content
          "
        >

          <p
            className="
              premium-small-title
            "
          >

            Become a Premium Member

          </p>


          <h2>

            A secure future for you

            <br />

            and your family

          </h2>


          <p
            className="
              premium-description
            "
          >

            MediGo brings modern
            healthcare services for
            families with online doctor
            consultation, appointment
            booking, emergency support,
            and affordable health
            packages. Choose the best
            healthcare plan based on
            your needs.

          </p>


          {/* =============================================
              FIXED:
              Previously this was <navLink>
              React components must start with capital letter.
          ============================================= */}

          <NavLink

            to="/health-plan"

            className="
              premium-btn
            "
          >

            View All Packages

          </NavLink>

        </div>

      </section>


      {/* =================================================
          FAQ
      ================================================= */}

      <Faq />


      {/* =================================================
          GET IN TOUCH
      ================================================= */}

      <Touch />


      {/* =================================================
          FOOTER
      ================================================= */}

      <Footer />


      {/* =================================================
          MEDIGO AI DOCTOR FINDER

          Landing page only.

          The component uses position: fixed,
          therefore placing it here does NOT
          change the normal Home page layout.

          It appears at the bottom-right corner.
      ================================================= */}

      <AiDoctorAssistant />


    </div>

  );
}


export default Home;