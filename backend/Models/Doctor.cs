namespace Server.Models
{
    public class Doctor
    {
        public int Id { get; set; }

        public string Title { get; set; } = "";

        public string FirstName { get; set; } = "";

        public string LastName { get; set; } = "";

        public DateTime DateOfBirth { get; set; }

        public string Gender { get; set; } = "";

        public string NationalId { get; set; } = "";

        public string BmdcNumber { get; set; } = "";

        public string Phone { get; set; } = "";

        public string Email { get; set; } = "";

        public string PasswordHash { get; set; } = "";

        public bool AcceptedTerms { get; set; }

        public DateTime? TermsAcceptedAt { get; set; }

        public string RequestStatus { get; set; } = "pending";

        public bool IsVisible { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}