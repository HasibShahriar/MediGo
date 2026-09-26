namespace Server.Models
{
    public class AppointmentPayment
    {
        public int Id { get; set; }

        public int AppointmentRequestId { get; set; }

        public string TransactionId { get; set; }
            = "";

        public decimal Amount { get; set; }

        public string Currency { get; set; }
            = "BDT";

        public string? SessionKey { get; set; }

        public string? ValidationId { get; set; }

        public string? BankTransactionId { get; set; }

        public string? CardType { get; set; }

        public string Status { get; set; }
            = "Initiated";

        public DateTime CreatedAt { get; set; }
            = DateTime.Now;

        public DateTime? PaidAt { get; set; }
    }
}