namespace Server.DTOs
{
    public class DoctorSettingsUpdateDto
    {
        // Existing Doctors table
        public string Title { get; set; } = "";

        public string FirstName { get; set; } = "";

        public string LastName { get; set; } = "";

        public string Email { get; set; } = "";

        public string Phone { get; set; } = "";


        // New DoctorSettings table
        public string? Qualifications { get; set; }

        public string? Specialty { get; set; }

        public string? WorkingPlace { get; set; }

        public string? WorkingDescription { get; set; }

        public int? ExperienceYears { get; set; }

        public string? Bio { get; set; }

        public int? InstantConsultationMinutes { get; set; }

        public int? AppointmentConsultationMinutes { get; set; }

        public decimal? ConsultationFee { get; set; }

        public decimal? FollowUpFee { get; set; }
    }
}