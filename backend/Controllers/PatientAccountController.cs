using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Server.Data;


namespace Server.Controllers
{
    [Route("api/patient-account")]
    [ApiController]
    public class PatientAccountController : ControllerBase
    {
        private readonly AppDbContext _context;


        public PatientAccountController(
            AppDbContext context
        )
        {
            _context = context;
        }


        // =====================================================
        // GET PATIENT CART
        //
        // GET:
        // /api/patient-account/5/cart
        // =====================================================

        [HttpGet("{patientId:int}/cart")]
        public async Task<IActionResult> GetPatientCart(
            int patientId
        )
        {
            try
            {
                var patient =
                    await _context.Patients
                        .FirstOrDefaultAsync(
                            p =>
                                p.Id == patientId
                        );


                if (patient == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Patient not found."
                    });
                }


                var cartItems =
                    await (
                        from cart
                        in _context.CartItems

                        join medicine
                        in _context.Medicines

                        on cart.MedicineId
                        equals medicine.Id

                        where
                            cart.PatientId ==
                            patientId

                        orderby
                            cart.UpdatedAt descending

                        select new
                        {
                            id =
                                cart.Id,

                            patientId =
                                cart.PatientId,

                            medicineId =
                                cart.MedicineId,

                            quantity =
                                cart.Quantity,

                            createdAt =
                                cart.CreatedAt,

                            updatedAt =
                                cart.UpdatedAt,


                            medicineName =
                                medicine.Name,

                            genericName =
                                medicine.GenericName,

                            brandName =
                                medicine.BrandName,

                            manufacturer =
                                medicine.Manufacturer,

                            category =
                                medicine.Category,

                            strength =
                                medicine.Strength,

                            dosageForm =
                                medicine.DosageForm,

                            packSize =
                                medicine.PackSize,

                            price =
                                medicine.Price,

                            stockQuantity =
                                medicine.StockQuantity,

                            prescriptionRequired =
                                medicine.PrescriptionRequired,

                            description =
                                medicine.Description,

                            image =
                                medicine.Image,

                            isAvailable =
                                medicine.IsAvailable
                        }
                    )
                    .ToListAsync();


                return Ok(
                    cartItems
                );
            }

            catch (Exception ex)
            {
                Console.WriteLine(
                    "PATIENT CART ERROR:"
                );

                Console.WriteLine(
                    ex.InnerException?.Message
                    ??
                    ex.Message
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Could not load patient cart.",

                        detail =
                            ex.InnerException?.Message
                            ??
                            ex.Message
                    }
                );
            }
        }


        // =====================================================
        // DELETE CART ITEM
        //
        // DELETE:
        // /api/patient-account/cart/3
        //
        // Example:
        //
        // Cart quantity = 4
        // Current medicine stock = 6
        //
        // Delete cart:
        // stock becomes 10
        // =====================================================

        [HttpDelete("cart/{cartItemId:int}")]
        public async Task<IActionResult> DeleteCartItem(
            int cartItemId
        )
        {
            await using var transaction =
                await _context.Database
                    .BeginTransactionAsync();


            try
            {
                // =============================================
                // FIND CART ITEM
                // =============================================

                var cartItem =
                    await _context.CartItems
                        .FirstOrDefaultAsync(
                            item =>
                                item.Id ==
                                cartItemId
                        );


                if (cartItem == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Cart item not found."
                    });
                }


                // =============================================
                // REMEMBER QUANTITY
                // =============================================

                var deletedQuantity =
                    cartItem.Quantity;


                // =============================================
                // FIND MEDICINE
                // =============================================

                var medicine =
                    await _context.Medicines
                        .FirstOrDefaultAsync(
                            item =>
                                item.Id ==
                                cartItem.MedicineId
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
                // RETURN CART QUANTITY TO STOCK
                // =============================================

                medicine.StockQuantity +=
                    deletedQuantity;


                // =============================================
                // REMOVE CART ROW
                // =============================================

                _context.CartItems.Remove(
                    cartItem
                );


                // =============================================
                // SAVE DATABASE
                // =============================================

                await _context.SaveChangesAsync();


                await transaction.CommitAsync();


                // =============================================
                // SUCCESS
                // =============================================

                return Ok(new
                {
                    message =
                        $"{medicine.Name} removed from cart.",

                    medicineId =
                        medicine.Id,

                    medicineName =
                        medicine.Name,

                    returnedQuantity =
                        deletedQuantity,

                    newStock =
                        medicine.StockQuantity
                });
            }

            catch (DbUpdateException ex)
            {
                await transaction.RollbackAsync();


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Database could not remove the cart item.",

                        detail =
                            ex.InnerException?.Message
                            ??
                            ex.Message
                    }
                );
            }

            catch (Exception ex)
            {
                await transaction.RollbackAsync();


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Could not remove medicine from cart.",

                        detail =
                            ex.InnerException?.Message
                            ??
                            ex.Message
                    }
                );
            }
        }


        // =====================================================
        // GET CART COUNT
        //
        // GET:
        // /api/patient-account/5/cart/count
        // =====================================================

        [HttpGet("{patientId:int}/cart/count")]
        public async Task<IActionResult> GetCartCount(
            int patientId
        )
        {
            try
            {
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
                    StatusCodes.Status500InternalServerError,
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
    }
}