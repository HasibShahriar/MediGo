import "../../Style/DoctorCSS/DoctorSettings.css";

import DoctorSidebar from "../Components/DoctorSidebar";
import DoctorTopbar from "../Components/DoctorTopbar";

import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  FaCamera,
  FaSave,
  FaUser,
  FaLock,
  FaImage
} from "react-icons/fa";

import {
  ToastContainer,
  toast
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import axios from "axios";


const API_URL = "http://localhost:5138";


function DoctorSettings() {

  const navigate = useNavigate();


  // =====================================================
  // ACTIVE TAB
  // =====================================================

  const [activeTab, setActiveTab] =
    useState("general");


  // =====================================================
  // DOCTOR ID
  // =====================================================

  const [doctorId, setDoctorId] =
    useState(null);


  // =====================================================
  // EXISTING Doctors TABLE DATA
  // =====================================================

  const [title, setTitle] =
    useState("");

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [dateOfBirth, setDateOfBirth] =
    useState("");

  const [gender, setGender] =
    useState("");

  const [nationalId, setNationalId] =
    useState("");

  const [bmdcNumber, setBmdcNumber] =
    useState("");

  const [joinedAt, setJoinedAt] =
    useState("");


  // =====================================================
  // DoctorSettings TABLE DATA
  // =====================================================

  const [qualifications, setQualifications] =
    useState("");

  const [specialty, setSpecialty] =
    useState("");

  const [workingPlace, setWorkingPlace] =
    useState("");

  const [
    workingDescription,
    setWorkingDescription
  ] = useState("");

  const [
    experienceYears,
    setExperienceYears
  ] = useState("");

  const [bio, setBio] =
    useState("");

  const [
    instantConsultationMinutes,
    setInstantConsultationMinutes
  ] = useState("");

  const [
    appointmentConsultationMinutes,
    setAppointmentConsultationMinutes
  ] = useState("");

  const [
    consultationFee,
    setConsultationFee
  ] = useState("");

  const [
    followUpFee,
    setFollowUpFee
  ] = useState("");

  const [
    patientsAttended,
    setPatientsAttended
  ] = useState(0);

  const [
    doctorCode,
    setDoctorCode
  ] = useState("");


  // =====================================================
  // PROFILE IMAGE
  // =====================================================

  const [
    profileImage,
    setProfileImage
  ] = useState("");

  const [
    selectedImage,
    setSelectedImage
  ] = useState(null);


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


  // =====================================================
  // LOADING
  // =====================================================

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);


  // =====================================================
  // ONLY ALLOWED SPECIALTIES
  // =====================================================

  const specialtyOptions = [
    {
      value: "general-physician",
      label: "General Physician"
    },

    {
      value: "pediatrics",
      label: "Pediatrics"
    },

    {
      value: "gyne-obs",
      label: "Gyne & Obs"
    },

    {
      value: "dermatology",
      label: "Dermatology"
    },

    {
      value: "internal-medicine",
      label: "Internal Medicine"
    },

    {
      value: "cardiology",
      label: "Cardiology"
    },

    {
      value: "neurology",
      label: "Neurology"
    },

    {
      value: "dentistry",
      label: "Dentistry"
    },

    {
      value: "ophthalmology",
      label: "Ophthalmology"
    },

    {
      value: "oncology",
      label: "Oncology"
    },

    {
      value: "family-medicine",
      label: "Family Medicine"
    },

    {
      value: "physical-medicine",
      label: "Physical Medicine"
    }
  ];


  // =====================================================
  // IMAGE URL
  // =====================================================

  function getProfileImageUrl(imagePath) {

    if (!imagePath) {
      return "";
    }


    if (
      imagePath.startsWith("blob:") ||
      imagePath.startsWith("data:")
    ) {
      return imagePath;
    }


    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://")
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
  // PAGE LOAD
  // =====================================================

  useEffect(() => {

    document.title =
      "MediGo | Doctor Settings";


    const storedDoctor =
      localStorage.getItem("doctor");


    if (!storedDoctor) {

      toast.error(
        "Please login first!"
      );


      setTimeout(() => {

        navigate(
          "/doctor-login",
          {
            replace: true
          }
        );

      }, 1200);


      setLoading(false);

      return;
    }


    try {

      const doctor =
        JSON.parse(storedDoctor);


      if (!doctor.id) {

        toast.error(
          "Doctor information not found!"
        );

        setLoading(false);

        return;
      }


      setDoctorId(
        doctor.id
      );


      loadDoctorSettings(
        doctor.id
      );

    }

    catch (error) {

      console.log(error);


      toast.error(
        "Invalid doctor information!"
      );


      setLoading(false);

    }

  }, []);


  // =====================================================
  // LOAD SETTINGS
  // =====================================================

  function loadDoctorSettings(id) {

    setLoading(true);


    axios
      .get(
        `${API_URL}/api/DoctorSettings/${id}`
      )

      .then((res) => {

        const data =
          res.data;


        console.log(
          "Doctor Settings:",
          data
        );


        // =====================================
        // Doctors TABLE
        // =====================================

        setTitle(
          data.title || ""
        );

        setFirstName(
          data.firstName || ""
        );

        setLastName(
          data.lastName || ""
        );

        setEmail(
          data.email || ""
        );

        setPhone(
          data.phone || ""
        );

        setDateOfBirth(
          data.dateOfBirth || ""
        );

        setGender(
          data.gender || ""
        );

        setNationalId(
          data.nationalId || ""
        );

        setBmdcNumber(
          data.bmdcNumber || ""
        );

        setJoinedAt(
          data.joinedAt || ""
        );


        // =====================================
        // DoctorSettings TABLE
        // =====================================

        setQualifications(
          data.qualifications || ""
        );

        setSpecialty(
          data.specialty || ""
        );

        setWorkingPlace(
          data.workingPlace || ""
        );

        setWorkingDescription(
          data.workingDescription || ""
        );

        setExperienceYears(
          data.experienceYears ?? ""
        );

        setBio(
          data.bio || ""
        );

        setInstantConsultationMinutes(
          data.instantConsultationMinutes ?? ""
        );

        setAppointmentConsultationMinutes(
          data.appointmentConsultationMinutes ?? ""
        );

        setConsultationFee(
          data.consultationFee ?? ""
        );

        setFollowUpFee(
          data.followUpFee ?? ""
        );

        setPatientsAttended(
          data.patientsAttended ?? 0
        );

        setDoctorCode(
          data.doctorCode || ""
        );


        setProfileImage(
          getProfileImageUrl(
            data.profileImage
          )
        );

      })

      .catch((err) => {

        console.log(
          "Settings Load Error:",
          err
        );


        toast.error(
          err.response?.data?.message ||
          "Could not load doctor settings!"
        );

      })

      .finally(() => {

        setLoading(false);

      });

  }


  // =====================================================
  // SAVE GENERAL SETTINGS
  // =====================================================

  function saveGeneralSettings() {

    if (!doctorId) {
      return;
    }


    if (!title) {

      toast.error(
        "Please select title!"
      );

      return;
    }


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
        "Phone number is required!"
      );

      return;
    }


    if (!specialty) {

      toast.error(
        "Please select a specialty!"
      );

      return;
    }


    const data = {

      // =================================
      // Existing Doctors table
      // =================================

      title: title,

      firstName:
        firstName.trim(),

      lastName:
        lastName.trim(),

      email:
        email.trim(),

      phone:
        phone.trim(),


      // =================================
      // DoctorSettings table
      // =================================

      qualifications:
        qualifications.trim(),

      specialty:
        specialty,

      workingPlace:
        workingPlace.trim(),

      workingDescription:
        workingDescription.trim(),

      experienceYears:
        experienceYears === ""
          ? null
          : Number(experienceYears),

      bio:
        bio.trim(),

      instantConsultationMinutes:
        instantConsultationMinutes === ""
          ? null
          : Number(
              instantConsultationMinutes
            ),

      appointmentConsultationMinutes:
        appointmentConsultationMinutes === ""
          ? null
          : Number(
              appointmentConsultationMinutes
            ),

      consultationFee:
        consultationFee === ""
          ? null
          : Number(
              consultationFee
            ),

      followUpFee:
        followUpFee === ""
          ? null
          : Number(
              followUpFee
            )
    };


    console.log(
      "Saving Doctor Settings:",
      data
    );


    setSaving(true);


    axios
      .put(
        `${API_URL}/api/DoctorSettings/${doctorId}/general`,
        data
      )

      .then((res) => {

        toast.success(
          res.data.message ||
          "Settings updated successfully!"
        );


        // =====================================
        // UPDATE LOCAL STORAGE
        // =====================================

        const oldDoctor =
          JSON.parse(
            localStorage.getItem("doctor") ||
            "{}"
          );


        const updatedDoctor = {

          ...oldDoctor,

          id:
            doctorId,

          title:
            title,

          firstName:
            firstName.trim(),

          lastName:
            lastName.trim(),

          fullName:
            `${title} ${firstName.trim()} ${lastName.trim()}`,

          email:
            email.trim(),

          phone:
            phone.trim(),

          specialty:
            specialty,

          profileImage:
            oldDoctor.profileImage
        };


        localStorage.setItem(
          "doctor",
          JSON.stringify(
            updatedDoctor
          )
        );


        window.dispatchEvent(
          new Event(
            "doctorUpdated"
          )
        );


        loadDoctorSettings(
          doctorId
        );

      })

      .catch((err) => {

        console.log(
          "Save Settings Error:",
          err
        );


        toast.error(
          err.response?.data?.message ||
          "Could not update doctor settings!"
        );

      })

      .finally(() => {

        setSaving(false);

      });

  }


  // =====================================================
  // SELECT PROFILE IMAGE
  // =====================================================

  function handleImageSelect(e) {

    const file =
      e.target.files?.[0];


    if (!file) {
      return;
    }


    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      toast.error(
        "Please select an image file!"
      );

      return;
    }


    if (
      file.size >
      5 * 1024 * 1024
    ) {

      toast.error(
        "Image must be less than 5MB!"
      );

      return;
    }


    setSelectedImage(
      file
    );


    const previewUrl =
      URL.createObjectURL(
        file
      );


    setProfileImage(
      previewUrl
    );

  }


  // =====================================================
  // SAVE PROFILE IMAGE
  // =====================================================

  function saveProfileImage() {

    if (!doctorId) {
      return;
    }


    if (!selectedImage) {

      toast.error(
        "Please select a profile image!"
      );

      return;
    }


    const formData =
      new FormData();


    formData.append(
      "image",
      selectedImage
    );


    setSaving(true);


    axios
      .post(
        `${API_URL}/api/DoctorSettings/${doctorId}/profile-image`,
        formData
      )

      .then((res) => {

        const imagePath =
          res.data.profileImage;


        const imageUrl =
          getProfileImageUrl(
            imagePath
          );


        setProfileImage(
          `${imageUrl}?t=${Date.now()}`
        );


        setSelectedImage(
          null
        );


        // =====================================
        // UPDATE LOCAL STORAGE IMAGE
        // =====================================

        const oldDoctor =
          JSON.parse(
            localStorage.getItem("doctor") ||
            "{}"
          );


        const updatedDoctor = {

          ...oldDoctor,

          profileImage:
            imagePath
        };


        localStorage.setItem(
          "doctor",
          JSON.stringify(
            updatedDoctor
          )
        );


        window.dispatchEvent(
          new Event(
            "doctorUpdated"
          )
        );


        toast.success(
          res.data.message ||
          "Profile picture updated!"
        );

      })

      .catch((err) => {

        console.log(
          "Image Upload Error:",
          err
        );


        toast.error(
          err.response?.data?.message ||
          "Could not upload profile picture!"
        );

      })

      .finally(() => {

        setSaving(false);

      });

  }


  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  function handleChangePassword() {

    if (!doctorId) {
      return;
    }


    if (!currentPassword.trim()) {

      toast.error(
        "Current password is required!"
      );

      return;
    }


    if (!newPassword.trim()) {

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
      newPassword !==
      confirmPassword
    ) {

      toast.error(
        "Confirm password does not match!"
      );

      return;
    }


    setSaving(true);


    axios
      .put(
        `${API_URL}/api/DoctorSettings/${doctorId}/password`,
        {
          currentPassword:
            currentPassword,

          newPassword:
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

      })

      .finally(() => {

        setSaving(false);

      });

  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(value) {

    if (!value) {
      return "";
    }


    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }


    return date.toLocaleDateString();

  }


  // =====================================================
  // SHOW SPECIALTY NAME
  // =====================================================

  function getSpecialtyLabel(value) {

    const found =
      specialtyOptions.find(
        (item) =>
          item.value === value
      );


    return found
      ? found.label
      : value;

  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="doctor-settings-page">

        <DoctorSidebar />

        <div className="doctor-settings-main">

          <DoctorTopbar />

          <div className="doctor-settings-loading">

            Loading doctor settings...

          </div>

        </div>

      </div>

    );

  }


  return (

    <div className="doctor-settings-page">


      <DoctorSidebar />


      <div className="doctor-settings-main">


        <DoctorTopbar />


        <div className="doctor-settings-content">


          {/* =================================================
              LEFT PROFILE IMAGE
          ================================================= */}

          <aside className="doctor-settings-left">


            <div className="settings-left-profile">


              {profileImage ? (

                <img
                  src={profileImage}
                  alt="Doctor Profile"
                />

              ) : (

                <div className="settings-profile-letter">

                  {
                    firstName
                      ? firstName
                          .charAt(0)
                          .toUpperCase()
                      : "D"
                  }

                </div>

              )}


            </div>


            <div className="settings-left-doctor-info">

              <h3>
                {title} {firstName} {lastName}
              </h3>

              <p>
                {
                  specialty
                    ? getSpecialtyLabel(
                        specialty
                      )
                    : "No specialty selected"
                }
              </p>

            </div>


          </aside>



          {/* =================================================
              RIGHT SETTINGS
          ================================================= */}

          <section className="doctor-settings-right">


            {/* TABS */}

            <div className="doctor-settings-tabs">


              <button
                type="button"
                className={
                  activeTab === "general"
                    ? "doctor-settings-tab active"
                    : "doctor-settings-tab"
                }
                onClick={() =>
                  setActiveTab("general")
                }
              >

                General

              </button>


              <button
                type="button"
                className={
                  activeTab === "picture"
                    ? "doctor-settings-tab active"
                    : "doctor-settings-tab"
                }
                onClick={() =>
                  setActiveTab("picture")
                }
              >

                Profile Picture

              </button>


              <button
                type="button"
                className={
                  activeTab === "password"
                    ? "doctor-settings-tab active"
                    : "doctor-settings-tab"
                }
                onClick={() =>
                  setActiveTab("password")
                }
              >

                Password

              </button>


            </div>



            {/* =================================================
                GENERAL TAB
            ================================================= */}

            {activeTab === "general" && (

              <div className="doctor-settings-panel">


                <div className="settings-panel-header">

                  <FaUser />

                  <div>

                    <h2>
                      General Information
                    </h2>

                    <p>
                      Manage your personal and professional information.
                    </p>

                  </div>

                </div>



                <div className="doctor-settings-grid">


                  {/* TITLE */}

                  <div className="doctor-setting-field">

                    <label>
                      Title
                    </label>

                    <select
                      value={title}
                      onChange={(e) =>
                        setTitle(
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        Select Title
                      </option>

                      <option value="Dr.">
                        Dr.
                      </option>

                      <option value="Prof. Dr.">
                        Prof. Dr.
                      </option>

                      <option value="Assoc. Prof. Dr.">
                        Assoc. Prof. Dr.
                      </option>

                    </select>

                  </div>



                  {/* FIRST NAME */}

                  <div className="doctor-setting-field">

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



                  {/* LAST NAME */}

                  <div className="doctor-setting-field">

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



                  {/* EMAIL */}

                  <div className="doctor-setting-field">

                    <label>
                      Email
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



                  {/* PHONE */}

                  <div className="doctor-setting-field">

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



                  {/* DATE OF BIRTH */}

                  <div className="doctor-setting-field">

                    <label>
                      Date of Birth
                    </label>

                    <input
                      type="text"
                      value={
                        formatDate(
                          dateOfBirth
                        )
                      }
                      readOnly
                      className="doctor-readonly-field"
                    />

                  </div>



                  {/* GENDER */}

                  <div className="doctor-setting-field">

                    <label>
                      Gender
                    </label>

                    <input
                      type="text"
                      value={gender}
                      readOnly
                      className="doctor-readonly-field"
                    />

                  </div>



                  {/* NATIONAL ID */}

                  <div className="doctor-setting-field">

                    <label>
                      National ID / Passport
                    </label>

                    <input
                      type="text"
                      value={nationalId}
                      readOnly
                      className="doctor-readonly-field"
                    />

                  </div>



                  {/* BMDC */}

                  <div className="doctor-setting-field">

                    <label>
                      BMDC Registration Number
                    </label>

                    <input
                      type="text"
                      value={bmdcNumber}
                      readOnly
                      className="doctor-readonly-field"
                    />

                  </div>



                  {/* JOINED DATE */}

                  <div className="doctor-setting-field">

                    <label>
                      MediGo Joined
                    </label>

                    <input
                      type="text"
                      value={
                        formatDate(
                          joinedAt
                        )
                      }
                      readOnly
                      className="doctor-readonly-field"
                    />

                  </div>



                  {/* QUALIFICATION */}

                  <div className="doctor-setting-field doctor-field-full">

                    <label>
                      Qualifications
                    </label>

                    <input
                      type="text"
                      placeholder="Example: MBBS, FCPS, MD"
                      value={qualifications}
                      onChange={(e) =>
                        setQualifications(
                          e.target.value
                        )
                      }
                    />

                  </div>



                  {/* SPECIALTY */}

                  <div className="doctor-setting-field">

                    <label>
                      Specialty
                    </label>

                    <select
                      value={specialty}
                      onChange={(e) =>
                        setSpecialty(
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        Select Specialty
                      </option>


                      {specialtyOptions.map(
                        (item) => (

                          <option
                            key={item.value}
                            value={item.value}
                          >

                            {item.label}

                          </option>

                        )
                      )}


                    </select>

                  </div>



                  {/* EXPERIENCE */}

                  <div className="doctor-setting-field">

                    <label>
                      Experience (Years)
                    </label>

                    <input
                      type="number"
                      min="0"
                      placeholder="Example: 5"
                      value={experienceYears}
                      onChange={(e) =>
                        setExperienceYears(
                          e.target.value
                        )
                      }
                    />

                  </div>



                  {/* WORK PLACE */}

                  <div className="doctor-setting-field doctor-field-full">

                    <label>
                      Hospital / Working Place
                    </label>

                    <input
                      type="text"
                      placeholder="Example: Square Hospital, Dhaka"
                      value={workingPlace}
                      onChange={(e) =>
                        setWorkingPlace(
                          e.target.value
                        )
                      }
                    />

                  </div>



                  {/* WORKING DESCRIPTION */}

                  <div className="doctor-setting-field doctor-field-full">

                    <label>
                      Working Description
                    </label>

                    <textarea
                      rows="3"
                      placeholder="Describe your current workplace and position..."
                      value={workingDescription}
                      onChange={(e) =>
                        setWorkingDescription(
                          e.target.value
                        )
                      }
                    />

                  </div>



                  {/* BIO */}

                  <div className="doctor-setting-field doctor-field-full">

                    <label>
                      About / Bio
                    </label>

                    <textarea
                      rows="4"
                      placeholder="Write something about yourself..."
                      value={bio}
                      onChange={(e) =>
                        setBio(
                          e.target.value
                        )
                      }
                    />

                  </div>



                  {/* INSTANT TIME */}

                  <div className="doctor-setting-field">

                    <label>
                      Instant Consultation Time
                    </label>

                    <select
                      value={
                        instantConsultationMinutes
                      }
                      onChange={(e) =>
                        setInstantConsultationMinutes(
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        Select Time
                      </option>

                      <option value="10">
                        10 Minutes
                      </option>

                      <option value="15">
                        15 Minutes
                      </option>

                      <option value="20">
                        20 Minutes
                      </option>

                      <option value="30">
                        30 Minutes
                      </option>

                      <option value="45">
                        45 Minutes
                      </option>

                      <option value="60">
                        60 Minutes
                      </option>

                    </select>

                  </div>



                  {/* APPOINTMENT TIME */}

                  <div className="doctor-setting-field">

                    <label>
                      Appointment Consultation Time
                    </label>

                    <select
                      value={
                        appointmentConsultationMinutes
                      }
                      onChange={(e) =>
                        setAppointmentConsultationMinutes(
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        Select Time
                      </option>

                      <option value="10">
                        10 Minutes
                      </option>

                      <option value="15">
                        15 Minutes
                      </option>

                      <option value="20">
                        20 Minutes
                      </option>

                      <option value="30">
                        30 Minutes
                      </option>

                      <option value="45">
                        45 Minutes
                      </option>

                      <option value="60">
                        60 Minutes
                      </option>

                    </select>

                  </div>



                  {/* CONSULTATION FEE */}

                  <div className="doctor-setting-field">

                    <label>
                      Consultation Fee (৳)
                    </label>

                    <input
                      type="number"
                      min="0"
                      placeholder="Example: 1000"
                      value={consultationFee}
                      onChange={(e) =>
                        setConsultationFee(
                          e.target.value
                        )
                      }
                    />

                  </div>



                  {/* FOLLOW UP FEE */}

                  <div className="doctor-setting-field">

                    <label>
                      Follow-up Fee (৳)
                    </label>

                    <input
                      type="number"
                      min="0"
                      placeholder="Example: 500"
                      value={followUpFee}
                      onChange={(e) =>
                        setFollowUpFee(
                          e.target.value
                        )
                      }
                    />

                  </div>



                  {/* PATIENT ATTENDED */}

                  <div className="doctor-setting-field">

                    <label>
                      Patients Attended
                    </label>

                    <input
                      type="number"
                      value={patientsAttended}
                      readOnly
                      className="doctor-readonly-field"
                    />

                  </div>



                  {/* DOCTOR CODE */}

                  <div className="doctor-setting-field">

                    <label>
                      Doctor Code
                    </label>

                    <input
                      type="text"
                      value={doctorCode}
                      readOnly
                      className="doctor-readonly-field"
                    />

                  </div>


                </div>



                <div className="doctor-settings-save-area">

                  <button
                    type="button"
                    className="doctor-settings-save-btn"
                    onClick={
                      saveGeneralSettings
                    }
                    disabled={saving}
                  >

                    <FaSave />

                    {
                      saving
                        ? "Saving..."
                        : "Save Changes"
                    }

                  </button>

                </div>


              </div>

            )}



            {/* =================================================
                PROFILE PICTURE TAB
            ================================================= */}

            {activeTab === "picture" && (

              <div className="doctor-settings-panel">


                <div className="settings-panel-header">

                  <FaImage />

                  <div>

                    <h2>
                      Profile Picture
                    </h2>

                    <p>
                      Upload your professional profile picture.
                    </p>

                  </div>

                </div>



                <div className="doctor-profile-picture-section">


                  <div className="doctor-profile-picture-preview">


                    {profileImage ? (

                      <img
                        src={profileImage}
                        alt="Doctor Profile"
                      />

                    ) : (

                      <div className="profile-picture-letter">

                        {
                          firstName
                            ? firstName
                                .charAt(0)
                                .toUpperCase()
                            : "D"
                        }

                      </div>

                    )}


                  </div>



                  <label className="doctor-choose-image-btn">

                    <FaCamera />

                    Choose Picture


                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      hidden
                      onChange={
                        handleImageSelect
                      }
                    />

                  </label>



                  {selectedImage && (

                    <p className="selected-image-name">

                      Selected:{" "}
                      {selectedImage.name}

                    </p>

                  )}



                  <button
                    type="button"
                    className="doctor-settings-save-btn"
                    onClick={
                      saveProfileImage
                    }
                    disabled={
                      saving ||
                      !selectedImage
                    }
                  >

                    <FaSave />

                    {
                      saving
                        ? "Uploading..."
                        : "Save Picture"
                    }

                  </button>


                </div>


              </div>

            )}



            {/* =================================================
                PASSWORD TAB
            ================================================= */}

            {activeTab === "password" && (

              <div className="doctor-settings-panel">


                <div className="settings-panel-header">

                  <FaLock />

                  <div>

                    <h2>
                      Change Password
                    </h2>

                    <p>
                      Change your MediGo doctor account password.
                    </p>

                  </div>

                </div>



                <div className="doctor-password-area">


                  <div className="doctor-setting-field">

                    <label>
                      Current Password
                    </label>

                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) =>
                        setCurrentPassword(
                          e.target.value
                        )
                      }
                    />

                  </div>



                  <div className="doctor-setting-field">

                    <label>
                      New Password
                    </label>

                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(
                          e.target.value
                        )
                      }
                    />

                  </div>



                  <div className="doctor-setting-field">

                    <label>
                      Confirm New Password
                    </label>

                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                    />

                  </div>



                  <button
                    type="button"
                    className="doctor-settings-save-btn"
                    onClick={
                      handleChangePassword
                    }
                    disabled={saving}
                  >

                    <FaLock />

                    {
                      saving
                        ? "Updating..."
                        : "Change Password"
                    }

                  </button>


                </div>


              </div>

            )}


          </section>


        </div>


      </div>



      <ToastContainer
        position="bottom-right"
        autoClose={1500}
      />


    </div>

  );

}


export default DoctorSettings;