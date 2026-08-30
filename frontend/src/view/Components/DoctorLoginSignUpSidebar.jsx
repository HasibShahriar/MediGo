import "../../Style/ComponentsCSS/DoctorLoginSignUpSidebar.css";
import doctorImg from "../../assets/DoctorLogin.png";

function DoctorLoginSignUpSidebar() {
  return (
    <div className="auth-sidebar">
      <div className="auth-sidebar-image">
        <img src={doctorImg} alt="Doctor" />
      </div>

      <div className="auth-sidebar-content">
        <div className="auth-sidebar-logo">
          <span className="logo-circle"></span>
          <h2>MediGo</h2>
        </div>

        <div className="auth-sidebar-box">
          <h3>
            Welcome to <span>MediGo</span>
          </h3>

          <h2>Doctor Management System</h2>

          <p>
            Cloud based healthcare platform with centralized user friendly doctor
            portal.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DoctorLoginSignUpSidebar;