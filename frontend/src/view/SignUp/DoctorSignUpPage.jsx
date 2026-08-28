import "../../Style/SignUpCSS/DoctorSignUpPage.css";

import DoctorSidebar from "../Components/DoctorLoginSignUpSidebar";

import { useEffect, useState } from "react";

import {
  NavLink,
  useNavigate
} from "react-router-dom";

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


function DoctorSignUp() {

  const [showPassword, setShowPassword] =
    useState(false);

  const [title, setTitle] =
    useState("");

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [dateOfBirth, setDateOfBirth] =
    useState("");

  const [gender, setGender] =
    useState("");

  const [nationalId, setNationalId] =
    useState("");

  const [bmdcNumber, setBmdcNumber] =
    useState("");

  const [mobile, setMobile] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [acceptTerms, setAcceptTerms] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);


  const navigate =
    useNavigate();


  useEffect(() => {

    document.title =
      "MediGo | Doctor SignUp";

  }, []);



  // =====================================================
  // SIGNUP
  // =====================================================

  function handleSignUp() {

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    const mobilePattern =
      /^01[0-9]{9}$/;



    // ================================
    // VALIDATION
    // ================================

    if (title === "") {

      toast.error(
        "Please select title"
      );

      return;
    }


    if (firstName.trim() === "") {

      toast.error(
        "First name is required"
      );

      return;
    }


    if (lastName.trim() === "") {

      toast.error(
        "Last name is required"
      );

      return;
    }


    if (dateOfBirth === "") {

      toast.error(
        "Date of birth is required"
      );

      return;
    }


    if (gender === "") {

      toast.error(
        "Please select gender"
      );

      return;
    }


    if (nationalId.trim() === "") {

      toast.error(
        "National ID / Passport number is required"
      );

      return;
    }


    if (bmdcNumber.trim() === "") {

      toast.error(
        "BMDC registration number is required"
      );

      return;
    }


    if (mobile.trim() === "") {

      toast.error(
        "Mobile number is required"
      );

      return;
    }


    if (!mobilePattern.test(mobile)) {

      toast.error(
        "Please enter a valid Bangladeshi mobile number"
      );

      return;
    }


    if (email.trim() === "") {

      toast.error(
        "Email is required"
      );

      return;
    }


    if (!emailPattern.test(email)) {

      toast.error(
        "Please enter a valid email"
      );

      return;
    }


    if (password.trim() === "") {

      toast.error(
        "Password is required"
      );

      return;
    }


    if (password.length < 6) {

      toast.error(
        "Password must be at least 6 characters"
      );

      return;
    }


    if (!acceptTerms) {

      toast.error(
        "Please accept terms and conditions"
      );

      return;
    }



    // ================================
    // CREATE REQUEST DATA
    // ================================

    const doctorData = {

      title:
        title,

      firstName:
        firstName.trim(),

      lastName:
        lastName.trim(),

      dateOfBirth:
        dateOfBirth,

      gender:
        gender,

      nationalId:
        nationalId.trim(),

      bmdcNumber:
        bmdcNumber.trim(),

      phone:
        mobile.trim(),

      email:
        email.trim(),

      password:
        password,

      acceptedTerms:
        acceptTerms

    };


    console.log(
      "Doctor Data:",
      doctorData
    );


    setIsSubmitting(true);



    // ================================
    // SEND TO ASP.NET
    // ================================

    axios
      .post(
        "http://localhost:5167/api/Doctor/signup",
        doctorData
      )

      .then((res) => {

        console.log(
          "Doctor Signup:",
          res.data
        );


        toast.success(
          res.data.message ||
          "Doctor registration submitted for approval!"
        );


        // ============================
        // CLEAR FORM
        // ============================

        setTitle("");

        setFirstName("");

        setLastName("");

        setDateOfBirth("");

        setGender("");

        setNationalId("");

        setBmdcNumber("");

        setMobile("");

        setEmail("");

        setPassword("");

        setAcceptTerms(false);



        // ============================
        // GO TO LOGIN
        // ============================

        setTimeout(() => {

          navigate(
            "/doctor-login",
            {
              replace: true
            }
          );

        }, 2000);

      })

      .catch((err) => {

        console.log(
          "Doctor Signup Error:",
          err
        );


        console.log(
          "Backend Response:",
          err.response?.data
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
            "Doctor registration failed!"
          );

        }

      })

      .finally(() => {

        setIsSubmitting(false);

      });

  }



  return (

    <div className="doctor-signup-page">


      <DoctorSidebar />


      <div className="doctor-signup-right">


        <div className="doctor-register-form">


          <h1>
            Registration
          </h1>



          {/* TITLE */}

          <select

            value={title}

            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }

          >

            <option value="">
              Title
            </option>

            <option value="Dr.">
              Dr.
            </option>

            <option value="Prof. Dr.">
              Prof. Dr.
            </option>

            <option value="Assoc. Prof. Dr.">
              Assoc. Prof. Dr.
            </option>

          </select>



          {/* NAME */}

          <div className="two-input-row">


            <input

              type="text"

              placeholder="First Name"

              value={firstName}

              onChange={(e) =>
                setFirstName(
                  e.target.value
                )
              }

            />


            <input

              type="text"

              placeholder="Last Name"

              value={lastName}

              onChange={(e) =>
                setLastName(
                  e.target.value
                )
              }

            />


          </div>



          {/* DATE OF BIRTH */}

          <input

            type="date"

            value={dateOfBirth}

            onChange={(e) =>
              setDateOfBirth(
                e.target.value
              )
            }

          />



          {/* GENDER */}

          <select

            value={gender}

            onChange={(e) =>
              setGender(
                e.target.value
              )
            }

          >

            <option value="">
              Gender
            </option>

            <option value="Male">
              Male
            </option>

            <option value="Female">
              Female
            </option>

          </select>



          {/* NATIONAL ID */}

          <input

            type="text"

            placeholder="National ID / Passport Number"

            value={nationalId}

            onChange={(e) =>
              setNationalId(
                e.target.value
              )
            }

          />



          {/* BMDC */}

          <input

            type="text"

            placeholder="Registration Number (BMDC)"

            value={bmdcNumber}

            onChange={(e) =>
              setBmdcNumber(
                e.target.value
              )
            }

          />



          {/* PHONE */}

          <input

            type="text"

            placeholder="Mobile number"

            value={mobile}

            maxLength="11"

            onChange={(e) =>
              setMobile(
                e.target.value
              )
            }

          />



          {/* EMAIL */}

          <input

            type="email"

            placeholder="Email"

            value={email}

            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }

          />



          {/* PASSWORD */}

          <div className="signup-password-box">


            <input

              type={
                showPassword
                  ? "text"
                  : "password"
              }

              placeholder="Password"

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



          {/* TERMS */}

          <h3>
            Accepting Terms & conditions
          </h3>


          <div className="terms-row">


            <input

              type="checkbox"

              checked={acceptTerms}

              onChange={(e) =>
                setAcceptTerms(
                  e.target.checked
                )
              }

            />


            <p>

              I accept and agree{" "}

              <NavLink to="/terms">

                Terms of services

              </NavLink>

              {" "}and{" "}

              <NavLink to="/privacy">

                Privacy Policy

              </NavLink>

            </p>


          </div>



          {/* BUTTON */}

          <div className="signup-bottom-row">


            <button

              type="button"

              className="doctor-register-btn"

              onClick={handleSignUp}

              disabled={isSubmitting}

            >

              {
                isSubmitting
                  ? "REGISTERING..."
                  : "SIGN UP"
              }

            </button>



            <p>

              Already have an account?{" "}

              <NavLink to="/doctor-login">

                Sign in

              </NavLink>

            </p>


          </div>


        </div>


      </div>


      <ToastContainer

        position="bottom-right"

        autoClose={1500}

      />


    </div>

  );

}


export default DoctorSignUp;