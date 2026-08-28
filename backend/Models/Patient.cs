namespace Server.Models
{
    public class Patient
    {
        public int Id { get; set; }

        public string FullName { get; set; } = "";

        public DateTime DateOfBirth { get; set; }

        public string Gender { get; set; } = "";

        public string Phone { get; set; } = "";

        public string Email { get; set; } = "";

        public string Address { get; set; } = "";

        public string PasswordHash { get; set; } = "";

        public string? ProfileImage { get; set; } = "";

        public bool IsVisible { get; set; } = true;
    }
}