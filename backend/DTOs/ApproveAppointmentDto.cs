namespace Server.DTOs
{
    public class ApproveAppointmentDto
    {
        public string SerialNo { get; set; }
            = "";

        public DateTime AppointmentDate { get; set; }

        public TimeSpan PatientTime { get; set; }

        public string? Comment { get; set; }
    }
}