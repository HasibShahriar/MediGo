namespace Server.Models
{
    public class Medicine
    {
        public int Id { get; set; }


        public string Name { get; set; } = "";


        public string GenericName { get; set; } = "";


        public string? BrandName { get; set; }


        public string Manufacturer { get; set; } = "";


        public string Category { get; set; } = "";


        public string Strength { get; set; } = "";


        public string DosageForm { get; set; } = "";


        public string? PackSize { get; set; }


        public decimal Price { get; set; }


        public int StockQuantity { get; set; }


        public bool PrescriptionRequired { get; set; }


        public string? Description { get; set; }


        public string? Image { get; set; }


        public bool IsAvailable { get; set; }
            = true;


        public DateTime CreatedAt { get; set; }
            = DateTime.Now;
    }
}