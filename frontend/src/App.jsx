import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./view/Home/HomePage";
import ConsultationPage from "./view/Consultation/ConsultationPage";
import PharmacyPage from "./view/Pharmacy/PharmacyPage";
import HealthPlanPage from "./view/HealthPlan/HealthPlanPage";

import AdminLoginPage from "./view/Login/AdminLoginPage";
import DoctorLoginPage from "./view/Login/DoctorLoginPage";
import PatientLoginPage from "./view/Login/PatientLoginPage";

import DoctorSignUpPage from "./view/SignUp/DoctorSignUpPage";
import PatientSignUpPage from "./view/SignUp/PatientSignUpPage";
import DepartmentPage from "./view/Department/AllDeptPage";
import DeptPage from "./view/Department/AllDeptPage"
import DoctorDetails from "./view/Department/DoctorDetailsPage"
import AdminDashboard from "./view/Admin/Dashboard";
import AdminDoctors from "./view/Admin/DoctorFeature";
import AdminPatients from "./view/Admin/PatientFeature";
import AdminAppointmetns from "./view/Admin/AppointmentFeature";
import ForgotPassword from "./view/Login/ForgotPasswordPage";
import DoctorDashboard from "./view/Doctor/DoctorDashboard";
import DoctorAppointment from "./view/Doctor/DoctorAppointment";
import DoctorSettings from "./view/Doctor/DoctorSettings";
import PatientSettings from "./view/Patient/PatientSetting";
import AdminReports from "./view/Admin/AdminReports";
import AdminMedicine from "./view/Admin/AdminMedicine";
import PatientAccount from "./view/Patient/PatientAccount";
import MedicineOrderFeature from "./view/Admin/MedicineOrderFeature";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/consultation" element={<ConsultationPage />} />
        <Route path="/health-plan" element={<HealthPlanPage />} />
        <Route path="/pharmacy" element={<PharmacyPage />}/>
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
        <Route path="/admin-reports" element={<AdminReports />}/>
        <Route path="/admin-medicines" element={<AdminMedicine />}/>
        <Route path="/admin-medicine-orders" element={<MedicineOrderFeature />}/>

        <Route path="/patient-account" element={<PatientAccount />}/>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
