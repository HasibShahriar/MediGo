import "../../Style/ComponentsCSS/DoctorTopbar.css";

import defaultDoctorProfile from "../../assets/doctor-profile.png";

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
  "http://localhost:5167";


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
  // BUILD IMAGE URL
  // =====================================================

  function getProfileImageUrl(
    imagePath
  ) {

    if (!imagePath) {

      return defaultDoctorProfile;

    }


    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://")
    ) {

      return imagePath;

    }


    if (
      imagePath.startsWith("blob:") ||
      imagePath.startsWith("data:")
    ) {

      return imagePath;

    }


    const cleanPath =
      imagePath
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");


    return `${API_URL}/${cleanPath}`;

  }



  // =====================================================
  // LOAD DOCTOR
  // =====================================================

  function loadDoctorInformation() {

    const storedDoctor =
      localStorage.getItem(
        "doctor"
      );


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


      if (!doctor.id) {

        return;

      }



      // =============================================
      // TEMPORARY DATA FROM LOCAL STORAGE
      // =============================================

      if (doctor.fullName) {

        setDoctorName(
          doctor.fullName
        );

      }
      else {

        const name =
          `${doctor.title || ""} ${doctor.firstName || ""} ${doctor.lastName || ""}`
            .trim();


        setDoctorName(
          name || "Doctor"
        );

      }



      if (doctor.profileImage) {

        setProfileImage(
          getProfileImageUrl(
            doctor.profileImage
          )
        );

      }



      // =============================================
      // GET LATEST DATA FROM DATABASE
      // =============================================

      axios
        .get(
          `${API_URL}/api/DoctorSettings/${doctor.id}`
        )

        .then((res) => {

          const data =
            res.data;


          console.log(
            "Topbar Doctor:",
            data
          );



          // =====================================
          // NAME
          // =====================================

          const fullName =
            `${data.title || ""} ${data.firstName || ""} ${data.lastName || ""}`
              .trim();


          setDoctorName(
            fullName || "Doctor"
          );



          // =====================================
          // PROFILE IMAGE
          // =====================================

          if (data.profileImage) {

            setProfileImage(
              getProfileImageUrl(
                data.profileImage
              )
            );

          }
          else {

            setProfileImage(
              defaultDoctorProfile
            );

          }



          // =====================================
          // UPDATE LOCAL STORAGE
          // =====================================

          const updatedDoctor = {

            ...doctor,

            title:
              data.title,

            firstName:
              data.firstName,

            lastName:
              data.lastName,

            fullName:
              fullName,

            email:
              data.email,

            phone:
              data.phone,

            profileImage:
              data.profileImage

          };


          localStorage.setItem(
            "doctor",
            JSON.stringify(
              updatedDoctor
            )
          );

        })

        .catch((err) => {

          console.log(
            "Topbar doctor load error:",
            err
          );

        });

    }

    catch (error) {

      console.log(
        "Doctor localStorage error:",
        error
      );

    }

  }



  // =====================================================
  // PAGE LOAD
  // =====================================================

  useEffect(() => {

    loadDoctorInformation();



    // ===============================================
    // LISTEN FOR SETTINGS CHANGES
    // ===============================================

    function handleDoctorUpdated() {

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


    window.dispatchEvent(
      new Event(
        "doctorUpdated"
      )
    );


    navigate(
      "/doctor-login",
      {
        replace: true
      }
    );

  }



  // =====================================================
  // JSX
  // =====================================================

  return (

    <div className="doctor-topbar">


      {/* =============================================
          LEFT
      ============================================= */}

      <div className="doctor-topbar-left">


        <p>
          Welcome back
        </p>


        <h2>

          {doctorName} 👋

        </h2>


      </div>



      {/* =============================================
          RIGHT PROFILE
      ============================================= */}

      <div className="doctor-profile-area">


        <div

          className="doctor-profile-click"

          onClick={() =>
            setOpenDropdown(
              !openDropdown
            )
          }

        >


          <img

            src={profileImage}

            alt="Doctor Profile"

            onError={(e) => {

              console.log(
                "Doctor topbar image failed:",
                e.currentTarget.src
              );


              e.currentTarget.src =
                defaultDoctorProfile;

            }}

          />


          <FaChevronDown

            className="doctor-dropdown-icon"

          />


        </div>



        {/* =============================================
            DROPDOWN
        ============================================= */}

        {openDropdown && (

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

        )}


      </div>


    </div>

  );

}


export default DoctorTopbar;