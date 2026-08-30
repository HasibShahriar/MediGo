import "../../Style/ComponentsCSS/DoctorSidebar.css";
import { NavLink } from "react-router-dom";

import { MdDashboard } from "react-icons/md";
import { FaCalendarCheck } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { FaUserDoctor } from "react-icons/fa6";
import { HiMenuAlt3 } from "react-icons/hi";

function DoctorSidebar() {
  return (
    <aside className="doctor-sidebar">
      <div className="doctor-sidebar-logo">
        <div className="doctor-logo-icon">
          <FaUserDoctor />
        </div>

        <h2>MediGo</h2>

        
      </div>

      <nav className="doctor-sidebar-menu">
        <NavLink
          to="/doctor-dashboard"
          className={({ isActive }) =>
            isActive ? "doctor-menu-link doctor-menu-active" : "doctor-menu-link"
          }
        >
          <MdDashboard />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/doctor-appointments"
          className={({ isActive }) =>
            isActive ? "doctor-menu-link doctor-menu-active" : "doctor-menu-link"
          }
        >
          <FaCalendarCheck />
          <span>Appointment</span>
        </NavLink>

        <NavLink
          to="/doctor-settings"
          className={({ isActive }) =>
            isActive ? "doctor-menu-link doctor-menu-active" : "doctor-menu-link"
          }
        >
          <IoSettingsOutline />
          <span>Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default DoctorSidebar;