import Nav from "../Components/Nav";

import "../../Style/ConsultationCSS/ConsultationPage.css";

import {
  useEffect
} from "react";

import Footer from "../Components/Footer";

import {
  NavLink
} from "react-router-dom";

import {
  FaUserMd,
  FaBaby,
  FaFemale,
  FaAllergies,
  FaCapsules,
  FaBrain,
  FaHeartbeat,
  FaTooth,
  FaEye,
  FaRibbon,
  FaUsers,
  FaWheelchair
} from "react-icons/fa";


function Consultation() {

  useEffect(() => {

    document.title =
      "MediGo | Consultation";

  }, []);


  return (

    <div>


      <Nav />


      <section className="specialities-page">


        <h1>
          Please select a speciality
        </h1>


        <div className="specialities-grid">


          {/* GENERAL PHYSICIAN */}

          <NavLink
            to="/Dept/general-physician"
            className="speciality-link"
          >

            <div className="speciality-box">

              <FaUserMd className="speciality-page-icon" />

              <div>

                <h3>
                  General Physician
                </h3>

                <p>
                  Cold, flu, fever, headache,
                  infections and general health issues.
                </p>

              </div>

            </div>

          </NavLink>



          {/* PEDIATRICS */}

          <NavLink
            to="/Dept/pediatrics"
            className="speciality-link"
          >

            <div className="speciality-box">

              <FaBaby className="speciality-page-icon" />

              <div>

                <h3>
                  Pediatrics
                </h3>

                <p>
                  Children’s health, growth,
                  behavior and mental health care.
                </p>

              </div>

            </div>

          </NavLink>



          {/* GYNE & OBS */}

          <NavLink
            to="/Dept/gyne-obs"
            className="speciality-link"
          >

            <div className="speciality-box">

              <FaFemale className="speciality-page-icon" />

              <div>

                <h3>
                  Gyne & Obs
                </h3>

                <p>
                  Women’s health, pregnancy,
                  menstruation and fertility issues.
                </p>

              </div>

            </div>

          </NavLink>



          {/* DERMATOLOGY */}

          <NavLink
            to="/Dept/dermatology"
            className="speciality-link"
          >

            <div className="speciality-box">

              <FaAllergies className="speciality-page-icon" />

              <div>

                <h3>
                  Dermatology
                </h3>

                <p>
                  Treatment of skin, hair,
                  nail and cosmetic problems.
                </p>

              </div>

            </div>

          </NavLink>



          {/* INTERNAL MEDICINE */}

          <NavLink
            to="/Dept/internal-medicine"
            className="speciality-link"
          >

            <div className="speciality-box">

              <FaCapsules className="speciality-page-icon" />

              <div>

                <h3>
                  Internal Medicine
                </h3>

                <p>
                  Diagnosis and treatment of adult
                  health and complex illness.
                </p>

              </div>

            </div>

          </NavLink>



          {/* CARDIOLOGY */}

          <NavLink
            to="/Dept/cardiology"
            className="speciality-link"
          >

            <div className="speciality-box">

              <FaHeartbeat className="speciality-page-icon" />

              <div>

                <h3>
                  Cardiology
                </h3>

                <p>
                  Heart disease, blood pressure,
                  chest pain and heart failure.
                </p>

              </div>

            </div>

          </NavLink>



          {/* NEUROLOGY */}

          <NavLink
            to="/Dept/neurology"
            className="speciality-link"
          >

            <div className="speciality-box">

              <FaBrain className="speciality-page-icon" />

              <div>

                <h3>
                  Neurology
                </h3>

                <p>
                  Brain, nerves, headache,
                  stroke and neurological disorders.
                </p>

              </div>

            </div>

          </NavLink>



          {/* DENTISTRY */}

          <NavLink
            to="/Dept/dentistry"
            className="speciality-link"
          >

            <div className="speciality-box">

              <FaTooth className="speciality-page-icon" />

              <div>

                <h3>
                  Dentistry
                </h3>

                <p>
                  Teeth, gum, oral health
                  and dental treatment support.
                </p>

              </div>

            </div>

          </NavLink>



          {/* OPHTHALMOLOGY */}

          <NavLink
            to="/Dept/ophthalmology"
            className="speciality-link"
          >

            <div className="speciality-box">

              <FaEye className="speciality-page-icon" />

              <div>

                <h3>
                  Ophthalmology
                </h3>

                <p>
                  Eye disorders, vision problems
                  and eye health consultation.
                </p>

              </div>

            </div>

          </NavLink>



          {/* ONCOLOGY */}

          <NavLink
            to="/Dept/oncology"
            className="speciality-link"
          >

            <div className="speciality-box">

              <FaRibbon className="speciality-page-icon" />

              <div>

                <h3>
                  Oncology
                </h3>

                <p>
                  Cancer prevention, diagnosis,
                  treatment and consultation.
                </p>

              </div>

            </div>

          </NavLink>



          {/* FAMILY MEDICINE */}

          <NavLink
            to="/Dept/family-medicine"
            className="speciality-link"
          >

            <div className="speciality-box">

              <FaUsers className="speciality-page-icon" />

              <div>

                <h3>
                  Family Medicine
                </h3>

                <p>
                  Complete health care for
                  individuals and family members.
                </p>

              </div>

            </div>

          </NavLink>



          {/* PHYSICAL MEDICINE */}

          <NavLink
            to="/Dept/physical-medicine"
            className="speciality-link"
          >

            <div className="speciality-box">

              <FaWheelchair className="speciality-page-icon" />

              <div>

                <h3>
                  Physical Medicine
                </h3>

                <p>
                  Rehabilitation, movement, pain
                  and physical recovery support.
                </p>

              </div>

            </div>

          </NavLink>


        </div>


      </section>


      <Footer />


    </div>

  );

}


export default Consultation;