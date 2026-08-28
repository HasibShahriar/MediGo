import "../../Style/LoginCSS/DoctorLoginPage.css";

import DoctorLoginSidebar
  from "../Components/DoctorLoginSignUpSidebar";

import {
  useEffect,
  useState
} from "react";

import {
  NavLink,
  useNavigate
} from "react-router-dom";

import medigopic
  from "../../assets/medigo.png";

import {
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

import {
  ToastContainer,
  toast
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import axios from "axios";


function DoctorLogin() {

  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);


  const navigate =
    useNavigate();



  useEffect(() => {

    document.title =
      "MediGo | Doctor Login";

  }, []);



  // =====================================================
  // LOGIN
  // =====================================================

  function handleLogin() {

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



    // =========================================
    // VALIDATION
    // =========================================

    if (email.trim() === "") {

      toast.error(
        "Email is required!"
      );

      return;
    }


    if (
      !emailPattern.test(
        email.trim()
      )
    ) {

      toast.error(
        "Please enter a valid email!"
      );

      return;
    }


    if (password.trim() === "") {

      toast.error(
        "Password is required!"
      );

      return;
    }



    // =========================================
    // LOGIN DATA
    // =========================================

    const loginData = {

      email:
        email.trim(),

      password:
        password

    };


    setIsLoading(true);



    // =========================================
    // SEND TO BACKEND
    // =========================================

    axios
      .post(
        "http://localhost:5167/api/Doctor/login",
        loginData
      )

      .then((res) => {

        console.log(
          "Doctor Login:",
          res.data
        );



        // Save doctor information
        localStorage.setItem(
          "doctor",
          JSON.stringify(
            res.data.doctor
          )
        );



        toast.success(
          res.data.message ||
          "Login successful!"
        );



        setTimeout(() => {

          navigate(
            "/doctor-dashboard",
            {
              replace: true
            }
          );

        }, 1500);

      })

      .catch((err) => {

        console.log(
          "Doctor Login Error:",
          err
        );


        if (
          err.response?.data?.message
        ) {

          toast.error(
            err.response.data.message
          );

        }

        else {

          toast.error(
            "Login failed!"
          );

        }

      })

      .finally(() => {

        setIsLoading(false);

      });

  }



  return (

    <div className="doctor-login-page">


      <DoctorLoginSidebar />


      <div className="doctor-login-right">


        <div className="doctor-login-form">


          <NavLink
            to="/"
            className="doctor-login-logo-link"
          >

            <div className="doctor-login-logo">


              <img
                src={medigopic}
                alt="MediGo Logo"
              />


              <h2>

                <span>
                  Medi
                </span>

                Go

              </h2>


            </div>

          </NavLink>



          <h1>
            Login
          </h1>


          <p>
            Enter your credentials to
            login to your account
          </p>



          {/* EMAIL */}

          <label>
            Email
          </label>


          <input

            type="email"

            placeholder="example@gmail.com"

            value={email}

            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }

          />



          {/* PASSWORD */}

          <label>
            Password
          </label>


          <div className="doctor-login-password-box">


            <input

              type={
                showPassword
                  ? "text"
                  : "password"
              }

              placeholder="Enter password"

              value={password}

              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }

              onKeyDown={(e) => {

                if (
                  e.key === "Enter"
                ) {

                  handleLogin();

                }

              }}

            />


            <span

              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }

            >

              {
                showPassword
                  ? <FaEyeSlash />
                  : <FaEye />
              }

            </span>


          </div>



          <NavLink

            to="/doctor-forgot-password"

            className="doctor-login-forgot"

          >

            Forgot Password?

          </NavLink>



          {/* LOGIN BUTTON */}

          <button

            type="button"

            className="doctor-login-btn"

            onClick={handleLogin}

            disabled={isLoading}

          >

            {
              isLoading
                ? "SIGNING IN..."
                : "Sign In"
            }

          </button>



          <p className="doctor-login-signup-text">

            Don’t have an account?{" "}

            <NavLink
              to="/doctor-signup"
            >

              Sign Up

            </NavLink>

          </p>


        </div>


      </div>



      <ToastContainer

        position="bottom-right"

        autoClose={1500}

      />


    </div>

  );

}


export default DoctorLogin;