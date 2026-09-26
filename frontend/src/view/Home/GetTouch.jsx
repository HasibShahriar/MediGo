import "../../Style/HomeCSS/Home.css";

import {
  useEffect,
  useState
} from "react";

import axios from "axios";

import {
  ToastContainer,
  toast
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";


const API_URL =
  "http://localhost:5138";


function Touch() {

  const [
    patient,
    setPatient
  ] = useState(null);


  const [
    name,
    setName
  ] = useState("");


  const [
    email,
    setEmail
  ] = useState("");


  const [
    concern,
    setConcern
  ] = useState("");


  const [
    message,
    setMessage
  ] = useState("");


  const [
    sending,
    setSending
  ] = useState(false);



  // =====================================================
  // LOAD LOGGED-IN PATIENT
  // =====================================================

  useEffect(() => {

    const savedPatient =
      localStorage.getItem(
        "patient"
      );


    if (!savedPatient) {

      return;
    }


    try {

      const parsedPatient =
        JSON.parse(
          savedPatient
        );


      setPatient(
        parsedPatient
      );


      setName(
        parsedPatient.fullName
        ||
        ""
      );


      setEmail(
        parsedPatient.email
        ||
        ""
      );

    }

    catch (error) {

      console.log(
        "Patient Storage Error:",
        error
      );

    }

  }, []);



  // =====================================================
  // SEND REPORT TO ADMIN
  //
  // EXISTING BACKEND:
  // POST /api/contact
  //
  // Backend gets patient Name + Email from PatientId.
  // =====================================================

  async function handleSubmit(
    event
  ) {

    event.preventDefault();



    // =============================================
    // PATIENT MUST BE LOGGED IN
    // =============================================

    if (!patient?.id) {

      toast.error(
        "Please login as a patient before sending a report."
      );

      return;
    }



    if (!concern) {

      toast.error(
        "Please select your concern."
      );

      return;
    }



    if (!message.trim()) {

      toast.error(
        "Please write your query."
      );

      return;
    }



    setSending(
      true
    );


    try {

      const response =
        await axios.post(

          `${API_URL}/api/contact`,

          {
            patientId:
              patient.id,

            concern:
              concern,

            message:
              message.trim()
          }

        );


      console.log(
        "Contact Response:",
        response.data
      );


      toast.success(

        response.data?.message

        ||

        "Your report has been sent successfully."

      );


      // Clear only report information.
      // Patient information remains.

      setConcern("");

      setMessage("");

    }

    catch (error) {

      console.log(
        "Contact Message Error:",
        error
      );


      console.log(
        "Backend:",
        error.response?.data
      );


      toast.error(

        error.response?.data?.message

        ||

        "Could not send your report."

      );

    }

    finally {

      setSending(
        false
      );

    }

  }



  return (

    <section className="contact-section">


      <div className="contact-heading">


        <h2>
          Get in touch with us
        </h2>


        <p>

          We're here to help. Send your question below and
          we will reply as soon as possible.

        </p>


      </div>



      <form

        className="contact-form"

        onSubmit={
          handleSubmit
        }

      >


        <div className="form-row">


          <input

            type="text"

            placeholder="Name *"

            value={
              name
            }

            readOnly

          />



          <input

            type="email"

            placeholder="Email *"

            value={
              email
            }

            readOnly

          />


        </div>



        <select

          value={
            concern
          }

          onChange={
            event =>
              setConcern(
                event.target.value
              )
          }

        >


          <option value="">

            What is your concern?

          </option>


          <option value="Doctor Consultation">

            Doctor Consultation

          </option>


          <option value="Appointment Booking">

            Appointment Booking

          </option>


          <option value="Health Package">

            Health Package

          </option>


          <option value="Emergency Support">

            Emergency Support

          </option>


          <option value="Pharmacy">

            Pharmacy

          </option>


          <option value="Payment">

            Payment

          </option>


          <option value="Other">

            Other

          </option>


        </select>



        <textarea

          placeholder="Your query *"

          value={
            message
          }

          onChange={
            event =>
              setMessage(
                event.target.value
              )
          }

        >
        </textarea>



        <button

          type="submit"

          disabled={
            sending
          }

        >

          {
            sending
              ? "Sending..."
              : "Submit"
          }

        </button>


      </form>



      <ToastContainer

        position="bottom-right"

        autoClose={2200}

      />


    </section>

  );

}


export default Touch;