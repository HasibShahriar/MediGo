namespace Server.Models
{
    public class ContactMessage
    {
        public int Id { get; set; }


        // Nullable because older messages may not
        // have been connected to a patient account.
        public int? PatientId { get; set; }


        public string Name { get; set; }
            = string.Empty;


        public string Email { get; set; }
            = string.Empty;


        public string Concern { get; set; }
            = string.Empty;


        public string Message { get; set; }
            = string.Empty;


        public bool IsRead { get; set; }
            = false;


        public DateTime CreatedAt { get; set; }
            = DateTime.Now;
    }
}