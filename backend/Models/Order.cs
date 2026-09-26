namespace Server.Models
{
    public class Order
    {
        public int Id { get; set; }

        public int PatientId { get; set; }


        public string OrderNumber { get; set; }
            = "";


        public string TransactionId { get; set; }
            = "";


        public decimal TotalAmount { get; set; }


        public string OrderStatus { get; set; }
            = "Awaiting Payment";


        public string PaymentStatus { get; set; }
            = "Unpaid";


        public DateTime CreatedAt { get; set; }
            = DateTime.Now;


        public DateTime? PaidAt { get; set; }
    }
}