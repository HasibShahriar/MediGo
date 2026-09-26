namespace Server.Models
{
    public class AppointmentRequest
    {
        public int Id { get; set; }


        public int PatientId { get; set; }


        public int DoctorId { get; set; }


        public string TransactionId { get; set; }
            = "";


        public decimal BookingFee { get; set; }
            = 50.00m;


        public decimal? ConsultationFee { get; set; }


        public string PaymentStatus { get; set; }
            = "Unpaid";


        public string RequestStatus { get; set; }
            = "Awaiting Payment";


        public string? SerialNo { get; set; }


        public DateTime? AppointmentDate { get; set; }


        public TimeSpan? PatientTime { get; set; }


        public string? DoctorComment { get; set; }


        public DateTime CreatedAt { get; set; }
            = DateTime.Now;


        public DateTime? PaidAt { get; set; }


        public DateTime? RespondedAt { get; set; }
    }
}