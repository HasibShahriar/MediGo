import "../../Style/ComponentsCSS/Footer.css";
import medigopic from "../../assets/medigo.png";

import { FaPhoneAlt, FaEnvelope, FaFacebookF, FaInstagram, FaYoutube, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">

        <div className="footer-brand">
          <div className="footer-logo">
            <img src={medigopic} alt="MediGo Logo" />
            <h2>
              <span className="footer-medi">Medi</span>
              <span className="footer-go">Go</span>
            </h2>
          </div>

          <p className="footer-about">
            MediGo is a trusted digital healthcare platform providing online
            consultation, doctor appointments, health packages and emergency support.
          </p>

          <p className="footer-contact">
            <FaPhoneAlt /> 09677885599
          </p>

          <p className="footer-contact">
            <FaEnvelope /> support@medigo.com
          </p>

          <div className="footer-social">
            <span><FaFacebookF /></span>
            <span><FaXTwitter /></span>
            <span><FaLinkedinIn /></span>
            <span><FaInstagram /></span>
            <span><FaYoutube /></span>
          </div>
        </div>

        <div className="footer-links">
          <a>Video Consultation</a>
          <a>Hospital Partners</a>
          <a>Gynecologists</a>
          <a>About MediGo</a>
          <a>Emergency Support</a>
        </div>

        <div className="footer-links">
          <a>All Specialities</a>
          <a>Medicine Specialists</a>
          <a>Pediatric Specialists</a>
          <a>FAQs</a>
          <a>Terms of Service</a>
        </div>

        <div className="footer-links">
          <a>Popular Doctors</a>
          <a>Dermatologists</a>
          <a>Health Blog</a>
          <a>Contact Us</a>
          <a>Privacy Policy</a>
        </div>

        <div className="footer-download">
          <div className="download-box">
            <small>Download on the</small>
            <strong>Google Play</strong>
          </div>

          <div className="download-box">
            <small>Download on the</small>
            <strong>App Store</strong>
          </div>

          <div className="download-box">
            <small>Available on the</small>
            <strong>Browser</strong>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        Copyright © 2026 MediGo. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;