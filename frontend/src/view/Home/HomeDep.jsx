import "../../Style/HomeCSS/Home.css";
import {
  FaUserMd,
  FaBaby,
  FaFemale,
  FaAllergies,
  FaCapsules,
  FaChartLine,
  FaEllipsisH,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";


function Dept(){
    return (
        <section className="speciality-section">
        
        <div className="speciality-grid">
        
        <NavLink to="/Dept/general-physician"  className="speciality-link">
        <div className="speciality-card">
        <FaUserMd className="speciality-icon" />
        <h3>General Physician</h3>
        <p>Primary Care Physician</p>
        </div>
        </NavLink>

        <NavLink to="/Dept/pediatrics"    className="speciality-link">
        <div className="speciality-card">
        <FaBaby className="speciality-icon" />
        <h3>Pediatrics</h3>
        <p>Child Health Care</p>
        </div>
        </NavLink>

        <NavLink to="/Dept/gyne-&-obs"    className="speciality-link">
        <div className="speciality-card">
        <FaFemale className="speciality-icon" />
        <h3>Gyne & Obs</h3>
        <p>Women's Health Care</p>
        </div>
        </NavLink>

        <NavLink to="/Dept/dermatology"   className="speciality-link">
        <div className="speciality-card">
        <FaAllergies className="speciality-icon" />
        <h3>Dermatology</h3>
        <p>Skin & Hair</p>
        </div>
        </NavLink>

        <NavLink  to="/Dept/internal-medicine"  className="speciality-link">
        <div className="speciality-card">
        <FaCapsules className="speciality-icon" />
        <h3>Internal Medicine</h3>
        <p>General Health & Medicine</p>
        </div>
        </NavLink>

        <NavLink  to="/Dept/cardiology"  className="speciality-link">
        <div className="speciality-card">
        <FaChartLine className="speciality-icon" />
        <h3>Endocrinology</h3>
        <p>Diabetes, Thyroid & Hormone</p>
        </div>
        </NavLink>

        <NavLink to="/consultation"   className="speciality-link">
        <div className="speciality-card">
        <FaEllipsisH className="speciality-icon" />
        <h3>More</h3>
        <p>Explore many more...</p>
        </div>
        </NavLink>

        </div>
        </section>
    );
}

export default Dept;
