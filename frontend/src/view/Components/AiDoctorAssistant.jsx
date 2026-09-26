import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import axios from "axios";

import {
  FaComments,
  FaTimes,
  FaPaperPlane,
  FaUserMd,
  FaExclamationTriangle,
  FaStethoscope
} from "react-icons/fa";

import defaultDoctorProfile
  from "../../assets/doctor-profile.png";

import "../../Style/ComponentsCSS/AiDoctorAssistant.css";


const API_URL =
  "http://localhost:5138";


function AiDoctorAssistant() {

  const navigate =
    useNavigate();


  // =====================================================
  // OPEN / CLOSE
  // =====================================================

  const [
    isOpen,
    setIsOpen
  ] = useState(false);


  // =====================================================
  // INPUT
  // =====================================================

  const [
    input,
    setInput
  ] = useState("");


  const [
    sending,
    setSending
  ] = useState(false);


  // =====================================================
  // CHAT
  // =====================================================

  const [
    messages,
    setMessages
  ] = useState([
    {
      role:
        "assistant",

      content:
        "Hi! 👋 I'm MediGo AI Doctor Finder. Tell me about your health concern or the type of doctor you're looking for, and I'll help you find suitable doctors available on MediGo.",

      doctors: [],

      urgency:
        "routine"
    }
  ]);


  // =====================================================
  // REFS
  // =====================================================

  const bottomRef =
    useRef(null);


  const widgetRef =
    useRef(null);


  // =====================================================
  // SCROLL CHAT TO BOTTOM
  // =====================================================

  useEffect(() => {

    bottomRef.current
      ?.scrollIntoView({
        behavior:
          "smooth"
      });

  }, [
    messages,
    sending
  ]);


  // =====================================================
  // CLICK OUTSIDE DOES NOT BLOCK PAGE
  //
  // Clicking anywhere outside:
  // - closes chat
  // - still allows original page click
  // =====================================================

  useEffect(() => {

    if (!isOpen) {
      return;
    }


    function handleOutsideClick(
      event
    ) {

      if (
        widgetRef.current
        &&
        !widgetRef.current
          .contains(
            event.target
          )
      ) {

        setIsOpen(false);
      }

    }


    function handleEscape(
      event
    ) {

      if (
        event.key
        === "Escape"
      ) {

        setIsOpen(false);
      }

    }


    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );


    document.addEventListener(
      "keydown",
      handleEscape
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );


      document.removeEventListener(
        "keydown",
        handleEscape
      );

    };

  }, [
    isOpen
  ]);


  // =====================================================
  // DOCTOR PROFILE IMAGE
  // =====================================================

  function getProfileImageUrl(
    imagePath
  ) {

    if (!imagePath) {

      return defaultDoctorProfile;
    }


    if (
      imagePath.startsWith(
        "http://"
      )
      ||
      imagePath.startsWith(
        "https://"
      )
    ) {

      return imagePath;
    }


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


    return (
      `${API_URL}/${cleanPath}`
    );
  }


  // =====================================================
  // SEND MESSAGE
  // =====================================================

  async function sendMessage() {

    const cleanInput =
      input.trim();


    if (
      !cleanInput
      ||
      sending
    ) {

      return;
    }


    const userMessage =
    {
      role:
        "user",

      content:
        cleanInput
    };


    const updatedMessages =
    [
      ...messages,
      userMessage
    ];


    setMessages(
      updatedMessages
    );


    setInput("");

    setSending(true);


    try {

      // ===============================================
      // SEND ONLY CHAT TEXT
      // ===============================================

      const chatHistory =
        updatedMessages.map(
          (message) => ({
            role:
              message.role,

            content:
              message.content
          })
        );


      const response =
        await axios.post(
          `${API_URL}/api/ai-doctor-assistant/chat`,

          {
            messages:
              chatHistory
          }
        );


      const data =
        response.data;


      const aiMessage =
      {
        role:
          "assistant",

        content:
          data.assistantMessage,

        doctors:
          data.doctors
          ||
          [],

        urgency:
          data.urgency,

        specialty:
          data.specialty,

        specialtyDisplay:
          data.specialtyDisplay,

        reason:
          data.reason,

        rankingBasis:
          data.rankingBasis
      };


      setMessages(
        (previous) => [
          ...previous,
          aiMessage
        ]
      );

    }
    catch (error) {

      console.log(
        "MediGo AI Error:",
        error
      );


      let errorMessage =
        "Sorry, MediGo AI is temporarily unavailable. Please try again.";


      if (
        error.response?.status
        === 429
      ) {

        errorMessage =
          "You've sent several messages quickly. Please wait a moment and try again.";

      }
      else if (
        error.response
          ?.data
          ?.message
      ) {

        errorMessage =
          error.response
            .data
            .message;

      }


      setMessages(
        (previous) => [
          ...previous,

          {
            role:
              "assistant",

            content:
              errorMessage,

            doctors:
              [],

            urgency:
              "routine"
          }
        ]
      );

    }
    finally {

      setSending(false);

    }
  }


  // =====================================================
  // ENTER TO SEND
  // SHIFT + ENTER = NEW LINE
  // =====================================================

  function handleKeyDown(
    event
  ) {

    if (
      event.key
      === "Enter"
      &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendMessage();

    }
  }


  // =====================================================
  // NEW CHAT
  // =====================================================

  function resetChat() {

    setMessages([
      {
        role:
          "assistant",

        content:
          "Hi! 👋 I'm MediGo AI Doctor Finder. Tell me about your health concern or the type of doctor you're looking for.",

        doctors:
          [],

        urgency:
          "routine"
      }
    ]);


    setInput("");

  }


  // =====================================================
  // JSX
  // =====================================================

  return (

    <div

      className="
        medigo-ai-widget
      "

      ref={
        widgetRef
      }

    >


      {/* =================================================
          CHAT PANEL
      ================================================= */}

      {
        isOpen
        &&
        (
          <div
            className="
              medigo-ai-panel
            "
          >


            {/* =============================================
                HEADER
            ============================================= */}

            <div
              className="
                medigo-ai-header
              "
            >

              <div
                className="
                  medigo-ai-header-profile
                "
              >

                <div
                  className="
                    medigo-ai-avatar
                  "
                >

                  <FaStethoscope />

                  <span
                    className="
                      medigo-ai-online-dot
                    "
                  />

                </div>


                <div
                  className="
                    medigo-ai-header-text
                  "
                >

                  <strong>
                    MediGo AI
                  </strong>

                  <span>
                    Doctor Finder • Online
                  </span>

                </div>

              </div>


              <button

                type="button"

                className="
                  medigo-ai-close
                "

                onClick={() =>
                  setIsOpen(false)
                }

                aria-label="
                  Close MediGo AI
                "
              >

                <FaTimes />

              </button>

            </div>


            {/* =============================================
                SAFETY NOTE
            ============================================= */}

            <div
              className="
                medigo-ai-safety-note
              "
            >

              AI guidance for choosing
              a doctor — not a medical
              diagnosis.

            </div>


            {/* =============================================
                MESSAGE AREA
            ============================================= */}

            <div
              className="
                medigo-ai-message-area
              "
            >

              {
                messages.map(
                  (
                    message,
                    index
                  ) => (

                    <div

                      key={
                        index
                      }

                      className={
                        `
                        medigo-ai-message-row

                        ${
                          message.role
                          === "user"

                            ? "medigo-ai-message-row-user"

                            : "medigo-ai-message-row-bot"
                        }
                        `
                      }

                    >


                      {/* =====================================
                          AI SMALL AVATAR
                      ===================================== */}

                      {
                        message.role
                        === "assistant"
                        &&
                        (
                          <div
                            className="
                              medigo-ai-small-avatar
                            "
                          >

                            <FaStethoscope />

                          </div>
                        )
                      }


                      <div
                        className="
                          medigo-ai-message-content
                        "
                      >


                        {/* =================================
                            CHAT BUBBLE
                        ================================= */}

                        <div

                          className={
                            `
                            medigo-ai-bubble

                            ${
                              message.role
                              === "user"

                                ? "medigo-ai-user-bubble"

                                : "medigo-ai-bot-bubble"
                            }

                            ${
                              message.urgency
                              === "emergency"

                                ? "medigo-ai-emergency-bubble"

                                : ""
                            }
                            `
                          }

                        >


                          {
                            message.urgency
                            === "emergency"
                            &&
                            (
                              <div
                                className="
                                  medigo-ai-emergency-title
                                "
                              >

                                <FaExclamationTriangle />

                                Urgent guidance

                              </div>
                            )
                          }


                          <p>
                            {
                              message.content
                            }
                          </p>

                        </div>


                        {/* =================================
                            SPECIALTY
                        ================================= */}

                        {
                          message.specialtyDisplay
                          &&
                          message.urgency
                          !== "emergency"
                          &&
                          (
                            <div
                              className="
                                medigo-ai-specialty-card
                              "
                            >

                              <span>
                                Suggested specialty
                              </span>


                              <strong>
                                {
                                  message
                                    .specialtyDisplay
                                }
                              </strong>


                              {
                                message.reason
                                &&
                                (
                                  <p>
                                    {
                                      message.reason
                                    }
                                  </p>
                                )
                              }

                            </div>
                          )
                        }


                        {/* =================================
                            DOCTORS
                        ================================= */}

                        {
                          message.doctors
                            ?.length > 0
                          &&
                          (
                            <div
                              className="
                                medigo-ai-doctor-results
                              "
                            >


                              <div
                                className="
                                  medigo-ai-result-title
                                "
                              >

                                <FaUserMd />

                                Best matching
                                MediGo doctors

                              </div>


                              {
                                message.doctors.map(
                                  (doctor) => (

                                    <div

                                      key={
                                        doctor.id
                                      }

                                      className="
                                        medigo-ai-doctor-card
                                      "

                                    >


                                      <img

                                        src={
                                          getProfileImageUrl(
                                            doctor
                                              .profileImage
                                          )
                                        }

                                        alt={
                                          doctor
                                            .fullName
                                        }

                                        onError={
                                          (event) => {

                                            event
                                              .currentTarget
                                              .src =
                                                defaultDoctorProfile;

                                          }
                                        }

                                      />


                                      <div
                                        className="
                                          medigo-ai-doctor-details
                                        "
                                      >


                                        <strong>
                                          {
                                            doctor
                                              .fullName
                                          }
                                        </strong>


                                        <span
                                          className="
                                            medigo-ai-qualification
                                          "
                                        >

                                          {
                                            doctor
                                              .qualifications
                                            ||
                                            "Qualification not added"
                                          }

                                        </span>


                                        {
                                          doctor
                                            .workingPlace
                                          &&
                                          (
                                            <span
                                              className="
                                                medigo-ai-workplace
                                              "
                                            >

                                              {
                                                doctor
                                                  .workingPlace
                                              }

                                            </span>
                                          )
                                        }


                                        <div
                                          className="
                                            medigo-ai-doctor-tags
                                          "
                                        >

                                          {
                                            doctor
                                              .experienceYears
                                            !== null
                                            &&
                                            doctor
                                              .experienceYears
                                            !== undefined
                                            &&
                                            (
                                              <span>

                                                {
                                                  doctor
                                                    .experienceYears
                                                }

                                                {" "}
                                                yrs

                                              </span>
                                            )
                                          }


                                          {
                                            doctor
                                              .consultationFee
                                            !== null
                                            &&
                                            doctor
                                              .consultationFee
                                            !== undefined
                                            &&
                                            (
                                              <span>

                                                ৳
                                                {
                                                  doctor
                                                    .consultationFee
                                                }

                                              </span>
                                            )
                                          }

                                        </div>


                                        {
                                          doctor
                                            .matchReason
                                          &&
                                          (
                                            <p
                                              className="
                                                medigo-ai-match-reason
                                              "
                                            >

                                              {
                                                doctor
                                                  .matchReason
                                              }

                                            </p>
                                          )
                                        }


                                        <button

                                          type="button"

                                          className="
                                            medigo-ai-view-doctor
                                          "

                                          onClick={() => {

                                            setIsOpen(
                                              false
                                            );


                                            navigate(
                                              `/doctor/${doctor.id}`
                                            );

                                          }}

                                        >

                                          View Doctor

                                        </button>

                                      </div>

                                    </div>

                                  )
                                )
                              }


                              {
                                message.rankingBasis
                                &&
                                (
                                  <p
                                    className="
                                      medigo-ai-ranking-note
                                    "
                                  >

                                    {
                                      message
                                        .rankingBasis
                                    }

                                  </p>
                                )
                              }

                            </div>
                          )
                        }

                      </div>

                    </div>

                  )
                )
              }


              {/* =============================================
                  TYPING INDICATOR
              ============================================= */}

              {
                sending
                &&
                (
                  <div
                    className="
                      medigo-ai-message-row
                      medigo-ai-message-row-bot
                    "
                  >

                    <div
                      className="
                        medigo-ai-small-avatar
                      "
                    >

                      <FaStethoscope />

                    </div>


                    <div
                      className="
                        medigo-ai-typing
                      "
                    >

                      <span></span>
                      <span></span>
                      <span></span>

                    </div>

                  </div>
                )
              }


              <div
                ref={
                  bottomRef
                }
              />

            </div>


            {/* =============================================
                INPUT
            ============================================= */}

            <div
              className="
                medigo-ai-input-section
              "
            >

              <textarea

                value={
                  input
                }

                onChange={
                  (event) =>
                    setInput(
                      event.target.value
                    )
                }

                onKeyDown={
                  handleKeyDown
                }

                maxLength={
                  1000
                }

                rows={
                  1
                }

                disabled={
                  sending
                }

                placeholder="
                  Describe your concern...
                "

              />


              <button

                type="button"

                className="
                  medigo-ai-send-button
                "

                onClick={
                  sendMessage
                }

                disabled={
                  sending
                  ||
                  !input.trim()
                }

                aria-label="
                  Send message
                "
              >

                <FaPaperPlane />

              </button>

            </div>


            {/* =============================================
                BOTTOM
            ============================================= */}

            <div
              className="
                medigo-ai-bottom
              "
            >

              <button

                type="button"

                onClick={
                  resetChat
                }

              >

                New conversation

              </button>


              <span>
                Avoid sharing personal
                identifying information.
              </span>

            </div>

          </div>
        )
      }


      {/* =================================================
          FLOATING BUTTON
      ================================================= */}

      <button

        type="button"

        className={
          `
          medigo-ai-launcher

          ${
            isOpen
              ? "medigo-ai-launcher-open"
              : ""
          }
          `
        }

        onClick={() =>
          setIsOpen(
            previous =>
              !previous
          )
        }

        aria-label="
          Open MediGo AI Doctor Finder
        "

        aria-expanded={
          isOpen
        }

      >

        {
          isOpen
            ?
            <FaTimes />
            :
            <FaComments />
        }


        {
          !isOpen
          &&
          (
            <span
              className="
                medigo-ai-launcher-status
              "
            />
          )
        }

      </button>

    </div>
  );
}


export default AiDoctorAssistant;