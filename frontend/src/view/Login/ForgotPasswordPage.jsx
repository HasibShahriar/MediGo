import "../../Style/LoginCSS/ForgotPasswordPage.css";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import medigopic from "../../assets/medigo.png";
import DoctorLoginSidebar from "../Components/DoctorLoginSignUpSidebar";
import PatientLoginSidebar from "../Components/PatientLoginSidebar";
import { IoSendOutline } from "react-icons/io5";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ForgotPassword(props) {
  const [email, setEmail] = useState("");

  useEffect(() => {
    document.title = "MediGo | Recover Password";
  }, []);

  

  function handleSend() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.trim() === "") {
      toast.error("Email is required!");
    } else if (!emailPattern.test(email)) {
      toast.error("Please enter a valid email!");
    } else {
      toast.success("Recovery email sent!");
    }
  }

  return (
    <div className="doctor-recover-page">
      {props.doctor ?<DoctorLoginSidebar />:<PatientLoginSidebar/> }

      <div className="doctor-recover-right">
        <div className="doctor-recover-form">
          <NavLink to="/" className="doctor-recover-logo-link">
            <div className="doctor-recover-logo">
              <img src={medigopic} alt="MediGo Logo" />
              <h2>
                <span>Medi</span>Go
              </h2>
            </div>
          </NavLink>

          <h1>Recover Password</h1>

          <input
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="button"
            className="doctor-recover-btn"
            onClick={handleSend}
          >
            <span className="doctor-recover-sent">
              <IoSendOutline />
            </span>
            Send
          </button>
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
}

export default ForgotPassword;