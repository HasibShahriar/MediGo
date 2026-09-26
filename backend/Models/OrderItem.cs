namespace Server.Models
{
    public class OrderItem
    {
        public int Id { get; set; }


        public int OrderId { get; set; }


        public int? MedicineId { get; set; }


        public string MedicineName { get; set; }
            = "";


        public string? GenericName { get; set; }


        public string? Strength { get; set; }


        public decimal UnitPrice { get; set; }


        public int Quantity { get; set; }


        public decimal LineTotal { get; set; }
    }
}