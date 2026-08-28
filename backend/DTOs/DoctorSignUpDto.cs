namespace Server.DTOs
{
    public class DoctorSignUpDto
    {
        public string Title { get; set; } = "";

        public string FirstName { get; set; } = "";

        public string LastName { get; set; } = "";

        public DateTime DateOfBirth { get; set; }

        public string Gender { get; set; } = "";

        public string NationalId { get; set; } = "";

        public string BmdcNumber { get; set; } = "";

        public string Phone { get; set; } = "";

        public string Email { get; set; } = "";

        public string Password { get; set; } = "";

        public bool AcceptedTerms { get; set; }
    }
}