namespace Server.DTOs
{
    public class ContactMessageCreateDto
    {
        public int PatientId { get; set; }


        public string Concern { get; set; } = "";


        public string Message { get; set; } = "";
    }
}