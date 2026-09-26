using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Server.Data;
using Server.DTOs;
using Server.Models;


namespace Server.Controllers
{
    [Route("api/admin/medicines")]
    [ApiController]
    public class AdminMedicineController : ControllerBase
    {
        private readonly AppDbContext _context;

        private readonly IWebHostEnvironment _environment;


        // =====================================================
        // CONSTRUCTOR
        // =====================================================

        public AdminMedicineController(
            AppDbContext context,
            IWebHostEnvironment environment
        )
        {
            _context = context;

            _environment = environment;
        }



        // =====================================================
        // GET ALL MEDICINES
        //
        // GET:
        // api/admin/medicines
        // =====================================================

        [HttpGet]
        public async Task<IActionResult> GetMedicines()
        {
            try
            {
                var medicines =
                    await _context.Medicines

                        .OrderByDescending(
                            medicine =>
                                medicine.Id
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

                                    medicine.IsAvailable,

                                    medicine.CreatedAt
                                }
                        )

                        .ToListAsync();


                return Ok(
                    medicines
                );
            }

            catch (Exception ex)
            {
                Console.WriteLine(
                    "===================================="
                );

                Console.WriteLine(
                    "GET MEDICINES ERROR"
                );

                Console.WriteLine(
                    ex.Message
                );

                Console.WriteLine(
                    ex.InnerException?.Message
                );

                Console.WriteLine(
                    "===================================="
                );


                return StatusCode(
                    StatusCodes
                        .Status500InternalServerError,

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
        // GET ONE MEDICINE
        //
        // GET:
        // api/admin/medicines/5
        // =====================================================

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetMedicine(
            int id
        )
        {
            try
            {
                var medicine =
                    await _context.Medicines
                        .FirstOrDefaultAsync(
                            m =>
                                m.Id == id
                        );


                if (medicine == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Medicine not found."
                    });
                }


                return Ok(
                    medicine
                );
            }

            catch (Exception ex)
            {
                Console.WriteLine(
                    "GET MEDICINE ERROR:"
                );

                Console.WriteLine(
                    ex.Message
                );


                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "Could not load medicine.",

                        detail =
                            ex.InnerException?.Message
                            ??
                            ex.Message
                    }
                );
            }
        }



        // =====================================================
        // ADD MEDICINE
        //
        // POST:
        // api/admin/medicines
        // =====================================================

        [HttpPost]
        public async Task<IActionResult> AddMedicine(
            [FromForm] MedicineUpsertDto dto
        )
        {
            try
            {

                // =============================================
                // VALIDATION
                // =============================================

                var validationResult =
                    ValidateMedicine(
                        dto
                    );


                if (
                    validationResult != null
                )
                {
                    return validationResult;
                }



                var name =
                    dto.Name.Trim();


                var genericName =
                    dto.GenericName.Trim();


                var manufacturer =
                    dto.Manufacturer.Trim();


                var category =
                    dto.Category.Trim();


                var strength =
                    dto.Strength.Trim();


                var dosageForm =
                    dto.DosageForm.Trim();



                // =============================================
                // DUPLICATE CHECK
                // =============================================

                var duplicate =
                    await _context.Medicines
                        .AnyAsync(
                            medicine =>

                                medicine.Name.ToLower()
                                ==
                                name.ToLower()

                                &&

                                medicine.Strength.ToLower()
                                ==
                                strength.ToLower()

                                &&

                                medicine.Manufacturer.ToLower()
                                ==
                                manufacturer.ToLower()
                        );


                if (duplicate)
                {
                    return Conflict(new
                    {
                        message =
                            "This medicine already exists."
                    });
                }



                // =============================================
                // IMAGE
                // =============================================

                string? imagePath =
                    null;


                if (
                    dto.Image != null
                )
                {
                    var imageError =
                        await ValidateImage(
                            dto.Image
                        );


                    if (
                        imageError != null
                    )
                    {
                        return BadRequest(new
                        {
                            message =
                                imageError
                        });
                    }


                    imagePath =
                        await SaveImage(
                            dto.Image
                        );
                }



                // =============================================
                // CREATE MEDICINE
                // =============================================

                var medicine =
                    new Medicine
                    {
                        Name =
                            name,

                        GenericName =
                            genericName,

                        BrandName =
                            CleanOptional(
                                dto.BrandName
                            ),

                        Manufacturer =
                            manufacturer,

                        Category =
                            category,

                        Strength =
                            strength,

                        DosageForm =
                            dosageForm,

                        PackSize =
                            CleanOptional(
                                dto.PackSize
                            ),

                        Price =
                            dto.Price,

                        StockQuantity =
                            dto.StockQuantity,

                        PrescriptionRequired =
                            dto.PrescriptionRequired,

                        Description =
                            CleanOptional(
                                dto.Description
                            ),

                        Image =
                            imagePath,

                        IsAvailable =
                            dto.IsAvailable,

                        CreatedAt =
                            DateTime.Now
                    };



                // =============================================
                // SAVE DATABASE
                // =============================================

                _context.Medicines.Add(
                    medicine
                );


                await _context.SaveChangesAsync();



                return Ok(new
                {
                    message =
                        "Medicine added successfully!",

                    medicine
                });

            }

            catch (DbUpdateException ex)
            {
                Console.WriteLine(
                    "===================================="
                );

                Console.WriteLine(
                    "MEDICINE DATABASE ERROR"
                );

                Console.WriteLine(
                    ex.Message
                );

                Console.WriteLine(
                    ex.InnerException?.Message
                );

                Console.WriteLine(
                    "===================================="
                );


                return StatusCode(
                    StatusCodes
                        .Status500InternalServerError,

                    new
                    {
                        message =
                            "Database could not save the medicine.",

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
                    "===================================="
                );

                Console.WriteLine(
                    "ADD MEDICINE ERROR"
                );

                Console.WriteLine(
                    ex.Message
                );

                Console.WriteLine(
                    ex.InnerException?.Message
                );

                Console.WriteLine(
                    "===================================="
                );


                return StatusCode(
                    StatusCodes
                        .Status500InternalServerError,

                    new
                    {
                        message =
                            "Could not save medicine.",

                        detail =
                            ex.InnerException?.Message
                            ??
                            ex.Message
                    }
                );
            }
        }



        // =====================================================
        // UPDATE MEDICINE
        //
        // PUT:
        // api/admin/medicines/5
        // =====================================================

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateMedicine(
            int id,
            [FromForm] MedicineUpsertDto dto
        )
        {
            try
            {

                // =============================================
                // FIND
                // =============================================

                var medicine =
                    await _context.Medicines
                        .FirstOrDefaultAsync(
                            m =>
                                m.Id == id
                        );


                if (
                    medicine == null
                )
                {
                    return NotFound(new
                    {
                        message =
                            "Medicine not found."
                    });
                }



                // =============================================
                // VALIDATE
                // =============================================

                var validationResult =
                    ValidateMedicine(
                        dto
                    );


                if (
                    validationResult != null
                )
                {
                    return validationResult;
                }



                var name =
                    dto.Name.Trim();


                var manufacturer =
                    dto.Manufacturer.Trim();


                var strength =
                    dto.Strength.Trim();



                // =============================================
                // DUPLICATE CHECK
                // =============================================

                var duplicate =
                    await _context.Medicines
                        .AnyAsync(
                            currentMedicine =>

                                currentMedicine.Id
                                !=
                                id

                                &&

                                currentMedicine.Name.ToLower()
                                ==
                                name.ToLower()

                                &&

                                currentMedicine.Strength.ToLower()
                                ==
                                strength.ToLower()

                                &&

                                currentMedicine.Manufacturer.ToLower()
                                ==
                                manufacturer.ToLower()
                        );


                if (
                    duplicate
                )
                {
                    return Conflict(new
                    {
                        message =
                            "Another identical medicine already exists."
                    });
                }



                // =============================================
                // NEW IMAGE
                // =============================================

                if (
                    dto.Image != null
                )
                {
                    var imageError =
                        await ValidateImage(
                            dto.Image
                        );


                    if (
                        imageError != null
                    )
                    {
                        return BadRequest(new
                        {
                            message =
                                imageError
                        });
                    }


                    var newImage =
                        await SaveImage(
                            dto.Image
                        );


                    var oldImage =
                        medicine.Image;


                    medicine.Image =
                        newImage;


                    DeleteImage(
                        oldImage
                    );
                }



                // =============================================
                // UPDATE VALUES
                // =============================================

                medicine.Name =
                    name;


                medicine.GenericName =
                    dto.GenericName.Trim();


                medicine.BrandName =
                    CleanOptional(
                        dto.BrandName
                    );


                medicine.Manufacturer =
                    manufacturer;


                medicine.Category =
                    dto.Category.Trim();


                medicine.Strength =
                    strength;


                medicine.DosageForm =
                    dto.DosageForm.Trim();


                medicine.PackSize =
                    CleanOptional(
                        dto.PackSize
                    );


                medicine.Price =
                    dto.Price;


                medicine.StockQuantity =
                    dto.StockQuantity;


                medicine.PrescriptionRequired =
                    dto.PrescriptionRequired;


                medicine.Description =
                    CleanOptional(
                        dto.Description
                    );


                medicine.IsAvailable =
                    dto.IsAvailable;



                // =============================================
                // SAVE
                // =============================================

                await _context.SaveChangesAsync();



                return Ok(new
                {
                    message =
                        "Medicine updated successfully!",

                    medicine
                });

            }

            catch (DbUpdateException ex)
            {
                Console.WriteLine(
                    "UPDATE MEDICINE DATABASE ERROR:"
                );

                Console.WriteLine(
                    ex.InnerException?.Message
                    ??
                    ex.Message
                );


                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "Database could not update medicine.",

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
                    "UPDATE MEDICINE ERROR:"
                );

                Console.WriteLine(
                    ex.Message
                );


                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "Could not update medicine.",

                        detail =
                            ex.InnerException?.Message
                            ??
                            ex.Message
                    }
                );
            }
        }



        // =====================================================
        // DELETE MEDICINE
        //
        // DELETE:
        // api/admin/medicines/5
        // =====================================================

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteMedicine(
            int id
        )
        {
            try
            {
                var medicine =
                    await _context.Medicines
                        .FirstOrDefaultAsync(
                            m =>
                                m.Id == id
                        );


                if (
                    medicine == null
                )
                {
                    return NotFound(new
                    {
                        message =
                            "Medicine not found."
                    });
                }



                var image =
                    medicine.Image;



                _context.Medicines.Remove(
                    medicine
                );


                await _context.SaveChangesAsync();



                DeleteImage(
                    image
                );



                return Ok(new
                {
                    message =
                        "Medicine deleted successfully!"
                });
            }

            catch (DbUpdateException ex)
            {
                Console.WriteLine(
                    "DELETE MEDICINE DATABASE ERROR:"
                );

                Console.WriteLine(
                    ex.InnerException?.Message
                    ??
                    ex.Message
                );


                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "Database could not delete medicine.",

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
                    "DELETE MEDICINE ERROR:"
                );

                Console.WriteLine(
                    ex.Message
                );


                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "Could not delete medicine.",

                        detail =
                            ex.InnerException?.Message
                            ??
                            ex.Message
                    }
                );
            }
        }



        // =====================================================
        // VALIDATE MEDICINE
        // =====================================================

        private IActionResult? ValidateMedicine(
            MedicineUpsertDto dto
        )
        {

            // =============================================
            // NAME
            // =============================================

            if (
                string.IsNullOrWhiteSpace(
                    dto.Name
                )
            )
            {
                return BadRequest(new
                {
                    message =
                        "Medicine name is required."
                });
            }



            // =============================================
            // GENERIC
            // =============================================

            if (
                string.IsNullOrWhiteSpace(
                    dto.GenericName
                )
            )
            {
                return BadRequest(new
                {
                    message =
                        "Generic name is required."
                });
            }



            // =============================================
            // MANUFACTURER
            // =============================================

            if (
                string.IsNullOrWhiteSpace(
                    dto.Manufacturer
                )
            )
            {
                return BadRequest(new
                {
                    message =
                        "Manufacturer is required."
                });
            }



            // =============================================
            // CATEGORY
            // =============================================

            if (
                string.IsNullOrWhiteSpace(
                    dto.Category
                )
            )
            {
                return BadRequest(new
                {
                    message =
                        "Category is required."
                });
            }



            // =============================================
            // STRENGTH
            // =============================================

            if (
                string.IsNullOrWhiteSpace(
                    dto.Strength
                )
            )
            {
                return BadRequest(new
                {
                    message =
                        "Strength is required."
                });
            }



            // =============================================
            // DOSAGE FORM
            // =============================================

            if (
                string.IsNullOrWhiteSpace(
                    dto.DosageForm
                )
            )
            {
                return BadRequest(new
                {
                    message =
                        "Dosage form is required."
                });
            }



            // =============================================
            // PRICE
            // =============================================

            if (
                dto.Price < 0
            )
            {
                return BadRequest(new
                {
                    message =
                        "Price cannot be negative."
                });
            }



            // =============================================
            // STOCK
            // =============================================

            if (
                dto.StockQuantity < 0
            )
            {
                return BadRequest(new
                {
                    message =
                        "Stock quantity cannot be negative."
                });
            }



            // =============================================
            // DESCRIPTION
            // =============================================

            if (
                dto.Description != null

                &&

                dto.Description.Length > 1000
            )
            {
                return BadRequest(new
                {
                    message =
                        "Description cannot exceed 1000 characters."
                });
            }



            return null;
        }



        // =====================================================
        // VALIDATE IMAGE
        // =====================================================

        private async Task<string?> ValidateImage(
            IFormFile image
        )
        {

            // Empty
            if (
                image.Length <= 0
            )
            {
                return
                    "Selected image is empty.";
            }



            // 5 MB
            if (
                image.Length >
                5 * 1024 * 1024
            )
            {
                return
                    "Medicine image must be smaller than 5 MB.";
            }



            var extension =
                Path.GetExtension(
                    image.FileName
                )
                .ToLowerInvariant();



            var allowedExtensions =
                new[]
                {
                    ".jpg",
                    ".jpeg",
                    ".png"
                };



            if (
                !allowedExtensions.Contains(
                    extension
                )
            )
            {
                return
                    "Only JPG, JPEG and PNG images are allowed.";
            }



            var contentType =
                image.ContentType
                    .ToLowerInvariant();



            if (
                contentType !=
                "image/jpeg"

                &&

                contentType !=
                "image/png"
            )
            {
                return
                    "Invalid image type.";
            }



            // =============================================
            // ACTUAL FILE SIGNATURE
            // =============================================

            await using var stream =
                image.OpenReadStream();


            var header =
                new byte[8];


            var bytesRead =
                await stream.ReadAsync(
                    header,
                    0,
                    header.Length
                );



            bool validImage;



            // JPG
            if (
                extension == ".jpg"

                ||

                extension == ".jpeg"
            )
            {
                validImage =

                    bytesRead >= 3

                    &&

                    header[0] == 0xFF

                    &&

                    header[1] == 0xD8

                    &&

                    header[2] == 0xFF;
            }

            // PNG
            else
            {
                validImage =

                    bytesRead >= 8

                    &&

                    header[0] == 0x89

                    &&

                    header[1] == 0x50

                    &&

                    header[2] == 0x4E

                    &&

                    header[3] == 0x47

                    &&

                    header[4] == 0x0D

                    &&

                    header[5] == 0x0A

                    &&

                    header[6] == 0x1A

                    &&

                    header[7] == 0x0A;
            }



            if (
                !validImage
            )
            {
                return
                    "Uploaded file is not a valid image.";
            }



            return null;
        }



        // =====================================================
        // SAVE IMAGE
        // =====================================================

        private async Task<string> SaveImage(
            IFormFile image
        )
        {

            var webRoot =
                _environment.WebRootPath;



            if (
                string.IsNullOrWhiteSpace(
                    webRoot
                )
            )
            {
                webRoot =
                    Path.Combine(
                        Directory
                            .GetCurrentDirectory(),

                        "wwwroot"
                    );
            }



            var medicineFolder =
                Path.Combine(
                    webRoot,
                    "uploads",
                    "medicines"
                );



            Directory.CreateDirectory(
                medicineFolder
            );



            var extension =
                Path.GetExtension(
                    image.FileName
                )
                .ToLowerInvariant();



            var fileName =
                $"medicine_{Guid.NewGuid()}{extension}";



            var fullPath =
                Path.Combine(
                    medicineFolder,
                    fileName
                );



            await using (
                var fileStream =
                    new FileStream(
                        fullPath,
                        FileMode.Create
                    )
            )
            {
                await image.CopyToAsync(
                    fileStream
                );
            }



            return
                $"uploads/medicines/{fileName}";
        }



        // =====================================================
        // DELETE IMAGE
        // =====================================================

        private void DeleteImage(
            string? imagePath
        )
        {

            if (
                string.IsNullOrWhiteSpace(
                    imagePath
                )
            )
            {
                return;
            }



            var cleanPath =
                imagePath
                    .Replace(
                        '\\',
                        '/'
                    )
                    .TrimStart('/');



            // Important:
            // only delete medicine images
            if (
                !cleanPath.StartsWith(
                    "uploads/medicines/",
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                return;
            }



            var webRoot =
                _environment.WebRootPath;



            if (
                string.IsNullOrWhiteSpace(
                    webRoot
                )
            )
            {
                webRoot =
                    Path.Combine(
                        Directory
                            .GetCurrentDirectory(),

                        "wwwroot"
                    );
            }



            var relativePath =
                cleanPath.Replace(
                    '/',
                    Path.DirectorySeparatorChar
                );



            var fullPath =
                Path.Combine(
                    webRoot,
                    relativePath
                );



            if (
                System.IO.File.Exists(
                    fullPath
                )
            )
            {
                System.IO.File.Delete(
                    fullPath
                );
            }
        }



        // =====================================================
        // CLEAN OPTIONAL STRING
        // =====================================================

        private string? CleanOptional(
            string? value
        )
        {
            if (
                string.IsNullOrWhiteSpace(
                    value
                )
            )
            {
                return null;
            }


            return value.Trim();
        }
    }
}