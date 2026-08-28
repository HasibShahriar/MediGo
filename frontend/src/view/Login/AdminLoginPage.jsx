import "../../Style/LoginCSS/AdminLoginPage.css";

import {
  NavLink,
  useNavigate
} from "react-router-dom";

import {
  useEffect,
  useState
} from "react";

import axios from "axios";

import medigopic from "../../assets/medigo.png";

import {
  FaChartLine,
  FaCalendarCheck,
  FaUserMd,
  FaUsers,
  FaFileInvoice,
  FaEnvelope,
  FaLock
} from "react-icons/fa";

import {
  ToastContainer,
  toast
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";


function AdminLogin() {

  const navigate =
    useNavigate();


  // =====================================================
  // STATES
  // =====================================================

  const [
    email,
    setEmail
  ] = useState("");


  const [
    password,
    setPassword
  ] = useState("");


  const [
    loading,
    setLoading
  ] = useState(false);


  // =====================================================
  // PAGE TITLE
  // =====================================================

  useEffect(() => {

    document.title =
      "MediGo | Admin Login";

  }, []);


  // =====================================================
  // LOGIN
  // =====================================================

  function handleLogin(e) {

    e.preventDefault();


    // =============================================
    // USERNAME
    // =============================================

    if (
      email.trim() === ""
    ) {

      toast.error(
        "Admin username is required!"
      );

      return;
    }


    // =============================================
    // PASSWORD
    // =============================================

    if (
      password.trim() === ""
    ) {

      toast.error(
        "Password is required!"
      );

      return;
    }


    const loginData = {

      email:
        email.trim(),

      password:
        password

    };


    setLoading(true);


    axios
      .post(
        "http://localhost:5167/api/Admin/login",
        loginData
      )

      .then((res) => {

        console.log(
          "Admin Login:",
          res.data
        );


        // =========================================
        // SAVE ADMIN INFORMATION
        // =========================================

        localStorage.setItem(
          "admin",
          JSON.stringify(
            res.data.admin
          )
        );


        toast.success(
          res.data.message ||
          "Admin login successful!"
        );


        setTimeout(() => {

          navigate(
            "/admin-dashboard",
            {
              replace: true
            }
          );

        }, 1000);

      })

      .catch((err) => {

        console.log(
          "Admin Login Error:",
          err
        );


        console.log(
          "Backend Error:",
          err.response?.data
        );


        toast.error(
          err.response?.data?.message ||
          "Admin login failed!"
        );

      })

      .finally(() => {

        setLoading(false);

      });

  }


  // =====================================================
  // JSX
  // =====================================================

  return (

    <div className="admin-login-page">


      {/* =================================================
          LEFT SIDE
      ================================================= */}

      <div className="login-left">


        <div className="dot-pattern top-dots">
        </div>


        <div className="left-content">


          <h1>

            MediGo Admin <br />

            Portal

          </h1>



          <div className="left-feature">

            <span>
              <FaChartLine />
            </span>

            <p>
              Dashboard Analytics
            </p>

          </div>



          <div className="left-feature">

            <span>
              <FaCalendarCheck />
            </span>

            <p>
              Appointment Management
            </p>

          </div>



          <div className="left-feature">

            <span>
              <FaUserMd />
            </span>

            <p>
              Doctor Approval
            </p>

          </div>



          <div className="left-feature">

            <span>
              <FaUsers />
            </span>

            <p>
              Patient Management
            </p>

          </div>



          <div className="left-feature">

            <span>
              <FaFileInvoice />
            </span>

            <p>
              Reports and Billing
            </p>

          </div>


        </div>


        <div className="dot-pattern bottom-dots">
        </div>


      </div>



      {/* =================================================
          RIGHT SIDE
      ================================================= */}

      <div className="login-right">


        <NavLink
          to="/"
          className="login-logo-link"
        >

          <div className="login-logo">


            <img
              src={medigopic}
              alt="MediGo Logo"
            />


            <h3>

              <span>
                Medi
              </span>

              Go

            </h3>


          </div>

        </NavLink>



        <div className="login-box">


          <h1>
            Login
          </h1>



          <form
            onSubmit={
              handleLogin
            }
          >


            {/* =========================================
                ADMIN USERNAME
            ========================================= */}

            <label>
              Admin Username
            </label>


            <div className="input-box">


              <FaEnvelope />


              <input

                type="text"

                placeholder="admin"

                value={email}

                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }

                autoComplete="username"

              />


            </div>



            {/* =========================================
                PASSWORD
            ========================================= */}

            <label>
              Password
            </label>


            <div className="input-box">


              <FaLock />


              <input

                type="password"

                placeholder="********"

                value={password}

                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }

                autoComplete="current-password"

              />


            </div>



            {/* =========================================
                LOGIN BUTTON
            ========================================= */}

            <button

              type="submit"

              className="main-login-btn"

              disabled={
                loading
              }

            >

              {
                loading
                  ? "LOGGING IN..."
                  : "LOGIN"
              }

            </button>


          </form>


        </div>


      </div>



      <ToastContainer

        position="bottom-right"

        autoClose={1500}

      />


    </div>

  );

}


export default AdminLogin;