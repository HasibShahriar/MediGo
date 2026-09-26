using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;


namespace Server.Controllers
{
    [Route("api/admin/medicine-orders")]
    [ApiController]
    public class AdminMedicineOrderController : ControllerBase
    {
        private readonly AppDbContext _context;


        public AdminMedicineOrderController(
            AppDbContext context
        )
        {
            _context = context;
        }



        // =====================================================
        // GET ALL MEDICINE ORDERS
        //
        // GET:
        // /api/admin/medicine-orders
        // =====================================================

        [HttpGet]
        public async Task<IActionResult> GetOrders()
        {
            try
            {
                var orders =
                    await (
                        from order in _context.Orders

                        join patient in _context.Patients
                            on order.PatientId equals patient.Id

                        orderby
                            order.CreatedAt descending

                        select new AdminMedicineOrderDto
                        {
                            Id =
                                order.Id,

                            OrderNumber =
                                order.OrderNumber,

                            PatientId =
                                patient.Id,

                            PatientName =
                                patient.FullName,

                            PatientEmail =
                                patient.Email,

                            PatientPhone =
                                patient.Phone,

                            TotalAmount =
                                order.TotalAmount,

                            PaymentStatus =
                                order.PaymentStatus,

                            CreatedAt =
                                order.CreatedAt,

                            PaidAt =
                                order.PaidAt,

                            Items =
                                new List<AdminMedicineOrderItemDto>()
                        }
                    )
                    .ToListAsync();



                // =================================================
                // LOAD ITEMS OF EACH ORDER
                // =================================================

                foreach (var order in orders)
                {
                    order.Items =
                        await (
                            from item in _context.OrderItems

                            join medicine in _context.Medicines
                                on item.MedicineId equals medicine.Id

                            where
                                item.OrderId == order.Id

                            select new AdminMedicineOrderItemDto
                            {
                                Id =
                                    item.Id,

                                MedicineId =
                                    medicine.Id,

                                MedicineName =
                                    medicine.Name,

                                GenericName =
                                    medicine.GenericName,

                                Strength =
                                    medicine.Strength,

                                Quantity =
                                    item.Quantity,

                                UnitPrice =
                                    item.UnitPrice,

                                LineTotal =
                                    item.LineTotal
                            }
                        )
                        .ToListAsync();
                }



                return Ok(
                    orders
                );
            }

            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,

                    new
                    {
                        message =
                            "Could not load medicine orders.",

                        detail =
                            ex.InnerException?.Message
                            ??
                            ex.Message
                    }
                );
            }
        }
    }



    // =========================================================
    // ORDER DTO
    // =========================================================

    public class AdminMedicineOrderDto
    {
        public int Id { get; set; }


        public string OrderNumber { get; set; }
            = "";


        public int PatientId { get; set; }


        public string PatientName { get; set; }
            = "";


        public string PatientEmail { get; set; }
            = "";


        public string PatientPhone { get; set; }
            = "";


        public decimal TotalAmount { get; set; }


        public string PaymentStatus { get; set; }
            = "";


        public DateTime CreatedAt { get; set; }


        public DateTime? PaidAt { get; set; }


        public List<AdminMedicineOrderItemDto> Items
        {
            get;
            set;
        } = new();
    }



    // =========================================================
    // ITEM DTO
    // =========================================================

    public class AdminMedicineOrderItemDto
    {
        public int Id { get; set; }


        public int MedicineId { get; set; }


        public string MedicineName { get; set; }
            = "";


        public string? GenericName { get; set; }


        public string? Strength { get; set; }


        public int Quantity { get; set; }


        public decimal UnitPrice { get; set; }


        public decimal LineTotal { get; set; }
    }
}