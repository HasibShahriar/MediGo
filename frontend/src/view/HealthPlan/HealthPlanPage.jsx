import { useEffect } from "react";
import Nav from "../Components/Nav";
import Footer from "../Components/Footer";
import "../../Style/HealthPlanCSS/HealthPlanPage.css";

import { FaCheck } from "react-icons/fa6";
import { FaHandsHelping, FaShieldAlt, FaUsers, FaHeart } from "react-icons/fa";

function HealthPlanPage() {
  useEffect(() => {
    document.title = "MediGo | Health Plans";
  }, []);

  const plans = [
    {
      id: 1,
      name: "Jotno",
      price: 99,
      persons: "1 Person",
      icon: <FaHandsHelping />,
      features: [
        "Free 4 consultations with experienced General Physician doctors",
        "10% discount on any Specialist Doctor consultation",
      ],
    },
    {
      id: 2,
      name: "Astha",
      price: 175,
      persons: "1 Person",
      icon: <FaShieldAlt />,
      features: [
        "Free 8 consultations with experienced General Physician doctors",
        "10% discount on any Specialist Doctor consultation",
      ],
    },
    {
      id: 3,
      name: "Aponjon",
      price: 249,
      persons: "For 4 persons",
      icon: <FaUsers />,
      features: [
        "Free 8 consultations with experienced General Physician doctors",
        "10% discount on any Specialist Doctor consultation",
      ],
    },
    {
      id: 4,
      name: "Momota",
      price: 449,
      persons: "For Parents",
      icon: <FaHeart />,
      features: [
        "Free 8 consultations with experienced General Physician doctors",
        "Monthly 2 online health screening calls for your parents",
      ],
    },
  ];

  return (
    <div className="health-plan-wrapper">
      <Nav />

      <section className="health-plan-page">
        <h1>MediGo Health Care and Protect Plans</h1>

        <div className="health-plan-grid">
          {plans.map((plan) => (
            <div className="health-plan-card" key={plan.id}>
              <div className="plan-top">
                <div>
                  <h2>{plan.name}</h2>

                  <h3>
                    ৳ {plan.price}
                    <span>/monthly</span>
                  </h3>

                  <p>{plan.persons}</p>
                </div>

                <div className="plan-icon">{plan.icon}</div>
              </div>

              <div className="plan-features">
                {plan.features.map((feature, index) => (
                  <p key={index}>
                    <FaCheck />
                    {feature}
                  </p>
                ))}
              </div>

              <button className="subscribe-btn">Subscribe now</button>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default HealthPlanPage;