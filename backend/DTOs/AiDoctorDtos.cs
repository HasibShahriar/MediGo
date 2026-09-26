using System.Text.Json.Serialization;

namespace Server.DTOs
{
    // =====================================================
    // ONE CHAT MESSAGE
    // =====================================================

    public class AiChatMessageDto
    {
        public string Role { get; set; } = "";

        public string Content { get; set; } = "";
    }


    // =====================================================
    // REQUEST FROM REACT
    // =====================================================

    public class AiDoctorChatRequestDto
    {
        public List<AiChatMessageDto> Messages { get; set; }
            = new();
    }


    // =====================================================
    // STRUCTURED DECISION FROM OPENAI
    // =====================================================

    public class AiDoctorDecisionDto
    {
        [JsonPropertyName("assistant_message")]
        public string AssistantMessage { get; set; } = "";


        [JsonPropertyName("needs_more_information")]
        public bool NeedsMoreInformation { get; set; }


        [JsonPropertyName("specialty")]
        public string Specialty { get; set; } = "";


        [JsonPropertyName("specialty_reason")]
        public string SpecialtyReason { get; set; } = "";


        [JsonPropertyName("urgency")]
        public string Urgency { get; set; } = "routine";


        [JsonPropertyName("preferred_gender")]
        public string PreferredGender { get; set; } = "any";


        [JsonPropertyName("max_fee")]
        public decimal MaxFee { get; set; }


        [JsonPropertyName("working_place_keyword")]
        public string WorkingPlaceKeyword { get; set; } = "";
    }


    // =====================================================
    // DOCTOR SHOWN INSIDE CHAT
    // =====================================================

    public class AiDoctorCardDto
    {
        public int Id { get; set; }

        public string FullName { get; set; } = "";

        public string Gender { get; set; } = "";

        public string? Qualifications { get; set; }

        public string? Specialty { get; set; }

        public string? WorkingPlace { get; set; }

        public int? ExperienceYears { get; set; }

        public decimal? ConsultationFee { get; set; }

        public int PatientsAttended { get; set; }

        public string? ProfileImage { get; set; }

        public string MatchReason { get; set; } = "";
    }


    // =====================================================
    // FINAL RESPONSE TO REACT
    // =====================================================

    public class AiDoctorChatResponseDto
    {
        public string AssistantMessage { get; set; } = "";

        public bool NeedsMoreInformation { get; set; }

        public string Specialty { get; set; } = "";

        public string SpecialtyDisplay { get; set; } = "";

        public string Urgency { get; set; } = "routine";

        public string Reason { get; set; } = "";

        public string RankingBasis { get; set; } = "";

        public List<AiDoctorCardDto> Doctors { get; set; }
            = new();
    }
}