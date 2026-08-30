import "../../Style/PatientCSS/patientSetting.css";

import axios from "axios";

import {
  useEffect,
  useRef,
  useState
} from "react";

import Nav from "../Components/Nav";
import Footer from "../Components/Footer";

import defaultProfile from "../../assets/default_patient.png";

import {
  FaUser,
  FaCamera,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import {
  ToastContainer,
  toast
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";


const API_BASE_URL = "http://localhost:5138";


// =====================================================
// BUILD CORRECT IMAGE URL
// =====================================================
function getProfileImageUrl(imagePath) {

  if (!imagePath) {
    return defaultProfile;
  }


  // Temporary browser preview
  if (
    imagePath.startsWith("blob:") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }


  // Already complete URL
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }


  // SQL may contain:
  // uploads/patients/image.jpg
  // /uploads/patients/image.jpg
  // uploads\patients\image.jpg

  const cleanPath = imagePath
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");


  return `${API_BASE_URL}/${cleanPath}`;
}



function PatientSetting() {

  const [activeTab, setActiveTab] =
    useState("general");


  const [patient, setPatient] =
    useState(null);


  const [loading, setLoading] =
    useState(true);



  // =====================================================
  // GENERAL INFORMATION
  // =====================================================

  const [firstName, setFirstName] =
    useState("");


  const [lastName, setLastName] =
    useState("");


  const [email, setEmail] =
    useState("");


  const [phone, setPhone] =
    useState("");


  const [address, setAddress] =
    useState("");



  // =====================================================
  // PROFILE IMAGE
  // =====================================================

  const [profileImage, setProfileImage] =
    useState(defaultProfile);


  const [selectedImage, setSelectedImage] =
    useState(null);


  const fileInputRef =
    useRef(null);


  const previewUrlRef =
    useRef(null);



  // =====================================================
  // PASSWORD
  // =====================================================

  const [
    currentPassword,
    setCurrentPassword
  ] = useState("");


  const [
    newPassword,
    setNewPassword
  ] = useState("");


  const [
    confirmPassword,
    setConfirmPassword
  ] = useState("");


  const [
    showCurrentPassword,
    setShowCurrentPassword
  ] = useState(false);


  const [
    showNewPassword,
    setShowNewPassword
  ] = useState(false);


  const [
    showConfirmPassword,
    setShowConfirmPassword
  ] = useState(false);



  // =====================================================
  // LOAD PATIENT FROM DATABASE
  // =====================================================

  useEffect(() => {

    document.title =
      "MediGo | Patient Settings";


    const savedPatient =
      localStorage.getItem("patient");


    if (!savedPatient) {

      setLoading(false);

      return;
    }


    let localPatient;


    try {

      localPatient =
        JSON.parse(savedPatient);

    }
    catch {

      localStorage.removeItem("patient");

      setLoading(false);

      return;
    }


    if (!localPatient?.id) {

      setLoading(false);

      return;
    }


    axios
      .get(
        `${API_BASE_URL}/api/Patient/${localPatient.id}`
      )

      .then((res) => {

        const patientData =
          res.data;


        console.log(
          "Patient from database:",
          patientData
        );


        console.log(
          "ProfileImage from database:",
          patientData.profileImage
        );


        setPatient(patientData);



        // ==============================================
        // FULL NAME → FIRST NAME + LAST NAME
        // ==============================================

        const names =
          patientData.fullName
            ? patientData.fullName
                .trim()
                .split(/\s+/)
            : [];


        setFirstName(
          names[0] || ""
        );


        setLastName(
          names
            .slice(1)
            .join(" ")
        );


        setEmail(
          patientData.email || ""
        );


        setPhone(
          patientData.phone || ""
        );


        setAddress(
          patientData.address || ""
        );



        // ==============================================
        // PROFILE IMAGE
        // ==============================================

        const imageUrl =
          getProfileImageUrl(
            patientData.profileImage
          );


        console.log(
          "Image URL being used:",
          imageUrl
        );


        setProfileImage(
          imageUrl
        );



        // Keep localStorage synchronized
        localStorage.setItem(
          "patient",
          JSON.stringify(
            patientData
          )
        );


        setLoading(false);

      })

      .catch((err) => {

        console.log(
          "Patient Load Error:",
          err
        );


        console.log(
          "Backend:",
          err.response?.data
        );


        toast.error(
          "Could not load patient information!"
        );


        setLoading(false);

      });


    // Cleanup temporary preview URL
    return () => {

      if (previewUrlRef.current) {

        URL.revokeObjectURL(
          previewUrlRef.current
        );

      }

    };

  }, []);



  // =====================================================
  // UPDATE GENERAL INFORMATION
  // =====================================================

  function handleGeneralUpdate() {

    if (!firstName.trim()) {

      toast.error(
        "First name is required!"
      );

      return;
    }


    if (!lastName.trim()) {

      toast.error(
        "Last name is required!"
      );

      return;
    }


    if (!email.trim()) {

      toast.error(
        "Email is required!"
      );

      return;
    }


    if (!phone.trim()) {

      toast.error(
        "Mobile number is required!"
      );

      return;
    }


    if (!address.trim()) {

      toast.error(
        "Address is required!"
      );

      return;
    }


    const updateData = {

      fullName:
        `${firstName.trim()} ${lastName.trim()}`,

      email:
        email.trim(),

      phone:
        phone.trim(),

      address:
        address.trim()

    };


    axios
      .put(
        `${API_BASE_URL}/api/Patient/${patient.id}/profile`,
        updateData
      )

      .then((res) => {

        const updatedPatient =
          res.data.patient;


        setPatient(
          updatedPatient
        );


        setEmail(
          updatedPatient.email || ""
        );


        setPhone(
          updatedPatient.phone || ""
        );


        setAddress(
          updatedPatient.address || ""
        );


        localStorage.setItem(
          "patient",
          JSON.stringify(
            updatedPatient
          )
        );


        window.dispatchEvent(
          new Event(
            "patientUpdated"
          )
        );


        toast.success(
          "Profile updated successfully!"
        );

      })

      .catch((err) => {

        console.log(
          "Profile Update Error:",
          err
        );


        toast.error(
          err.response?.data?.message ||
          "Could not update profile!"
        );

      });

  }



  // =====================================================
  // CHOOSE PROFILE IMAGE
  // =====================================================

  function handleImageChange(e) {

    const file =
      e.target.files?.[0];


    if (!file) {
      return;
    }


    const allowedTypes = [
      "image/jpeg",
      "image/png"
    ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      toast.error(
        "Only JPG, JPEG and PNG images are allowed!"
      );

      e.target.value = "";

      return;
    }


    // Maximum 5 MB
    if (
      file.size >
      5 * 1024 * 1024
    ) {

      toast.error(
        "Image must be smaller than 5 MB!"
      );

      e.target.value = "";

      return;
    }


    setSelectedImage(file);


    // Remove previous preview URL
    if (previewUrlRef.current) {

      URL.revokeObjectURL(
        previewUrlRef.current
      );

    }


    const previewUrl =
      URL.createObjectURL(file);


    previewUrlRef.current =
      previewUrl;


    // Immediately preview selected picture
    setProfileImage(
      previewUrl
    );


    console.log(
      "Selected image:",
      file
    );


    console.log(
      "Preview URL:",
      previewUrl
    );

  }



  // =====================================================
  // SAVE PROFILE IMAGE
  // =====================================================

  function handleProfileImageSave() {

    if (!selectedImage) {

      toast.error(
        "Please choose a picture first!"
      );

      return;
    }


    if (!patient?.id) {

      toast.error(
        "Patient information is missing!"
      );

      return;
    }


    const formData =
      new FormData();


    formData.append(
      "image",
      selectedImage
    );


    axios
      .post(
        `${API_BASE_URL}/api/Patient/${patient.id}/profile-image`,
        formData
      )

      .then((res) => {

        console.log(
          "Image Upload Response:",
          res.data
        );


        const imagePath =
          res.data.profileImage;


        console.log(
          "Database image path:",
          imagePath
        );


        // Create real backend URL
        const realImageUrl =
          getProfileImageUrl(
            imagePath
          );


        /*
          Cache-buster.

          Example:

          http://localhost:5167/uploads/patients/image.jpg?t=123456

          This makes sure the browser loads the latest image.
        */

        const imageWithCacheBuster =
          `${realImageUrl}?t=${Date.now()}`;


        console.log(
          "Final image URL:",
          imageWithCacheBuster
        );


        const updatedPatient = {

          ...patient,

          profileImage:
            imagePath

        };


        setPatient(
          updatedPatient
        );


        // Show saved backend picture
        setProfileImage(
          imageWithCacheBuster
        );


        // Store only relative path locally
        localStorage.setItem(
          "patient",
          JSON.stringify(
            updatedPatient
          )
        );


        // Tell navbar
        window.dispatchEvent(
          new Event(
            "patientUpdated"
          )
        );


        // Clean temporary preview URL
        if (previewUrlRef.current) {

          URL.revokeObjectURL(
            previewUrlRef.current
          );


          previewUrlRef.current =
            null;

        }


        setSelectedImage(
          null
        );


        // Reset file input
        if (fileInputRef.current) {

          fileInputRef.current.value =
            "";

        }


        toast.success(
          "Profile picture updated successfully!"
        );

      })

      .catch((err) => {

        console.log(
          "Image Upload Error:",
          err
        );


        console.log(
          "Backend Error:",
          err.response?.data
        );


        toast.error(
          err.response?.data?.message ||
          "Could not upload profile picture!"
        );

      });

  }



  // =====================================================
  // IMAGE ERROR FALLBACK
  // =====================================================

  function handleProfileImageError(e) {

    console.log(
      "IMAGE FAILED TO LOAD:"
    );


    console.log(
      e.currentTarget.src
    );


    e.currentTarget.onerror =
      null;


    e.currentTarget.src =
      defaultProfile;

  }



  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  function handlePasswordUpdate() {

    if (
      !currentPassword.trim()
    ) {

      toast.error(
        "Current password is required!"
      );

      return;
    }


    if (
      !newPassword.trim()
    ) {

      toast.error(
        "New password is required!"
      );

      return;
    }


    if (
      newPassword.length < 6
    ) {

      toast.error(
        "New password must be at least 6 characters!"
      );

      return;
    }


    if (
      !confirmPassword.trim()
    ) {

      toast.error(
        "Please confirm your new password!"
      );

      return;
    }


    if (
      newPassword !==
      confirmPassword
    ) {

      toast.error(
        "New passwords do not match!"
      );

      return;
    }


    axios
      .put(
        `${API_BASE_URL}/api/Patient/${patient.id}/password`,
        {
          currentPassword,
          newPassword
        }
      )

      .then((res) => {

        toast.success(
          res.data.message ||
          "Password changed successfully!"
        );


        setCurrentPassword("");

        setNewPassword("");

        setConfirmPassword("");

      })

      .catch((err) => {

        console.log(
          "Password Error:",
          err
        );


        toast.error(
          err.response?.data?.message ||
          "Could not change password!"
        );

      });

  }



  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <>

        <Nav />


        <div className="patient-settings-loading">

          Loading...

        </div>


        <Footer />

      </>

    );

  }



  // =====================================================
  // NOT LOGGED IN
  // =====================================================

  if (!patient) {

    return (

      <>

        <Nav />


        <div className="patient-settings-login-required">

          <h2>
            Please login first.
          </h2>

        </div>


        <Footer />

      </>

    );

  }



  return (

    <>

      <Nav />


      <main className="patient-settings-page">


        <div className="patient-settings-container">


          {/* ==========================================
              LEFT PATIENT PROFILE
          ========================================== */}

          <aside className="patient-settings-profile-card">


            <img

              src={profileImage}

              alt="Patient Profile"

              className="patient-settings-avatar"

              onError={
                handleProfileImageError
              }

            />


            <h2>

              {firstName} {lastName}

            </h2>


            <p>

              {email}

            </p>


          </aside>



          {/* ==========================================
              RIGHT SETTINGS
          ========================================== */}

          <section className="patient-settings-content">



            {/* ========================================
                TABS
            ======================================== */}

            <div className="patient-settings-tabs">


              <button

                type="button"

                className={
                  activeTab === "general"
                    ? "patient-settings-tab active"
                    : "patient-settings-tab"
                }

                onClick={() =>
                  setActiveTab("general")
                }

              >

                <FaUser />

                General

              </button>



              <button

                type="button"

                className={
                  activeTab === "picture"
                    ? "patient-settings-tab active"
                    : "patient-settings-tab"
                }

                onClick={() =>
                  setActiveTab("picture")
                }

              >

                <FaCamera />

                Profile Picture

              </button>



              <button

                type="button"

                className={
                  activeTab === "password"
                    ? "patient-settings-tab active"
                    : "patient-settings-tab"
                }

                onClick={() =>
                  setActiveTab("password")
                }

              >

                <FaLock />

                Password

              </button>


            </div>



            {/* ==========================================
                GENERAL TAB
            ========================================== */}

            {
              activeTab ===
              "general" && (

                <div className="patient-settings-tab-content">


                  <div className="patient-settings-heading">

                    <h1>
                      General Information
                    </h1>


                    <p>
                      Update your personal information.
                    </p>

                  </div>



                  <div className="patient-settings-form-grid">


                    <div className="patient-settings-input-group">


                      <label>
                        First Name
                      </label>


                      <input

                        type="text"

                        value={firstName}

                        onChange={(e) =>
                          setFirstName(
                            e.target.value
                          )
                        }

                      />


                    </div>



                    <div className="patient-settings-input-group">


                      <label>
                        Last Name
                      </label>


                      <input

                        type="text"

                        value={lastName}

                        onChange={(e) =>
                          setLastName(
                            e.target.value
                          )
                        }

                      />


                    </div>



                    <div className="patient-settings-input-group">


                      <label>
                        Email Address
                      </label>


                      <input

                        type="email"

                        value={email}

                        onChange={(e) =>
                          setEmail(
                            e.target.value
                          )
                        }

                      />


                    </div>



                    <div className="patient-settings-input-group">


                      <label>
                        Mobile Number
                      </label>


                      <input

                        type="text"

                        value={phone}

                        onChange={(e) =>
                          setPhone(
                            e.target.value
                          )
                        }

                      />


                    </div>



                    <div className="patient-settings-input-group full-width">


                      <label>
                        Address
                      </label>


                      <textarea

                        rows="4"

                        value={address}

                        onChange={(e) =>
                          setAddress(
                            e.target.value
                          )
                        }

                      />


                    </div>


                  </div>



                  <button

                    type="button"

                    className="patient-settings-save-btn"

                    onClick={
                      handleGeneralUpdate
                    }

                  >

                    Save Changes

                  </button>


                </div>

              )
            }



            {/* ==========================================
                PROFILE PICTURE TAB
            ========================================== */}

            {
              activeTab ===
              "picture" && (

                <div className="patient-settings-tab-content">


                  <div className="patient-settings-heading">


                    <h1>
                      Profile Picture
                    </h1>


                    <p>
                      Choose and upload your profile picture.
                    </p>


                  </div>



                  <div className="patient-picture-section">


                    <img

                      src={profileImage}

                      alt="Profile Preview"

                      className="patient-picture-preview"

                      onError={
                        handleProfileImageError
                      }

                    />


                    <input

                      ref={fileInputRef}

                      type="file"

                      accept=".jpg,.jpeg,.png"

                      hidden

                      onChange={
                        handleImageChange
                      }

                    />



                    <div className="patient-picture-buttons">


                      <button

                        type="button"

                        className="patient-picture-select-btn"

                        onClick={() =>
                          fileInputRef
                            .current
                            ?.click()
                        }

                      >

                        <FaCamera />

                        Choose Picture

                      </button>



                      <button

                        type="button"

                        className="patient-settings-save-btn picture-save-btn"

                        onClick={
                          handleProfileImageSave
                        }

                      >

                        Save Picture

                      </button>


                    </div>



                    <p className="patient-picture-note">

                      JPG, JPEG and PNG.
                      Maximum 5 MB.

                    </p>


                  </div>


                </div>

              )
            }



            {/* ==========================================
                PASSWORD TAB
            ========================================== */}

            {
              activeTab ===
              "password" && (

                <div className="patient-settings-tab-content">


                  <div className="patient-settings-heading">


                    <h1>
                      Change Password
                    </h1>


                    <p>
                      Change your account password securely.
                    </p>


                  </div>



                  <div className="patient-password-settings-form">



                    {/* CURRENT PASSWORD */}

                    <div className="patient-settings-input-group">


                      <label>
                        Current Password
                      </label>


                      <div className="patient-settings-password-box">


                        <input

                          type={
                            showCurrentPassword
                              ? "text"
                              : "password"
                          }

                          value={
                            currentPassword
                          }

                          placeholder="Enter current password"

                          onChange={(e) =>
                            setCurrentPassword(
                              e.target.value
                            )
                          }

                        />


                        <span

                          onClick={() =>
                            setShowCurrentPassword(
                              !showCurrentPassword
                            )
                          }

                        >

                          {
                            showCurrentPassword
                              ? <FaEyeSlash />
                              : <FaEye />
                          }

                        </span>


                      </div>


                    </div>



                    {/* NEW PASSWORD */}

                    <div className="patient-settings-input-group">


                      <label>
                        New Password
                      </label>


                      <div className="patient-settings-password-box">


                        <input

                          type={
                            showNewPassword
                              ? "text"
                              : "password"
                          }

                          value={
                            newPassword
                          }

                          placeholder="Enter new password"

                          onChange={(e) =>
                            setNewPassword(
                              e.target.value
                            )
                          }

                        />


                        <span

                          onClick={() =>
                            setShowNewPassword(
                              !showNewPassword
                            )
                          }

                        >

                          {
                            showNewPassword
                              ? <FaEyeSlash />
                              : <FaEye />
                          }

                        </span>


                      </div>


                    </div>



                    {/* CONFIRM PASSWORD */}

                    <div className="patient-settings-input-group">


                      <label>
                        Confirm New Password
                      </label>


                      <div className="patient-settings-password-box">


                        <input

                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }

                          value={
                            confirmPassword
                          }

                          placeholder="Confirm new password"

                          onChange={(e) =>
                            setConfirmPassword(
                              e.target.value
                            )
                          }

                        />


                        <span

                          onClick={() =>
                            setShowConfirmPassword(
                              !showConfirmPassword
                            )
                          }

                        >

                          {
                            showConfirmPassword
                              ? <FaEyeSlash />
                              : <FaEye />
                          }

                        </span>


                      </div>


                    </div>



                    <button

                      type="button"

                      className="patient-settings-save-btn"

                      onClick={
                        handlePasswordUpdate
                      }

                    >

                      Update Password

                    </button>


                  </div>


                </div>

              )
            }


          </section>


        </div>


      </main>


      <Footer />


      <ToastContainer
        position="bottom-right"
        autoClose={1500}
      />


    </>

  );

}


export default PatientSetting;