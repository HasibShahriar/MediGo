import "../../Style/ComponentsCSS/PatientLoginSidebar.css";
import patientImg from "../../assets/PatientLogin.png";

function PatientLoginSidebar() {
  return (
    <div className="patient-login-sidebar">
      <img src={patientImg} alt="Patient Login" />

      <div className="patient-sidebar-overlay"></div>

      <div className="patient-sidebar-content">
        <div className="patient-sidebar-logo">
          <div className="patient-logo-icon"></div>
          <h2>MEDIGO</h2>
        </div>

        <p>
          Empowering Healthcare, One Click at a Time:
          <br />
          Your Health, Your Records, Your Control.
        </p>
      </div>
    </div>
  );
}

export default PatientLoginSidebar;