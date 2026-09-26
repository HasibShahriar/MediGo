using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Server.Data;
using Server.DTOs;
using Server.Models;


namespace Server.Controllers
{
    [Route("api/pharmacy")]
    [ApiController]
    public class PharmacyController : ControllerBase
    {
        private readonly AppDbContext _context;


        public PharmacyController(
            AppDbContext context
        )
        {
            _context = context;
        }



        // =====================================================
        // GET ALL MEDICINES FOR PHARMACY
        //
        // GET:
        // api/pharmacy/medicines
        // =====================================================

        [HttpGet("medicines")]
        public async Task<IActionResult> GetMedicines()
        {
            try
            {
                var medicines =
                    await _context.Medicines

                        .Where(
                            medicine =>
                                medicine.IsAvailable
                        )

                        .OrderBy(
                            medicine =>
                                medicine.Name
                        )

                        .Select(
                            medicine =>
                                new
                                {
                                    medicine.Id,

                                    medicine.Name,

                                    medicine.GenericName,

                                    medicine.BrandName,

                                    medicine.Manufacturer,

                                    medicine.Category,

                                    medicine.Strength,

                                    medicine.DosageForm,

                                    medicine.PackSize,

                                    medicine.Price,

                                    medicine.StockQuantity,

                                    medicine.PrescriptionRequired,

                                    medicine.Description,

                                    medicine.Image,

                                    medicine.IsAvailable
                                }
                        )

                        .ToListAsync();



                return Ok(
                    medicines
                );
            }

            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "Could not load medicines.",

                        detail =
                            ex.InnerException?.Message
                            ??
                            ex.Message
                    }
                );
            }
        }



        // =====================================================
        // GET PATIENT CART COUNT
        //
        // GET:
        // api/pharmacy/cart/5/count
        // =====================================================

        [HttpGet("cart/{patientId:int}/count")]
        public async Task<IActionResult> GetCartCount(
            int patientId
        )
        {
            try
            {
                var patientExists =
                    await _context.Patients
                        .AnyAsync(
                            patient =>
                                patient.Id ==
                                patientId
                        );


                if (!patientExists)
                {
                    return NotFound(new
                    {
                        message =
                            "Patient not found."
                    });
                }



                var count =
                    await _context.CartItems

                        .Where(
                            item =>
                                item.PatientId ==
                                patientId
                        )

                        .SumAsync(
                            item =>
                                (int?)item.Quantity
                        )

                    ?? 0;



                return Ok(new
                {
                    count
                });
            }

            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "Could not load cart count.",

                        detail =
                            ex.InnerException?.Message
                            ??
                            ex.Message
                    }
                );
            }
        }



        // =====================================================
        // ADD MEDICINE TO CART
        //
        // POST:
        // api/pharmacy/cart
        //
        // IMPORTANT:
        //
        // Adding medicine immediately decreases stock.
        // =====================================================

        [HttpPost("cart")]
        public async Task<IActionResult> AddToCart(
            AddToCartDto dto
        )
        {
            try
            {
                // =============================================
                // VALIDATE PATIENT ID
                // =============================================

                if (dto.PatientId <= 0)
                {
                    return BadRequest(new
                    {
                        message =
                            "Please login as a patient first."
                    });
                }



                // =============================================
                // VALIDATE MEDICINE ID
                // =============================================

                if (dto.MedicineId <= 0)
                {
                    return BadRequest(new
                    {
                        message =
                            "Invalid medicine."
                    });
                }



                // =============================================
                // QUANTITY
                // =============================================

                var quantity =
                    dto.Quantity <= 0
                        ? 1
                        : dto.Quantity;



                // =============================================
                // TRANSACTION
                //
                // Cart + stock must change together.
                // =============================================

                await using var transaction =
                    await _context.Database
                        .BeginTransactionAsync();



                // =============================================
                // FIND PATIENT
                // =============================================

                var patient =
                    await _context.Patients
                        .FirstOrDefaultAsync(
                            currentPatient =>
                                currentPatient.Id ==
                                dto.PatientId
                        );


                if (patient == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Patient account not found."
                    });
                }



                if (!patient.IsVisible)
                {
                    return StatusCode(
                        StatusCodes.Status403Forbidden,
                        new
                        {
                            message =
                                "Your patient account is currently unavailable."
                        }
                    );
                }



                // =============================================
                // FIND MEDICINE
                // =============================================

                var medicine =
                    await _context.Medicines
                        .FirstOrDefaultAsync(
                            currentMedicine =>
                                currentMedicine.Id ==
                                dto.MedicineId
                        );


                if (medicine == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Medicine not found."
                    });
                }



                // =============================================
                // ADMIN DISABLED MEDICINE
                // =============================================

                if (!medicine.IsAvailable)
                {
                    return BadRequest(new
                    {
                        message =
                            "This medicine is currently unavailable."
                    });
                }



                // =============================================
                // CHECK AVAILABLE STOCK
                // =============================================

                if (
                    medicine.StockQuantity <= 0
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "This medicine is out of stock."
                    });
                }



                if (
                    medicine.StockQuantity <
                    quantity
                )
                {
                    return BadRequest(new
                    {
                        message =
                            $"Only {medicine.StockQuantity} item(s) are available."
                    });
                }



                // =============================================
                // CHECK IF SAME MEDICINE ALREADY EXISTS
                // IN THIS PATIENT'S CART
                // =============================================

                var existingItem =
                    await _context.CartItems
                        .FirstOrDefaultAsync(
                            item =>

                                item.PatientId ==
                                dto.PatientId

                                &&

                                item.MedicineId ==
                                dto.MedicineId
                        );



                // =============================================
                // ALREADY EXISTS
                //
                // Increase existing quantity.
                // =============================================

                if (existingItem != null)
                {
                    existingItem.Quantity +=
                        quantity;


                    existingItem.UpdatedAt =
                        DateTime.Now;
                }

                else
                {
                    // =========================================
                    // FIRST TIME ADDING THIS MEDICINE
                    // =========================================

                    var cartItem =
                        new CartItem
                        {
                            PatientId =
                                dto.PatientId,

                            MedicineId =
                                dto.MedicineId,

                            Quantity =
                                quantity,

                            CreatedAt =
                                DateTime.Now,

                            UpdatedAt =
                                DateTime.Now
                        };


                    _context.CartItems.Add(
                        cartItem
                    );
                }



                // =============================================
                // DECREASE STOCK
                //
                // Example:
                //
                // stock = 20
                // add quantity = 2
                //
                // new stock = 18
                // =============================================

                medicine.StockQuantity -=
                    quantity;



                // =============================================
                // SAVE CART + STOCK
                // =============================================

                await _context.SaveChangesAsync();



                // Everything successful.
                await transaction.CommitAsync();



                // =============================================
                // GET UPDATED CART COUNT
                // =============================================

                var cartCount =
                    await _context.CartItems

                        .Where(
                            item =>
                                item.PatientId ==
                                dto.PatientId
                        )

                        .SumAsync(
                            item =>
                                (int?)item.Quantity
                        )

                    ?? 0;



                // =============================================
                // SUCCESS
                // =============================================

                return Ok(new
                {
                    message =
                        $"{medicine.Name} added to cart!",

                    medicineId =
                        medicine.Id,

                    medicineName =
                        medicine.Name,

                    addedQuantity =
                        quantity,

                    remainingStock =
                        medicine.StockQuantity,

                    cartCount
                });
            }

            catch (DbUpdateException ex)
            {
                Console.WriteLine(
                    "=================================="
                );

                Console.WriteLine(
                    "ADD TO CART DATABASE ERROR"
                );

                Console.WriteLine(
                    ex.InnerException?.Message
                    ??
                    ex.Message
                );

                Console.WriteLine(
                    "=================================="
                );


                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "Database could not update the cart.",

                        detail =
                            ex.InnerException?.Message
                            ??
                            ex.Message
                    }
                );
            }

            catch (Exception ex)
            {
                Console.WriteLine(
                    "=================================="
                );

                Console.WriteLine(
                    "ADD TO CART ERROR"
                );

                Console.WriteLine(
                    ex.InnerException?.Message
                    ??
                    ex.Message
                );

                Console.WriteLine(
                    "=================================="
                );


                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "Could not add medicine to cart.",

                        detail =
                            ex.InnerException?.Message
                            ??
                            ex.Message
                    }
                );
            }
        }
    }
}