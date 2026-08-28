import "../../Style/SignUpCSS/PatientSignUpPage.css";

import PatientLoginSidebar from "../Components/PatientLoginSidebar";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import medigopic from "../../assets/medigo.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import axios from "axios";

function PatientSignUp() {
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const patientData = {
  fullName: fullName,
  email: email,
  phone: phone,
  dateOfBirth: dateOfBirth,
  gender: gender,
  address: address,
  password: password,
};

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "MediGo | Patient SignUp";
  }, []);

  function handleSignUp() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^01[0-9]{9}$/;

    if (fullName.trim() === "") {
      toast.error("Full name is required!");
    } else if (dateOfBirth === "") {
      toast.error("Date of birth is required!");
    } else if (gender === "") {
      toast.error("Please select gender!");
    } else if (phone.trim() === "") {
      toast.error("Phone number is required!");
    } else if (!phonePattern.test(phone)) {
      toast.error("Please enter a valid Bangladeshi phone number!");
    } else if (email.trim() === "") {
      toast.error("Email is required!");
    } else if (!emailPattern.test(email)) {
      toast.error("Please enter a valid email!");
    } else if (address.trim() === "") {
      toast.error("Address is required!");
    } else if (password.trim() === "") {
      toast.error("Password is required!");
    } else if (password.length < 6) {
      toast.error("Password must be at least 6 characters!");
    } else if (acceptTerms === false) {
      toast.error("Please accept terms and conditions!");
    } else {

  let emailmatch = false;

  axios
  .post(
    "http://localhost:5167/api/Patient/signup",
    patientData
  )
  .then((res) => {
    console.log(res.data);

    toast.success("Patient registration successful!");

    setTimeout(() => {
      navigate("/patient-login");
    }, 2000);
  })
  .catch((err) => {
    console.log(err);

    if (err.response?.status === 409) {
      toast.error("Email already exists!");
    } else {
      toast.error("Registration failed!");
    }
  });
  
    
    }
  }

  return (
    <div className="patient-signup-page">
      <PatientLoginSidebar />

      <div className="patient-signup-right">
        <div className="patient-signup-form">
          <NavLink to="/" className="patient-signup-logo-link">
            <div className="patient-signup-logo">
              <img src={medigopic} alt="MediGo Logo" />

              <h2>
                <span>Medi</span>Go
              </h2>
            </div>
          </NavLink>

          <h1>Create Account</h1>
          <p>Register as a patient to book appointments and manage your health.</p>

          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <label>Date of Birth</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />

          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <label>Phone Number</label>
          <input
            type="text"
            placeholder="01810000001"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Address</label>
          <input
            type="text"
            placeholder="Enter your address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <label>Password</label>
          <div className="patient-signup-password-box">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="patient-terms-row">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
            />

            <p>
              I accept{" "}
              <NavLink to="/terms">Terms of services</NavLink> and{" "}
              <NavLink to="/privacy">Privacy Policy</NavLink>
            </p>
          </div>

          <button
            type="button"
            className="patient-signup-btn"
            onClick={handleSignUp}
          >
            Sign Up
          </button>

          <p className="patient-login-text">
            Already have an account?{" "}
            <NavLink to="/patient-login">Log In</NavLink>
          </p>
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={1500} />
    </div>
  );
}

export default PatientSignUp;