import "../../Style/ComponentsCSS/AdminSidebar.css";
import { NavLink } from "react-router-dom";
import medigopic from "../../assets/medigo.png";

import {
  FaTachometerAlt,
  FaUserMd,
  FaUsers,
  FaCalendarCheck,
  FaSignOutAlt,
} from "react-icons/fa";

function AdminSidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      icon: <FaTachometerAlt />,
      path: "/admin-dashboard",
    },
    {
      name: "Doctor",
      icon: <FaUserMd />,
      path: "/admin-doctors",
    },
    {
      name: "Patient",
      icon: <FaUsers />,
      path: "/admin-patients",
    },
    {
      name: "Appointment",
      icon: <FaCalendarCheck />,
      path: "/admin-appointments",
    },
  ];

  return (
    
    <aside className="admin-sidebar">
      <NavLink to="/" className="admin-logo-link">
        <div className="admin-logo">
          <img src={medigopic} alt="MediGo Logo" />
          <h2>
            <span>Medi</span>Go
          </h2>
        </div>
      </NavLink>

      <div className="admin-profile">
        <div className="admin-avatar">A</div>
        <p>Super Admin</p>
      </div>

      <nav className="admin-menu">
        {menuItems.map((item, index) => (
          <NavLink to={item.path} className="admin-menu-link" key={index}>
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <NavLink to="/admin-login" className="admin-logout">
        <FaSignOutAlt />
        <span>Log Out</span>
      </NavLink>
    </aside>
  );
}

export default AdminSidebar;