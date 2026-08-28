namespace Server.DTOs
{
    public class PatientSignUpDto
    {
        public string FullName { get; set; } = "";

        public DateTime DateOfBirth { get; set; }

        public string Gender { get; set; } = "";

        public string Phone { get; set; } = "";

        public string Email { get; set; } = "";

        public string Address { get; set; } = "";

        public string Password { get; set; } = "";
    }
}