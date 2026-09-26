using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

using Server.Data;
using Server.DTOs;
using Server.Services;

namespace Server.Controllers
{
    [Route(
        "api/ai-doctor-assistant"
    )]
    [ApiController]
    public class AiDoctorAssistantController
        : ControllerBase
    {
        private readonly
            AppDbContext _context;

        private readonly
            IAiDoctorService
                _aiDoctorService;


        // =====================================================
        // MEDIGO SPECIALTIES
        // =====================================================

        private static readonly
            HashSet<string>
                AllowedSpecialties =
                    new(
                        StringComparer
                            .OrdinalIgnoreCase
                    )
                    {
                        "general-physician",
                        "pediatrics",
                        "gyne-obs",
                        "dermatology",
                        "internal-medicine",
                        "cardiology",
                        "neurology",
                        "dentistry",
                        "ophthalmology",
                        "oncology",
                        "family-medicine",
                        "physical-medicine"
                    };


        // =====================================================
        // DISPLAY NAMES
        // =====================================================

        private static readonly
            Dictionary<string, string>
                SpecialtyDisplayNames =
                    new(
                        StringComparer
                            .OrdinalIgnoreCase
                    )
                    {
                        ["general-physician"] =
                            "General Physician",

                        ["pediatrics"] =
                            "Pediatrics",

                        ["gyne-obs"] =
                            "Gyne & Obs",

                        ["dermatology"] =
                            "Dermatology",

                        ["internal-medicine"] =
                            "Internal Medicine",

                        ["cardiology"] =
                            "Cardiology",

                        ["neurology"] =
                            "Neurology",

                        ["dentistry"] =
                            "Dentistry",

                        ["ophthalmology"] =
                            "Ophthalmology",

                        ["oncology"] =
                            "Oncology",

                        ["family-medicine"] =
                            "Family Medicine",

                        ["physical-medicine"] =
                            "Physical Medicine"
                    };


        // =====================================================
        // CONSTRUCTOR
        // =====================================================

        public AiDoctorAssistantController(
            AppDbContext context,
            IAiDoctorService
                aiDoctorService
        )
        {
            _context =
                context;

            _aiDoctorService =
                aiDoctorService;
        }


        // =====================================================
        // POST:
        // /api/ai-doctor-assistant/chat
        // =====================================================

        [HttpPost("chat")]
        [EnableRateLimiting("ai")]
        public async Task<IActionResult>
            Chat(
                [FromBody]
                AiDoctorChatRequestDto request,

                CancellationToken
                    cancellationToken
            )
        {
            try
            {
                // =============================================
                // VALIDATION
                // =============================================

                if (
                    request.Messages == null
                    ||
                    request.Messages.Count == 0
                )
                {
                    return BadRequest(
                        new
                        {
                            message =
                                "Please enter a message."
                        }
                    );
                }


                // =============================================
                // CLEAN CHAT HISTORY
                // Keep only latest 12 messages
                // =============================================

                var cleanMessages =
                    request.Messages

                        .Where(
                            message =>
                                message != null
                                &&
                                !string
                                    .IsNullOrWhiteSpace(
                                        message.Content
                                    )
                        )

                        .Select(
                            message =>
                            {
                                var role =
                                    message.Role
                                        .Trim()
                                        .ToLowerInvariant();


                                var content =
                                    message.Content
                                        .Trim();


                                if (
                                    content.Length
                                    > 1000
                                )
                                {
                                    content =
                                        content[..1000];
                                }


                                return
                                    new AiChatMessageDto
                                    {
                                        Role =
                                            role,

                                        Content =
                                            content
                                    };
                            }
                        )

                        .Where(
                            message =>
                                message.Role
                                == "user"
                                ||
                                message.Role
                                == "assistant"
                        )

                        .TakeLast(12)

                        .ToList();


                var lastUserMessage =
                    cleanMessages
                        .LastOrDefault(
                            message =>
                                message.Role
                                == "user"
                        )
                        ?.Content;


                if (
                    string.IsNullOrWhiteSpace(
                        lastUserMessage
                    )
                )
                {
                    return BadRequest(
                        new
                        {
                            message =
                                "Please enter a message."
                        }
                    );
                }


                // =============================================
                // LOCAL EMERGENCY SAFETY CHECK
                // =============================================

                if (
                    LooksLikeEmergency(
                        lastUserMessage
                    )
                )
                {
                    return Ok(
                        new AiDoctorChatResponseDto
                        {
                            AssistantMessage =
                                "Your description may indicate a medical emergency. Please seek urgent in-person emergency medical care now or contact your local emergency service. Do not wait for an online MediGo appointment.",

                            NeedsMoreInformation =
                                false,

                            Specialty =
                                "",

                            SpecialtyDisplay =
                                "",

                            Urgency =
                                "emergency",

                            Reason =
                                "Possible emergency warning signs were detected.",

                            RankingBasis =
                                "",

                            Doctors =
                                new List
                                <AiDoctorCardDto>()
                        }
                    );
                }


                // =============================================
                // ASK AI
                // =============================================

                var decision =
                    await _aiDoctorService
                        .AnalyzeConversationAsync(
                            cleanMessages,
                            cancellationToken
                        );


                // =============================================
                // AI DETECTED EMERGENCY
                // =============================================

                if (
                    string.Equals(
                        decision.Urgency,
                        "emergency",
                        StringComparison
                            .OrdinalIgnoreCase
                    )
                )
                {
                    return Ok(
                        new AiDoctorChatResponseDto
                        {
                            AssistantMessage =
                                decision
                                    .AssistantMessage,

                            NeedsMoreInformation =
                                false,

                            Specialty =
                                decision.Specialty,

                            SpecialtyDisplay =
                                GetSpecialtyDisplay(
                                    decision.Specialty
                                ),

                            Urgency =
                                "emergency",

                            Reason =
                                decision
                                    .SpecialtyReason,

                            RankingBasis =
                                "",

                            Doctors =
                                new List
                                <AiDoctorCardDto>()
                        }
                    );
                }


                // =============================================
                // NEED MORE INFORMATION
                // =============================================

                if (
                    decision
                        .NeedsMoreInformation
                    ||
                    string.IsNullOrWhiteSpace(
                        decision.Specialty
                    )
                )
                {
                    return Ok(
                        new AiDoctorChatResponseDto
                        {
                            AssistantMessage =
                                decision
                                    .AssistantMessage,

                            NeedsMoreInformation =
                                true,

                            Specialty =
                                "",

                            SpecialtyDisplay =
                                "",

                            Urgency =
                                decision.Urgency,

                            Reason =
                                decision
                                    .SpecialtyReason,

                            RankingBasis =
                                "",

                            Doctors =
                                new List
                                <AiDoctorCardDto>()
                        }
                    );
                }


                // =============================================
                // NORMALIZE SPECIALTY
                // =============================================

                var specialty =
                    decision.Specialty
                        .Trim()
                        .ToLowerInvariant();


                if (
                    !AllowedSpecialties
                        .Contains(
                            specialty
                        )
                )
                {
                    specialty =
                        "general-physician";
                }


                // =============================================
                // GET REAL MEDIGO DOCTORS
                //
                // ONLY:
                // - approved
                // - visible
                // - matching specialty
                // =============================================

                var candidates =
                    await (
                        from doctor
                        in _context.Doctors

                        join settings
                        in _context.DoctorSettings

                        on doctor.Id
                        equals settings.DoctorId

                        where
                            doctor.IsVisible
                            &&
                            doctor.RequestStatus
                                == "approved"
                            &&
                            settings.Specialty
                                == specialty

                        select
                            new DoctorCandidate
                            {
                                Id =
                                    doctor.Id,

                                FullName =
                                    doctor.Title
                                    + " "
                                    + doctor.FirstName
                                    + " "
                                    + doctor.LastName,

                                Gender =
                                    doctor.Gender,

                                Qualifications =
                                    settings
                                        .Qualifications,

                                Specialty =
                                    settings
                                        .Specialty,

                                WorkingPlace =
                                    settings
                                        .WorkingPlace,

                                ExperienceYears =
                                    settings
                                        .ExperienceYears,

                                ConsultationFee =
                                    settings
                                        .ConsultationFee,

                                PatientsAttended =
                                    settings
                                        .PatientsAttended,

                                ProfileImage =
                                    settings
                                        .ProfileImage
                            }
                    )
                    .ToListAsync(
                        cancellationToken
                    );


                // =============================================
                // NO DOCTORS
                // =============================================

                if (
                    candidates.Count == 0
                )
                {
                    return Ok(
                        new AiDoctorChatResponseDto
                        {
                            AssistantMessage =
                                decision
                                    .AssistantMessage
                                +
                                " I could not find a currently listed MediGo doctor for this specialty.",

                            NeedsMoreInformation =
                                false,

                            Specialty =
                                specialty,

                            SpecialtyDisplay =
                                GetSpecialtyDisplay(
                                    specialty
                                ),

                            Urgency =
                                decision.Urgency,

                            Reason =
                                decision
                                    .SpecialtyReason,

                            Doctors =
                                new List
                                <AiDoctorCardDto>()
                        }
                    );
                }


                // =============================================
                // DETERMINE WHETHER USER ACTUALLY
                // PROVIDED PREFERENCES
                // =============================================

                var genderPreferenceExists =
                    decision.PreferredGender
                        .Equals(
                            "male",
                            StringComparison
                                .OrdinalIgnoreCase
                        )
                    ||
                    decision.PreferredGender
                        .Equals(
                            "female",
                            StringComparison
                                .OrdinalIgnoreCase
                        );


                var placePreferenceExists =
                    !string.IsNullOrWhiteSpace(
                        decision
                            .WorkingPlaceKeyword
                    );


                var budgetPreferenceExists =
                    decision.MaxFee > 0;


                // =============================================
                // RANK
                //
                // This is NOT a medical quality score.
                //
                // Priority:
                // 1. Explicit gender preference
                // 2. Explicit location preference
                // 3. Explicit budget preference
                // 4. Experience
                // 5. Patients attended
                // 6. Lower consultation fee
                // =============================================

                var rankedDoctors =
                    candidates

                        .OrderByDescending(
                            doctor =>
                                MatchesGender(
                                    doctor,
                                    decision
                                        .PreferredGender
                                )
                        )

                        .ThenByDescending(
                            doctor =>
                                MatchesPlace(
                                    doctor,
                                    decision
                                        .WorkingPlaceKeyword
                                )
                        )

                        .ThenByDescending(
                            doctor =>
                                FitsBudget(
                                    doctor,
                                    decision.MaxFee
                                )
                        )

                        .ThenByDescending(
                            doctor =>
                                doctor
                                    .ExperienceYears
                                ?? 0
                        )

                        .ThenByDescending(
                            doctor =>
                                doctor
                                    .PatientsAttended
                        )

                        .ThenBy(
                            doctor =>
                                doctor
                                    .ConsultationFee
                                ??
                                decimal.MaxValue
                        )

                        .Take(3)

                        .ToList();


                // =============================================
                // CHECK EXACT PREFERENCE MATCHES
                // =============================================

                var exactMatches =
                    candidates.Count(
                        doctor =>
                            (
                                !genderPreferenceExists
                                ||
                                MatchesGender(
                                    doctor,
                                    decision
                                        .PreferredGender
                                )
                            )
                            &&
                            (
                                !placePreferenceExists
                                ||
                                MatchesPlace(
                                    doctor,
                                    decision
                                        .WorkingPlaceKeyword
                                )
                            )
                            &&
                            (
                                !budgetPreferenceExists
                                ||
                                FitsBudget(
                                    doctor,
                                    decision.MaxFee
                                )
                            )
                    );


                var preferenceRequested =
                    genderPreferenceExists
                    ||
                    placePreferenceExists
                    ||
                    budgetPreferenceExists;


                // =============================================
                // CREATE FRONTEND DOCTOR CARDS
                // =============================================

                var doctors =
                    rankedDoctors
                        .Select(
                            doctor =>
                                new AiDoctorCardDto
                                {
                                    Id =
                                        doctor.Id,

                                    FullName =
                                        doctor.FullName,

                                    Gender =
                                        doctor.Gender,

                                    Qualifications =
                                        doctor
                                            .Qualifications,

                                    Specialty =
                                        doctor.Specialty,

                                    WorkingPlace =
                                        doctor
                                            .WorkingPlace,

                                    ExperienceYears =
                                        doctor
                                            .ExperienceYears,

                                    ConsultationFee =
                                        doctor
                                            .ConsultationFee,

                                    PatientsAttended =
                                        doctor
                                            .PatientsAttended,

                                    ProfileImage =
                                        doctor
                                            .ProfileImage,

                                    MatchReason =
                                        BuildMatchReason(
                                            doctor,
                                            specialty,
                                            decision
                                        )
                                }
                        )
                        .ToList();


                // =============================================
                // ASSISTANT MESSAGE
                // =============================================

                var assistantMessage =
                    decision
                        .AssistantMessage;


                if (
                    preferenceRequested
                    &&
                    exactMatches == 0
                )
                {
                    assistantMessage +=
                        " I couldn't find a doctor matching every preference exactly, so I have shown the closest MediGo matches.";
                }


                // =============================================
                // FINAL RESPONSE
                // =============================================

                return Ok(
                    new AiDoctorChatResponseDto
                    {
                        AssistantMessage =
                            assistantMessage,

                        NeedsMoreInformation =
                            false,

                        Specialty =
                            specialty,

                        SpecialtyDisplay =
                            GetSpecialtyDisplay(
                                specialty
                            ),

                        Urgency =
                            decision.Urgency,

                        Reason =
                            decision
                                .SpecialtyReason,

                        RankingBasis =
                            "Matches are ordered using your stated preferences, then experience, patients attended and consultation fee. This is a matching order, not a medical quality rating.",

                        Doctors =
                            doctors
                    }
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    "AI DOCTOR ASSISTANT ERROR:"
                );

                Console.WriteLine(
                    ex.ToString()
                );


                return StatusCode(
                    StatusCodes
                        .Status500InternalServerError,

                    new
                    {
                        message =
                            "MediGo AI is temporarily unavailable. Please try again."
                    }
                );
            }
        }


        // =====================================================
        // GENDER MATCH
        // =====================================================

        private static bool
            MatchesGender(
                DoctorCandidate doctor,
                string preference
            )
        {
            if (
                string.IsNullOrWhiteSpace(
                    preference
                )
                ||
                preference.Equals(
                    "any",
                    StringComparison
                        .OrdinalIgnoreCase
                )
            )
            {
                return true;
            }


            return
                doctor.Gender.Equals(
                    preference,
                    StringComparison
                        .OrdinalIgnoreCase
                );
        }


        // =====================================================
        // PLACE MATCH
        // =====================================================

        private static bool
            MatchesPlace(
                DoctorCandidate doctor,
                string keyword
            )
        {
            if (
                string.IsNullOrWhiteSpace(
                    keyword
                )
            )
            {
                return true;
            }


            return
                !string
                    .IsNullOrWhiteSpace(
                        doctor.WorkingPlace
                    )
                &&
                doctor.WorkingPlace
                    .Contains(
                        keyword,
                        StringComparison
                            .OrdinalIgnoreCase
                    );
        }


        // =====================================================
        // BUDGET MATCH
        // =====================================================

        private static bool
            FitsBudget(
                DoctorCandidate doctor,
                decimal maxFee
            )
        {
            if (maxFee <= 0)
            {
                return true;
            }


            return
                doctor.ConsultationFee
                    .HasValue
                &&
                doctor.ConsultationFee
                    .Value
                    <= maxFee;
        }


        // =====================================================
        // SPECIALTY DISPLAY NAME
        // =====================================================

        private static string
            GetSpecialtyDisplay(
                string specialty
            )
        {
            if (
                string.IsNullOrWhiteSpace(
                    specialty
                )
            )
            {
                return "";
            }


            return
                SpecialtyDisplayNames
                    .TryGetValue(
                        specialty,
                        out var display
                    )
                    ?
                    display
                    :
                    specialty;
        }


        // =====================================================
        // MATCH REASON
        // =====================================================

        private static string
            BuildMatchReason(
                DoctorCandidate doctor,
                string specialty,
                AiDoctorDecisionDto decision
            )
        {
            var reasons =
                new List<string>
                {
                    $"Matches {GetSpecialtyDisplay(specialty)}"
                };


            if (
                doctor.ExperienceYears
                    .HasValue
                &&
                doctor.ExperienceYears
                    .Value > 0
            )
            {
                reasons.Add(
                    $"{doctor.ExperienceYears.Value} years experience"
                );
            }


            if (
                doctor.PatientsAttended > 0
            )
            {
                reasons.Add(
                    $"{doctor.PatientsAttended} patients attended"
                );
            }


            if (
                decision.MaxFee > 0
                &&
                FitsBudget(
                    doctor,
                    decision.MaxFee
                )
            )
            {
                reasons.Add(
                    "within your budget"
                );
            }


            if (
                !string.IsNullOrWhiteSpace(
                    decision
                        .WorkingPlaceKeyword
                )
                &&
                MatchesPlace(
                    doctor,
                    decision
                        .WorkingPlaceKeyword
                )
            )
            {
                reasons.Add(
                    "matches your location preference"
                );
            }


            return string.Join(
                " • ",
                reasons
            );
        }


        // =====================================================
        // ADDITIONAL LOCAL EMERGENCY CHECK
        // =====================================================

        private static bool
            LooksLikeEmergency(
                string text
            )
        {
            var value =
                text
                    .Trim()
                    .ToLowerInvariant();


            var emergencyPhrases =
                new[]
                {
                    "cannot breathe",
                    "can't breathe",
                    "cant breathe",
                    "difficulty breathing",
                    "severe shortness of breath",
                    "severe chest pain",
                    "unconscious",
                    "not responding",
                    "heavy bleeding",
                    "bleeding won't stop",
                    "bleeding wont stop",
                    "face drooping",
                    "slurred speech",
                    "one-sided weakness",
                    "one sided weakness",
                    "having a seizure",
                    "severe seizure",
                    "overdose",
                    "kill myself",
                    "suicidal"
                };


            return
                emergencyPhrases.Any(
                    phrase =>
                        value.Contains(
                            phrase
                        )
                );
        }


        // =====================================================
        // INTERNAL DATABASE OBJECT
        // =====================================================

        private sealed class DoctorCandidate
        {
            public int Id { get; set; }


            public string FullName
            {
                get;
                set;
            } = "";


            public string Gender
            {
                get;
                set;
            } = "";


            public string?
                Qualifications
            {
                get;
                set;
            }


            public string?
                Specialty
            {
                get;
                set;
            }


            public string?
                WorkingPlace
            {
                get;
                set;
            }


            public int?
                ExperienceYears
            {
                get;
                set;
            }


            public decimal?
                ConsultationFee
            {
                get;
                set;
            }


            public int
                PatientsAttended
            {
                get;
                set;
            }


            public string?
                ProfileImage
            {
                get;
                set;
            }
        }
    }
}