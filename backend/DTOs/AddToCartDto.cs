namespace Server.DTOs
{
    public class AddToCartDto
    {
        public int PatientId { get; set; }


        public int MedicineId { get; set; }


        public int Quantity { get; set; }
            = 1;
    }
}