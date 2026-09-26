import "../../Style/ComponentsCSS/DoctorTopbar.css";

import defaultDoctorProfile
  from "../../assets/doctor-profile.png";

import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import axios from "axios";

import {
  FaChevronDown,
  FaSignOutAlt
} from "react-icons/fa";


const API_URL =
  "http://localhost:5138";


function DoctorTopbar() {

  const [
    openDropdown,
    setOpenDropdown
  ] = useState(false);


  const [
    doctorName,
    setDoctorName
  ] = useState("Doctor");


  const [
    profileImage,
    setProfileImage
  ] = useState(
    defaultDoctorProfile
  );


  const navigate =
    useNavigate();



  // =====================================================
  // BUILD PROFILE IMAGE URL
  // =====================================================

  function getProfileImageUrl(
    imagePath
  ) {

    if (!imagePath) {

      return defaultDoctorProfile;

    }


    // Already complete URL
    if (
      imagePath.startsWith("http://")
      ||
      imagePath.startsWith("https://")
    ) {

      return imagePath;

    }


    // Temporary browser image
    if (
      imagePath.startsWith("blob:")
      ||
      imagePath.startsWith("data:")
    ) {

      return imagePath;

    }


    // Convert:
    // uploads\doctors\doctor.jpg
    //
    // into:
    // uploads/doctors/doctor.jpg

    const cleanPath =
      imagePath
        .replace(
          /\\/g,
          "/"
        )
        .replace(
          /^\/+/,
          ""
        );


    return `${API_URL}/${cleanPath}`;

  }



  // =====================================================
  // ADD CACHE BUSTER
  // =====================================================

  function buildFreshImageUrl(
    imagePath
  ) {

    if (!imagePath) {

      return defaultDoctorProfile;

    }


    const imageUrl =
      getProfileImageUrl(
        imagePath
      );


    // Do not add query parameter
    // to blob/data images

    if (
      imageUrl.startsWith("blob:")
      ||
      imageUrl.startsWith("data:")
    ) {

      return imageUrl;

    }


    const separator =
      imageUrl.includes("?")
        ? "&"
        : "?";


    return (
      `${imageUrl}${separator}t=${Date.now()}`
    );

  }



  // =====================================================
  // LOAD DOCTOR INFORMATION
  // =====================================================

  async function loadDoctorInformation() {

    const storedDoctor =
      localStorage.getItem(
        "doctor"
      );


    // ===================================================
    // NO LOGGED-IN DOCTOR
    // ===================================================

    if (!storedDoctor) {

      setDoctorName(
        "Doctor"
      );


      setProfileImage(
        defaultDoctorProfile
      );


      return;

    }


    try {

      const doctor =
        JSON.parse(
          storedDoctor
        );


      if (!doctor?.id) {

        setDoctorName(
          "Doctor"
        );


        setProfileImage(
          defaultDoctorProfile
        );


        return;

      }



      // =================================================
      // FIRST SHOW LOCAL STORAGE INFORMATION
      // =================================================

      const localName =
        doctor.fullName
        ||
        `${doctor.title || ""} ${doctor.firstName || ""} ${doctor.lastName || ""}`
          .trim();


      setDoctorName(
        localName
        ||
        "Doctor"
      );



      // =================================================
      // FIRST SHOW LOCAL STORAGE PROFILE IMAGE
      // =================================================

      if (doctor.profileImage) {

        const localImageUrl =
          buildFreshImageUrl(
            doctor.profileImage
          );


        console.log(
          "Doctor Topbar Local Image:",
          localImageUrl
        );


        setProfileImage(
          localImageUrl
        );

      }

      else {

        setProfileImage(
          defaultDoctorProfile
        );

      }



      // =================================================
      // THEN FETCH LATEST DOCTOR INFORMATION
      // FROM DATABASE
      // =================================================

      const response =
        await axios.get(

          `${API_URL}/api/DoctorSettings/${doctor.id}`

        );


      const data =
        response.data;


      console.log(
        "Doctor Topbar Database Data:",
        data
      );



      // =================================================
      // DOCTOR NAME
      // =================================================

      const fullName =
        `${data.title || ""} ${data.firstName || ""} ${data.lastName || ""}`
          .trim();


      setDoctorName(

        fullName
        ||
        localName
        ||
        "Doctor"

      );



      // =================================================
      // PROFILE IMAGE
      // =================================================

      if (data.profileImage) {

        const databaseImageUrl =
          buildFreshImageUrl(
            data.profileImage
          );


        console.log(
          "Doctor Topbar Database Image:",
          databaseImageUrl
        );


        setProfileImage(
          databaseImageUrl
        );

      }

      else if (
        doctor.profileImage
      ) {

        // If backend response somehow has
        // no image but localStorage does,
        // keep the saved image.

        setProfileImage(

          buildFreshImageUrl(
            doctor.profileImage
          )

        );

      }

      else {

        setProfileImage(
          defaultDoctorProfile
        );

      }



      // =================================================
      // UPDATE LOCAL STORAGE
      // =================================================

      const updatedDoctor = {

        ...doctor,


        id:
          doctor.id,


        title:
          data.title
          ??
          doctor.title,


        firstName:
          data.firstName
          ??
          doctor.firstName,


        lastName:
          data.lastName
          ??
          doctor.lastName,


        fullName:
          fullName
          ||
          localName,


        email:
          data.email
          ??
          doctor.email,


        phone:
          data.phone
          ??
          doctor.phone,


        specialty:
          data.specialty
          ??
          doctor.specialty,


        // Most important:
        // keep the image if database
        // response does not contain one.

        profileImage:
          data.profileImage
          ||
          doctor.profileImage
          ||
          null

      };


      localStorage.setItem(

        "doctor",

        JSON.stringify(
          updatedDoctor
        )

      );

    }

    catch (error) {

      console.log(
        "Doctor Topbar Load Error:",
        error
      );


      console.log(
        "Backend:",
        error.response?.data
      );


      /*
        IMPORTANT:

        Do NOT immediately replace the image
        with the default image when the
        database request fails.

        The image stored in localStorage can
        still be valid.
      */

    }

  }



  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadDoctorInformation();



    // ===================================================
    // WHEN DOCTOR SETTINGS ARE UPDATED
    // ===================================================

    function handleDoctorUpdated() {

      console.log(
        "Doctor updated event received."
      );


      loadDoctorInformation();

    }


    window.addEventListener(

      "doctorUpdated",

      handleDoctorUpdated

    );


    return () => {

      window.removeEventListener(

        "doctorUpdated",

        handleDoctorUpdated

      );

    };

  }, []);



  // =====================================================
  // LOGOUT
  // =====================================================

  function handleLogout() {

    localStorage.removeItem(
      "doctor"
    );


    localStorage.removeItem(
      "doctorToken"
    );


    navigate(
      "/doctor-login",
      {
        replace: true
      }
    );

  }



  // =====================================================
  // IMAGE LOAD ERROR
  // =====================================================

  function handleImageError(
    event
  ) {

    console.log(
      "Doctor topbar image failed:"
    );


    console.log(
      event.currentTarget.src
    );


    // Stop an infinite onError loop

    event.currentTarget.onerror =
      null;


    event.currentTarget.src =
      defaultDoctorProfile;

  }



  // =====================================================
  // JSX
  // =====================================================

  return (

    <div className="doctor-topbar">


      {/* =================================================
          LEFT SIDE
      ================================================= */}

      <div className="doctor-topbar-left">


        <p>
          Welcome back
        </p>


        <h2>

          {doctorName} 👋

        </h2>


      </div>



      {/* =================================================
          RIGHT PROFILE
      ================================================= */}

      <div className="doctor-profile-area">


        <div

          className="doctor-profile-click"

          onClick={
            () =>
              setOpenDropdown(
                previous =>
                  !previous
              )
          }

        >


          <img

            src={
              profileImage
            }

            alt={
              `${doctorName} Profile`
            }

            onError={
              handleImageError
            }

          />


          <FaChevronDown

            className="doctor-dropdown-icon"

          />


        </div>



        {/* =================================================
            DROPDOWN
        ================================================= */}

        {
          openDropdown
          &&

          (

            <div className="doctor-profile-dropdown">


              <button

                type="button"

                className="doctor-logout-link"

                onClick={
                  handleLogout
                }

              >

                <FaSignOutAlt />


                <span>
                  Logout
                </span>


              </button>


            </div>

          )
        }


      </div>


    </div>

  );

}


export default DoctorTopbar;