import "../../Style/LoginCSS/ForgotPasswordPage.css";

import {
  useEffect,
  useState
} from "react";

import {
  NavLink,
  useNavigate
} from "react-router-dom";

import axios from "axios";

import medigopic
  from "../../assets/medigo.png";

import DoctorLoginSidebar
  from "../Components/DoctorLoginSignUpSidebar";

import PatientLoginSidebar
  from "../Components/PatientLoginSidebar";

import {
  IoSendOutline
} from "react-icons/io5";

import {
  ToastContainer,
  toast
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";


const API_URL =
  "http://localhost:5138";


function ForgotPassword(
  props
) {

  const navigate =
    useNavigate();


  const [
    email,
    setEmail
  ] = useState("");


  const [
    loading,
    setLoading
  ] = useState(false);



  // =====================================================
  // ACCOUNT TYPE
  //
  // doctor=true  -> doctor
  // doctor=false -> patient
  // =====================================================

  const accountType =
    props.doctor
      ? "doctor"
      : "patient";



  // =====================================================
  // PAGE TITLE
  // =====================================================

  useEffect(() => {

    document.title =
      props.doctor
        ? "MediGo | Doctor Password Recovery"
        : "MediGo | Patient Password Recovery";

  }, [
    props.doctor
  ]);



  // =====================================================
  // SEND RECOVERY REQUEST
  // =====================================================

  async function handleSend() {

    const cleanEmail =
      email
        .trim()
        .toLowerCase();


    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



    // ===================================================
    // EMAIL REQUIRED
    // ===================================================

    if (
      cleanEmail ===
      ""
    ) {

      toast.error(
        "Email is required!"
      );


      return;
    }



    // ===================================================
    // EMAIL FORMAT
    // ===================================================

    if (
      !emailPattern.test(
        cleanEmail
      )
    ) {

      toast.error(
        "Please enter a valid email!"
      );


      return;
    }



    // ===================================================
    // SEND TO BACKEND
    // ===================================================

    setLoading(
      true
    );


    try {

      const response =
        await axios.post(

          `${API_URL}/api/password-recovery/send`,

          {
            email:
              cleanEmail,

            accountType:
              accountType
          }

        );



      toast.success(

        response.data?.message
        ||
        "Recovery password sent successfully!"

      );



      // =================================================
      // CLEAR EMAIL
      // =================================================

      setEmail(
        ""
      );



      // =================================================
      // GO TO CORRECT LOGIN PAGE
      // =================================================

      setTimeout(
        () => {

          if (
            props.doctor
          ) {

            navigate(
              "/doctor-login"
            );

          }

          else {

            navigate(
              "/patient-login"
            );

          }

        },
        2500
      );

    }

    catch (error) {

      console.log(
        "Password Recovery Error:",
        error
      );


      console.log(
        "Backend:",
        error.response?.data
      );


      // =================================================
      // BACKEND ERROR MESSAGE
      // =================================================

      toast.error(

        error.response?.data?.message

        ||

        "Could not send recovery password."

      );

    }

    finally {

      setLoading(
        false
      );

    }

  }



  // =====================================================
  // ENTER KEY
  // =====================================================

  function handleKeyDown(
    event
  ) {

    if (
      event.key ===
      "Enter"
      &&
      !loading
    ) {

      handleSend();

    }

  }



  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="doctor-recover-page">


      {/* =================================================
          CORRECT SIDEBAR
      ================================================= */}

      {
        props.doctor

          ? (
              <DoctorLoginSidebar />
            )

          : (
              <PatientLoginSidebar />
            )
      }



      <div className="doctor-recover-right">


        <div className="doctor-recover-form">


          {/* =================================================
              LOGO
          ================================================= */}

          <NavLink

            to="/"

            className="doctor-recover-logo-link"

          >


            <div className="doctor-recover-logo">


              <img

                src={
                  medigopic
                }

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



          {/* =================================================
              TITLE
          ================================================= */}

          <h1>

            {
              props.doctor
                ? "Doctor Password Recovery"
                : "Patient Password Recovery"
            }

          </h1>



          <p className="doctor-recover-description">

            {
              props.doctor

                ? (
                    <>
                      Enter the email registered
                      with your doctor account.
                      We will send a new recovery
                      password to that email.
                    </>
                  )

                : (
                    <>
                      Enter the email registered
                      with your patient account.
                      We will send a new recovery
                      password to that email.
                    </>
                  )
            }

          </p>



          {/* =================================================
              EMAIL
          ================================================= */}

          <label>

            Email

          </label>


          <input

            type="email"

            placeholder="example@gmail.com"

            value={
              email
            }

            disabled={
              loading
            }

            onChange={
              event =>
                setEmail(
                  event.target.value
                )
            }

            onKeyDown={
              handleKeyDown
            }

          />



          {/* =================================================
              SEND BUTTON
          ================================================= */}

          <button

            type="button"

            className="doctor-recover-btn"

            onClick={
              handleSend
            }

            disabled={
              loading
            }

          >


            <span className="doctor-recover-sent">

              <IoSendOutline />

            </span>


            {
              loading
                ? "Sending..."
                : "Send Recovery Password"
            }


          </button>



          {/* =================================================
              BACK TO LOGIN
          ================================================= */}

          <div className="doctor-recover-back">


            <span>

              Remember your password?

            </span>


            <NavLink

              to={
                props.doctor
                  ? "/doctor-login"
                  : "/patient-login"
              }

            >

              Back to Login

            </NavLink>


          </div>


        </div>


      </div>



      <ToastContainer

        position="bottom-right"

        autoClose={2000}

      />


    </div>

  );

}


export default ForgotPassword;