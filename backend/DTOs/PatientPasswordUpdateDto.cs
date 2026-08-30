namespace Server.DTOs
{
    public class PatientPasswordUpdateDto
    {
        public string CurrentPassword { get; set; } = "";

        public string NewPassword { get; set; } = "";
    }
}