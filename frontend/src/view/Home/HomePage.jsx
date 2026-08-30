import "../../Style/HomeCSS/Home.css";
import Nav from "../Components/Nav";
import healthPlanImg from "../../assets/HealthPlan.png";
import Faq from "../Home/FaqLogic";
import Touch from "../Home/GetTouch";
import Footer from "../Components/Footer";
import Dept from "../Home/HomeDep";
import { useEffect,useState } from "react";
import { FaChevronLeft, FaChevronRight} from "react-icons/fa";
import { FaUserDoctor, FaCalendarCheck, FaHeartPulse, FaTruckMedical} from "react-icons/fa6";
import {FaRegClock, FaLaptopMedical, FaRegStar } from "react-icons/fa6";
import { FiDownload } from "react-icons/fi";
import { NavLink } from "react-router-dom";

function Home(){
    useEffect(() => {
      document.title = "MediGo | Home";
    }, []);

    const images=[
        "/HeroSlides/banner1.jpg",
        "/HeroSlides/banner2.jpg",
        "/HeroSlides/banner3.jpg",
        "/HeroSlides/banner4.jpg",
        "/HeroSlides/banner5.jpg"
    ];

    const[currentSlide,setCurrentSlide]=useState(0);

    useEffect(() => {
    const timer = setInterval(() => {
    setCurrentSlide((prevSlide) =>
    prevSlide === images.length - 1 ? 0 : prevSlide + 1);
    }, 3000);

    return () => clearInterval(timer);
    }, []);
    
    function previous_slide(){
        setCurrentSlide(currentSlide==0 ? images.length-1:currentSlide-1);
    }

    function next_slide(){
        setCurrentSlide(currentSlide==images.length-1? 0:currentSlide+1);
    }

    return (
        <div>
        <Nav/>
        <div className="photo-slider">
        <button className="slider-btn left-btn" onClick={previous_slide}>
        <FaChevronLeft />
        </button>

        <img src={images[currentSlide]} alt="MediGo Banner" className="slider-image" />

        <button className="slider-btn right-btn" onClick={next_slide}>
        <FaChevronRight />
        </button>
        </div>


        <section className="service-section">
        <NavLink to="/consultation" className="service-link">
        <div className="service-card">
        <div className="service-icon">
        <FaUserDoctor />
        </div>
        <h3>Online Doctor Consultation</h3>
        <p>Consult verified doctors online from home anytime.</p>
        </div>
        </NavLink>


        <NavLink to="/consultation" className="service-link">
        <div className="service-card">
        <div className="service-icon">
        <FaCalendarCheck />
        </div>
        <h3>Book Doctor Appointment</h3>
        <p>Find doctors by specialty and book appointments easily.</p>
        </div>
        </NavLink>

        <NavLink to="/health-plan" className="service-link">
        <div className="service-card">
        <div className="service-icon">
        <FaHeartPulse />
        </div>
        <h3>Health Packages</h3>
        <p>Choose affordable health checkup plans for your family.</p>
        </div>
        </NavLink>


        <NavLink to="/health-plan" className="service-link">
        <div className="service-card">
        <div className="service-icon">
        <FaTruckMedical />
        </div>
        <h3>Emergency Support</h3>
        <p>Get quick medical support during urgent health situations.</p>
        </div>
        </NavLink>
        </section>


        <section className="stats-section">
        <div className="stats-card">
        <div className="stats-icon">
        <FaUserDoctor />
        </div>
        <h2>500+</h2>
        <p>Verified Doctors</p>
        </div>

        <div className="stats-card">
        <div className="stats-icon">
        <FaRegClock />
        </div>
        <h2>15 Minutes</h2>
        <p>Average Waiting Time</p>
        </div>

        <div className="stats-card">
        <div className="stats-icon">
        <FaLaptopMedical />
        </div>
        <h2>10K+</h2>
        <p>Online Consultations</p>
        </div>

        <div className="stats-card">
        <div className="stats-icon">
        <FaRegStar />
        </div>
        <h2>95%</h2>
        <p>Patient Satisfaction</p>
        </div>

        <div className="stats-card">
        <div className="stats-icon">
        <FiDownload />
        </div>
        <h2>1M+</h2>
        <p>App Downloads</p>
        </div>
        </section>

        <Dept/>


        <section className="premium-section">
        <div className="premium-image">
        <img src={healthPlanImg} alt="MediGo Health Package" />
        </div>
        <div className="premium-content">
        <p className="premium-small-title">Become a Premium Member</p>
        <h2>
        A secure future for you <br />
        and your family
        </h2>
        <p className="premium-description">
        MediGo brings modern healthcare services for families with online doctor
        consultation, appointment booking, emergency support, and affordable
        health packages. Choose the best healthcare plan based on your needs.
        </p>
        <navLink className="premium-btn">View All Packages</navLink>
        </div>
        </section>


        <Faq/>
        <Touch/>
        <Footer/>

        
        </div>
        
    );
}

export default Home;