import "../../Style/LoginCSS/PatientLoginPage.css";

import axios from "axios";

import PatientLoginSidebar from "../Components/PatientLoginSidebar";

import { useEffect, useState } from "react";

import { NavLink, useNavigate } from "react-router-dom";

import medigopic from "../../assets/medigo.png";

import { FaEye, FaEyeSlash } from "react-icons/fa";

import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";


function PatientLogin() {

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const navigate = useNavigate();


  useEffect(() => {

    document.title = "MediGo | Patient Login";

  }, []);


  function handleLogin() {

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (email.trim() === "") {

      toast.error("Email is required!");

    }

    else if (!emailPattern.test(email)) {

      toast.error(
        "Please enter a valid email!"
      );

    }

    else if (password.trim() === "") {

      toast.error(
        "Password is required!"
      );

    }

    else {

      const loginData = {

        email: email,

        password: password,

      };


      axios
        .post(
          "http://localhost:5167/api/Patient/login",
          loginData
        )

        .then((res) => {

          console.log(
            "Login Response:",
            res.data
          );


          /*
            res.data.patient may look like:

            {
              id: 1,
              fullName: "Rashedul Hasan",
              email: "example@gmail.com",
              phone: "01810000001",
              dateOfBirth: "...",
              gender: "Male",
              address: "Dhaka",
              profileImage:
                "uploads/patients/patient_1_xxx.jpg",
              isVisible: true
            }
          */


          // =========================
          // SAVE PATIENT
          // =========================

          localStorage.setItem(
            "patient",
            JSON.stringify(
              res.data.patient
            )
          );


          /*
            Because profileImage is inside
            res.data.patient, it is also
            automatically saved.

            Example:

            localStorage patient:
            {
              ...
              profileImage:
              "uploads/patients/patient_1_xxx.jpg"
            }
          */


          // Tell navbar that patient changed
          window.dispatchEvent(
            new Event("patientUpdated")
          );


          toast.success(
            "Login successful!"
          );


          setTimeout(() => {

            navigate(
              "/",
              {
                replace: true
              }
            );

          }, 1500);

        })

        .catch((err) => {

          console.log(
            "Login Error:",
            err
          );


          console.log(
            "Status:",
            err.response?.status
          );


          console.log(
            "Backend Message:",
            err.response?.data
          );


          if (
            err.response?.status === 401
          ) {

            toast.error(
              "Invalid email or password!"
            );

          }

          else if (
            err.response?.data?.message
          ) {

            toast.error(
              err.response.data.message
            );

          }

          else {

            toast.error(
              "Something went wrong!"
            );

          }

        });

    }

  }


  return (

    <div className="patient-login-page">


      <PatientLoginSidebar />


      <div className="patient-login-right">


        <div className="patient-login-form">


          {/* =========================
              LOGO
          ========================= */}

          <NavLink
            to="/"
            className="patient-login-logo-link"
          >

            <div className="patient-login-logo">

              <img
                src={medigopic}
                alt="MediGo Logo"
              />

              <h2>

                <span>Medi</span>Go

              </h2>

            </div>

          </NavLink>


          <h1>
            Login
          </h1>


          <p>
            Log in to your account.
          </p>


          {/* =========================
              EMAIL
          ========================= */}

          <label>
            Email
          </label>


          <input

            type="email"

            placeholder="Enter your email"

            value={email}

            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }

          />


          {/* =========================
              PASSWORD
          ========================= */}

          <label>
            Password
          </label>


          <div className="patient-password-box">


            <input

              type={
                showPassword
                  ? "text"
                  : "password"
              }

              placeholder="Enter your password"

              value={password}

              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }

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


          {/* =========================
              FORGOT PASSWORD
          ========================= */}

          <NavLink

            to="/patient-forgot-password"

            className="patient-forgot-link"

          >

            Forgot Password?

          </NavLink>


          {/* =========================
              LOGIN BUTTON
          ========================= */}

          <button

            type="button"

            className="patient-login-btn"

            onClick={handleLogin}

          >

            Log In

          </button>


          {/* =========================
              SIGN UP
          ========================= */}

          <p className="patient-signup-text">

            Don’t have an account?{" "}

            <NavLink
              to="/patient-signup"
            >

              Sign Up

            </NavLink>

          </p>


        </div>

      </div>


      <ToastContainer

        position="bottom-right"

        autoClose={1000}

      />


    </div>

  );

}


export default PatientLogin;