import "../../Style/ComponentsCSS/Nav.css";

import medigopic from "../../assets/medigo.png";
import communityPic from "../../assets/community.png";
import defaultProfile from "../../assets/default_patient.png";

import { FaUserDoctor } from "react-icons/fa6";

import {
  FaUserInjured,
  FaUser,
  FaCog,
  FaSignOutAlt
} from "react-icons/fa";

import { RiAdminFill } from "react-icons/ri";

import {
  NavLink,
  useNavigate
} from "react-router-dom";

import {
  useEffect,
  useState
} from "react";


function Nav() {

  const navigate =
    useNavigate();


  const [patient, setPatient] =
    useState(null);



  // =================================================
  // LOAD PATIENT
  // =================================================

  useEffect(() => {

    function loadPatient() {

      const savedPatient =
        localStorage.getItem("patient");


      if (savedPatient) {

        setPatient(
          JSON.parse(savedPatient)
        );

      } else {

        setPatient(null);

      }

    }


    loadPatient();


    // Listen for Settings updates
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



  // =================================================
  // LOGOUT
  // =================================================

  function handleLogout() {

    localStorage.removeItem(
      "patient"
    );


    setPatient(null);


    navigate(
      "/patient-login",
      { replace: true }
    );

  }



  return (

    <div>

      <nav className="medigo-navbar">


        {/* BRAND */}

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


            <div className="brand-line"></div>


            <NavLink to="/">

              <p className="brand-tagline">

                Healthcare Anytime Anywhere

              </p>

            </NavLink>

          </div>

        </div>



        {/* LINKS */}

        <ul className="nav-link">

          <li>

            <NavLink to="/Consultation">

              Consultation

            </NavLink>

          </li>


          <li>

            <NavLink to="/home-diagnostic">

              Home Diagnostic

            </NavLink>

          </li>


          <li>

            <NavLink to="/health-plan">

              Health Plan

            </NavLink>

          </li>


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

                <p>Blogs</p>

                <p>Events</p>

                <p>Gallery</p>

              </div>

            </div>

          </li>

        </ul>



        {/* =================================
            LOGGED-IN PATIENT
        ================================= */}

        {patient ? (

          <div className="patient-profile-area">


            <img

              src={
                patient.profileImage
                  ? `http://localhost:5138/${patient.profileImage}`
                  : defaultProfile
              }

              alt="Patient Profile"

              className="patient-profile-image"

            />


            <div className="patient-profile-dropdown">


              <NavLink to="/patient-profile">

                <FaUser />

                <span>
                  Account
                </span>

              </NavLink>



              <NavLink to="/patient-settings">

                <FaCog />

                <span>
                  Settings
                </span>

              </NavLink>



              <button
                type="button"
                onClick={handleLogout}
              >

                <FaSignOutAlt />

                <span>
                  Logout
                </span>

              </button>


            </div>

          </div>

        ) : (

          /* =================================
             NOT LOGGED IN
          ================================= */

          <div className="login-area">


            <button
              type="button"
              className="login-btn"
            >

              Log in

            </button>


            <div className="login-dropdown">


              <NavLink to="/doctor-login">

                <FaUserDoctor />

                <span id="doc">
                  Doctor
                </span>

              </NavLink>


              <NavLink to="/patient-login">

                <FaUserInjured />

                <span id="pat">
                  Patient
                </span>

              </NavLink>


              <NavLink to="/admin-login">

                <RiAdminFill />

                <span id="ad">
                  Admin
                </span>

              </NavLink>


            </div>

          </div>

        )}


      </nav>

    </div>

  );

}


export default Nav;