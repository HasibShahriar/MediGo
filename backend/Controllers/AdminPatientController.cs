using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Server.Data;


namespace Server.Controllers
{
    [Route("api/admin/patients")]
    [ApiController]
    public class AdminPatientController : ControllerBase
    {
        private readonly AppDbContext _context;

        private readonly IWebHostEnvironment _environment;


        // =====================================================
        // CONSTRUCTOR
        // =====================================================

        public AdminPatientController(
            AppDbContext context,
            IWebHostEnvironment environment
        )
        {
            _context = context;

            _environment = environment;
        }



        // =====================================================
        // GET ALL PATIENTS
        //
        // GET:
        // /api/admin/patients
        // =====================================================

        [HttpGet]
        public async Task<IActionResult> GetPatients()
        {
            try
            {
                var patients =
                    await _context.Patients
                        .OrderByDescending(
                            p => p.Id
                        )
                        .Select(
                            p => new
                            {
                                p.Id,

                                p.FullName,

                                p.Email,

                                p.Phone,

                                p.Gender,

                                p.DateOfBirth,

                                p.Address,

                                p.ProfileImage,

                                p.IsVisible
                            }
                        )
                        .ToListAsync();


                return Ok(
                    patients
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes
                        .Status500InternalServerError,

                    new
                    {
                        message =
                            "Could not load patients.",

                        detail =
                            ex.Message
                    }
                );
            }
        }



        // =====================================================
        // GET ONE PATIENT DETAILS
        //
        // GET:
        // /api/admin/patients/5
        // =====================================================

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetPatient(
            int id
        )
        {
            try
            {
                var patient =
                    await _context.Patients
                        .Where(
                            p => p.Id == id
                        )
                        .Select(
                            p => new
                            {
                                p.Id,

                                p.FullName,

                                p.DateOfBirth,

                                p.Gender,

                                p.Phone,

                                p.Email,

                                p.Address,

                                p.ProfileImage,

                                p.IsVisible
                            }
                        )
                        .FirstOrDefaultAsync();


                if (patient == null)
                {
                    return NotFound(
                        new
                        {
                            message =
                                "Patient not found."
                        }
                    );
                }


                return Ok(
                    patient
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes
                        .Status500InternalServerError,

                    new
                    {
                        message =
                            "Could not load patient details.",

                        detail =
                            ex.Message
                    }
                );
            }
        }



        // =====================================================
        // PERMANENTLY DELETE PATIENT
        //
        // DELETE:
        // /api/admin/patients/5
        // =====================================================

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeletePatient(
            int id
        )
        {
            try
            {
                var patient =
                    await _context.Patients
                        .FirstOrDefaultAsync(
                            p => p.Id == id
                        );


                if (patient == null)
                {
                    return NotFound(
                        new
                        {
                            message =
                                "Patient not found."
                        }
                    );
                }


                // Remember image before deleting row.
                var profileImage =
                    patient.ProfileImage;


                // =============================================
                // PERMANENT DATABASE DELETE
                // =============================================

                _context.Patients.Remove(
                    patient
                );


                await _context.SaveChangesAsync();



                // =============================================
                // DELETE PROFILE IMAGE FROM SERVER TOO
                // =============================================

                if (
                    !string.IsNullOrWhiteSpace(
                        profileImage
                    )
                )
                {
                    try
                    {
                        var webRoot =
                            Path.Combine(
                                _environment.ContentRootPath,
                                "wwwroot"
                            );


                        var cleanPath =
                            profileImage
                                .Replace(
                                    '/',
                                    Path.DirectorySeparatorChar
                                )
                                .Replace(
                                    '\\',
                                    Path.DirectorySeparatorChar
                                )
                                .TrimStart(
                                    Path.DirectorySeparatorChar
                                );


                        var fullImagePath =
                            Path.Combine(
                                webRoot,
                                cleanPath
                            );


                        if (
                            System.IO.File.Exists(
                                fullImagePath
                            )
                        )
                        {
                            System.IO.File.Delete(
                                fullImagePath
                            );
                        }
                    }
                    catch
                    {
                        // Patient is already deleted from DB.
                        // Image cleanup failure should not
                        // cancel the database deletion.
                    }
                }



                return Ok(
                    new
                    {
                        message =
                            "Patient deleted successfully."
                    }
                );
            }
            catch (DbUpdateException ex)
            {
                var detail =
                    ex.InnerException?.Message
                    ?? ex.Message;


                return StatusCode(
                    StatusCodes.Status409Conflict,

                    new
                    {
                        message =
                            "This patient could not be deleted because related records exist.",

                        detail
                    }
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes
                        .Status500InternalServerError,

                    new
                    {
                        message =
                            "Could not delete patient.",

                        detail =
                            ex.Message
                    }
                );
            }
        }
    }
}