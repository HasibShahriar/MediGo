import "../../Style/ComponentsCSS/Nav.css";

import medigopic from "../../assets/medigo.png";
import communityPic from "../../assets/Community.png";
import defaultProfile from "../../assets/default_patient.png";

import {
  FaUserDoctor
} from "react-icons/fa6";

import {
  FaUserInjured,
  FaUser,
  FaCog,
  FaSignOutAlt
} from "react-icons/fa";

import {
  RiAdminFill
} from "react-icons/ri";

import {
  NavLink,
  useNavigate
} from "react-router-dom";

import {
  useEffect,
  useState
} from "react";


const API_URL =
  "http://localhost:5138";


function Nav() {

  const navigate =
    useNavigate();


  const [
    patient,
    setPatient
  ] = useState(null);



  // =====================================================
  // PROFILE IMAGE URL
  // =====================================================

  function getProfileImageUrl(
    imagePath
  ) {

    if (!imagePath) {

      return defaultProfile;

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


    return (
      `${API_URL}/${cleanPath}`
    );

  }



  // =====================================================
  // LOAD PATIENT
  // =====================================================

  useEffect(() => {

    function loadPatient() {

      const savedPatient =
        localStorage.getItem(
          "patient"
        );


      if (!savedPatient) {

        setPatient(
          null
        );

        return;

      }


      try {

        const parsedPatient =
          JSON.parse(
            savedPatient
          );


        setPatient(
          parsedPatient
        );

      }

      catch (error) {

        console.log(
          "Patient localStorage error:",
          error
        );


        localStorage.removeItem(
          "patient"
        );


        setPatient(
          null
        );

      }

    }



    loadPatient();



    // If patient settings update
    // name/image/etc., navbar refreshes.
    window.addEventListener(
      "patientUpdated",
      loadPatient
    );



    return () => {

      window.removeEventListener(
        "patientUpdated",
        loadPatient
      );

    };

  }, []);



  // =====================================================
  // LOGOUT
  // =====================================================

  function handleLogout() {

    localStorage.removeItem(
      "patient"
    );


    setPatient(
      null
    );


    navigate(
      "/patient-login",
      {
        replace: true
      }
    );

  }



  // =====================================================
  // UI
  // =====================================================

  return (

    <div>


      <nav className="medigo-navbar">


        {/* =================================================
            BRAND
        ================================================= */}

        <div className="brand">


          <NavLink to="/">

            <img
              src={medigopic}
              alt="MediGo Logo"
            />

          </NavLink>



          <div className="brand-name">


            <NavLink to="/">

              <span className="medi">
                Medi
              </span>

              <span className="go">
                Go
              </span>

            </NavLink>



            <div className="brand-line">
            </div>



            <NavLink to="/">

              <p className="brand-tagline">

                Healthcare Anytime Anywhere

              </p>

            </NavLink>


          </div>


        </div>



        {/* =================================================
            MAIN NAVIGATION
        ================================================= */}

        <ul className="nav-link">


          {/* CONSULTATION */}

          <li>

            <NavLink to="/consultation">

              Consultation

            </NavLink>

          </li>



          {/* PHARMACY */}

          <li>

            <NavLink to="/pharmacy">

              Pharmacy

            </NavLink>

          </li>



          {/* HEALTH PLAN */}

          <li>

            <NavLink to="/health-plan">

              Health Plan

            </NavLink>

          </li>



          {/* COMMUNITY */}

          <li className="community-menu">

            Community


            <div className="community-dropdown">


              <div className="community-image">

                <img
                  src={communityPic}
                  alt="Community"
                />

              </div>



              <div className="community-text">

                <p>
                  Blogs
                </p>

                <p>
                  Events
                </p>

                <p>
                  Gallery
                </p>

              </div>


            </div>


          </li>


        </ul>



        {/* =================================================
            LOGGED-IN PATIENT
        ================================================= */}

        {
          patient
            ? (

              <div className="patient-profile-area">


                {/* PATIENT IMAGE */}

                <img

                  src={
                    getProfileImageUrl(
                      patient.profileImage
                    )
                  }

                  alt="Patient Profile"

                  className="patient-profile-image"

                  onError={(event) => {

                    event.currentTarget.src =
                      defaultProfile;

                  }}

                />



                {/* PATIENT DROPDOWN */}

                <div className="patient-profile-dropdown">


                  {/* =========================
                      ACCOUNT
                  ========================= */}

                  <NavLink to="/patient-account">

                    <FaUser />

                    <span>
                      Account
                    </span>

                  </NavLink>



                  {/* =========================
                      SETTINGS
                  ========================= */}

                  <NavLink to="/patient-settings">

                    <FaCog />

                    <span>
                      Settings
                    </span>

                  </NavLink>



                  {/* =========================
                      LOGOUT
                  ========================= */}

                  <button

                    type="button"

                    onClick={
                      handleLogout
                    }

                  >

                    <FaSignOutAlt />

                    <span>
                      Logout
                    </span>

                  </button>


                </div>


              </div>

            )

            : (

              /* =================================================
                 NOT LOGGED IN
              ================================================= */

              <div className="login-area">


                <button

                  type="button"

                  className="login-btn"

                >

                  Log in

                </button>



                <div className="login-dropdown">


                  {/* DOCTOR LOGIN */}

                  <NavLink to="/doctor-login">

                    <FaUserDoctor />

                    <span id="doc">
                      Doctor
                    </span>

                  </NavLink>



                  {/* PATIENT LOGIN */}

                  <NavLink to="/patient-login">

                    <FaUserInjured />

                    <span id="pat">
                      Patient
                    </span>

                  </NavLink>



                  {/* ADMIN LOGIN */}

                  <NavLink to="/admin-login">

                    <RiAdminFill />

                    <span id="ad">
                      Admin
                    </span>

                  </NavLink>


                </div>


              </div>

            )
        }


      </nav>


    </div>

  );

}


export default Nav;
