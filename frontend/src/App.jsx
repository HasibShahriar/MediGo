import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./View/Home/HomePage";
import ConsultationPage from "./View/Consultation/ConsultationPage";
import HomeDiagnosticPage from "./View/HomeDiagnostic/HomeDiagnosticPage";
import HealthPlanPage from "./View/HealthPlan/HealthPlanPage";

import AdminLoginPage from "./View/Login/AdminLoginPage";
import DoctorLoginPage from "./View/Login/DoctorLoginPage";
import PatientLoginPage from "./View/Login/PatientLoginPage";

import DoctorSignUpPage from "./View/SignUp/DoctorSignUpPage";
import PatientSignUpPage from "./View/SignUp/PatientSignUpPage";
import DepartmentPage from "./View/Department/AllDeptPage";
import DeptPage from "./View/Department/AllDeptPage"
import DoctorDetails from "./View/Department/DoctorDetailsPage"
import AdminDashboard from "./View/Admin/Dashboard";
import AdminDoctors from "./View/Admin/DoctorFeature";
import AdminPatients from "./View/Admin/PatientFeature";
import AdminAppointmetns from "./View/Admin/AppointmentFeature";
import ForgotPassword from "./View/Login/ForgotPasswordPage";
import DoctorDashboard from "./View/Doctor/DoctorDashboard";
import DoctorAppointment from "./View/Doctor/DoctorAppointment";
import DoctorSettings from "./View/Doctor/DoctorSettings";
import PatientSettings from "./View/Patient/PatientSetting";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/consultation" element={<ConsultationPage />} />
        <Route path="/health-plan" element={<HealthPlanPage />} />
        <Route path="/home-diagnostic" element={<HomeDiagnosticPage />} />
        <Route path="/Dept/:speciality" element={<DepartmentPage />} />
        <Route path="/doctor/:doctorSlug" element={<DoctorDetails />} />

        
        <Route path="/patient-signup" element={<PatientSignUpPage />} />
        <Route path="/patient-login" element={<PatientLoginPage />} />
        <Route path="/patient-forgot-password" element={<ForgotPassword doctor={false} />} />
        <Route path="/patient-settings" element={<PatientSettings/>}/>


        <Route path="/doctor-signup" element={<DoctorSignUpPage />} />
        <Route path="/doctor-login" element={<DoctorLoginPage />} />
        <Route path="/doctor-forgot-password" element={<ForgotPassword doctor={true}/>}/>
        <Route path="/doctor-dashboard" element={<DoctorDashboard/>}/>
        <Route path="/doctor-appointments" element={<DoctorAppointment/>}/>
        <Route path="/doctor-settings" element={<DoctorSettings/>}/>

        
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-doctors" element={<AdminDoctors />} />
        <Route path="/admin-patients" element={<AdminPatients />} />
        <Route path="/admin-appointments" element={<AdminAppointmetns />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;