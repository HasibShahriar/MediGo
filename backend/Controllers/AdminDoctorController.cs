using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Controllers
{
    [Route("api/admin/doctors")]
    [ApiController]
    public class AdminDoctorController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminDoctorController(
            AppDbContext context
        )
        {
            _context = context;
        }


        // ==================================================
        // GET ALL PENDING REQUESTS
        // GET: api/admin/doctors/requests
        // ==================================================

        [HttpGet("requests")]
        public async Task<IActionResult> GetRequests()
        {
            var requests =
                await _context.DoctorRequests

                .OrderByDescending(
                    d => d.CreatedAt
                )

                .Select(d => new
                {
                    d.Id,

                    fullName =
                        d.Title + " " +
                        d.FirstName + " " +
                        d.LastName,

                    d.Phone,

                    d.Email,

                    d.BmdcNumber,

                    requestStatus = "pending",

                    d.CreatedAt
                })

                .ToListAsync();


            return Ok(requests);
        }


        // ==================================================
        // GET ONE REQUEST
        // USED BY EYE POPUP
        // GET: api/admin/doctors/requests/5
        // ==================================================

        [HttpGet("requests/{id}")]
        public async Task<IActionResult> GetRequest(
            int id
        )
        {
            var request =
                await _context.DoctorRequests
                    .FirstOrDefaultAsync(
                        d => d.Id == id
                    );


            if (request == null)
            {
                return NotFound(new
                {
                    message =
                        "Doctor request not found!"
                });
            }


            return Ok(new
            {
                request.Id,

                fullName =
                    request.Title + " " +
                    request.FirstName + " " +
                    request.LastName,

                request.BmdcNumber,

                request.NationalId
            });
        }


        // ==================================================
        // APPROVE DOCTOR
        // POST: api/admin/doctors/requests/5/approve
        // ==================================================

        [HttpPost("requests/{id}/approve")]
        public async Task<IActionResult> ApproveDoctor(
            int id
        )
        {
            var request =
                await _context.DoctorRequests
                    .FirstOrDefaultAsync(
                        d => d.Id == id
                    );


            if (request == null)
            {
                return NotFound(new
                {
                    message =
                        "Doctor request not found!"
                });
            }


            // =========================================
            // MAKE SURE IT IS NOT ALREADY APPROVED
            // =========================================

            var alreadyExists =
                await _context.Doctors.AnyAsync(
                    d =>
                        d.Email == request.Email ||
                        d.BmdcNumber == request.BmdcNumber ||
                        d.NationalId == request.NationalId
                );


            if (alreadyExists)
            {
                return Conflict(new
                {
                    message =
                        "Doctor already exists!"
                });
            }


            // =========================================
            // TRANSACTION
            // =========================================

            await using var transaction =
                await _context.Database
                    .BeginTransactionAsync();


            try
            {
                // =====================================
                // COPY REQUEST → DOCTORS
                // =====================================

                var doctor = new Doctor
                {
                    Title =
                        request.Title,

                    FirstName =
                        request.FirstName,

                    LastName =
                        request.LastName,

                    DateOfBirth =
                        request.DateOfBirth,

                    Gender =
                        request.Gender,

                    NationalId =
                        request.NationalId,

                    BmdcNumber =
                        request.BmdcNumber,

                    Phone =
                        request.Phone,

                    Email =
                        request.Email,


                    // IMPORTANT:
                    // Already hashed during registration.
                    PasswordHash =
                        request.PasswordHash,


                    AcceptedTerms =
                        request.AcceptedTerms,

                    TermsAcceptedAt =
                        request.TermsAcceptedAt,


                    RequestStatus =
                        "approved",

                    IsVisible =
                        true,

                    CreatedAt =
                        DateTime.Now
                };


                // Add approved doctor
                _context.Doctors.Add(
                    doctor
                );


                // Remove pending request
                _context.DoctorRequests.Remove(
                    request
                );


                await _context.SaveChangesAsync();


                await transaction.CommitAsync();


                return Ok(new
                {
                    message =
                        "Doctor approved successfully!"
                });
            }

            catch
            {
                await transaction.RollbackAsync();


                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "Could not approve doctor!"
                    }
                );
            }
        }


        // ==================================================
        // REJECT DOCTOR REQUEST
        // DELETE: api/admin/doctors/requests/5/reject
        // ==================================================

        [HttpDelete("requests/{id}/reject")]
        public async Task<IActionResult> RejectDoctor(
            int id
        )
        {
            var request =
                await _context.DoctorRequests
                    .FirstOrDefaultAsync(
                        d => d.Id == id
                    );


            if (request == null)
            {
                return NotFound(new
                {
                    message =
                        "Doctor request not found!"
                });
            }


            _context.DoctorRequests.Remove(
                request
            );


            await _context.SaveChangesAsync();


            return Ok(new
            {
                message =
                    "Doctor request rejected!"
            });
        }
    }
}