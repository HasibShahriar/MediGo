namespace Server.Models
{
    public class DoctorSetting
    {
        public int Id { get; set; }

        public int DoctorId { get; set; }

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

        public int PatientsAttended { get; set; } = 0;

        public string DoctorCode { get; set; } = "";

        public string? ProfileImage { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }
}