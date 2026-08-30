import "../../Style/HomeCSS/Home.css";
import {useState } from "react";
function Faq(){
    const [openFAQ, setOpenFAQ] = useState(null);

    const faqs = [
    {
        question: "What services does MediGo provide?",
        answer: "MediGo provides online doctor consultation, appointment booking, health packages, and emergency support.",
    },
    {
        question: "Are MediGo doctors verified?",
        answer: "Yes, all doctors are checked before providing consultation.",
    },
    {
        question: "Can I choose my own doctor?",
        answer: "Yes, you can select a doctor based on specialty and availability.",
    },
    ];

    return (
    <section className="faq-section">
    <div className="faq-heading">
    <h2>Have Any Questions?</h2>
    <p>
      Find below our frequently asked questions. If you have other questions,
      please contact us.
    </p>
    </div>

    <div className="faq-list">
    {faqs.map((faq, index) => (
      <div className="faq-item" key={index}>
        <div
          className="faq-question"
          onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
        >
          <h3>{faq.question}</h3>
          <span>{openFAQ === index ? "-" : "+"}</span>
        </div>

        {openFAQ === index && (
          <div className="faq-answer">
            <p>{faq.answer}</p>
          </div>
        )}
      </div>
    ))}
    </div>
    </section>
    );
}

export default Faq;