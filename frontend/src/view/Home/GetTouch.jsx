import "../../Style/HomeCSS/Home.css";
function Touch(){
    return (
        <section className="contact-section">
        <div className="contact-heading">
        <h2>Get in touch with us</h2>
        <p>
        We're here to help. Send your question below and we will reply as soon as possible.
        </p>
        </div>

        <form className="contact-form">
        <div className="form-row">
        <input type="text" placeholder="Name *" />
        <input type="email" placeholder="Email *" />
        </div>

        <select>
        <option>What is your concern?</option>
        <option>Doctor Consultation</option>
        <option>Appointment Booking</option>
        <option>Health Package</option>
        <option>Emergency Support</option>
        <option>Other</option>
        </select>

        <textarea placeholder="Your query *"></textarea>

        <button type="submit">Submit</button>
        </form>
        </section>
    );

}

export default Touch;