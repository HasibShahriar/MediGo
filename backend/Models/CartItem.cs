namespace Server.Models
{
    public class CartItem
    {
        public int Id { get; set; }


        public int PatientId { get; set; }


        public int MedicineId { get; set; }


        public int Quantity { get; set; }
            = 1;


        public DateTime CreatedAt { get; set; }
            = DateTime.Now;


        public DateTime UpdatedAt { get; set; }
            = DateTime.Now;
    }
}