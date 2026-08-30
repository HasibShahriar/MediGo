namespace Server.DTOs
{
    public class DoctorPasswordUpdateDto
    {
        public string CurrentPassword { get; set; } = "";

        public string NewPassword { get; set; } = "";
    }
}