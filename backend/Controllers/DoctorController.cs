using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Server.Data;
using Server.DTOs;
using Server.Models;


namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DoctorController : ControllerBase
    {
        private readonly AppDbContext _context;


        // =====================================================
        // CONSTRUCTOR
        // =====================================================

        public DoctorController(AppDbContext context)
        {
            _context = context;
        }



        // =====================================================
        // DOCTOR SIGNUP
        // POST: api/Doctor/signup
        // =====================================================

        [HttpPost("signup")]
        public async Task<IActionResult> SignUp(
            DoctorSignUpDto dto
        )
        {
            // =========================================
            // TITLE VALIDATION
            // =========================================

            if (string.IsNullOrWhiteSpace(dto.Title))
            {
                return BadRequest(new
                {
                    message = "Please select title!"
                });
            }


            // =========================================
            // FIRST NAME VALIDATION
            // =========================================

            if (string.IsNullOrWhiteSpace(dto.FirstName))
            {
                return BadRequest(new
                {
                    message = "First name is required!"
                });
            }


            // =========================================
            // LAST NAME VALIDATION
            // =========================================

            if (string.IsNullOrWhiteSpace(dto.LastName))
            {
                return BadRequest(new
                {
                    message = "Last name is required!"
                });
            }


            // =========================================
            // DATE OF BIRTH VALIDATION
            // =========================================

            if (dto.DateOfBirth == default)
            {
                return BadRequest(new
                {
                    message = "Date of birth is required!"
                });
            }


            // =========================================
            // GENDER VALIDATION
            // =========================================

            if (string.IsNullOrWhiteSpace(dto.Gender))
            {
                return BadRequest(new
                {
                    message = "Please select gender!"
                });
            }


            // =========================================
            // NATIONAL ID VALIDATION
            // =========================================

            if (string.IsNullOrWhiteSpace(dto.NationalId))
            {
                return BadRequest(new
                {
                    message =
                        "National ID / Passport number is required!"
                });
            }


            // =========================================
            // BMDC VALIDATION
            // =========================================

            if (string.IsNullOrWhiteSpace(dto.BmdcNumber))
            {
                return BadRequest(new
                {
                    message =
                        "BMDC registration number is required!"
                });
            }


            // =========================================
            // PHONE VALIDATION
            // =========================================

            if (string.IsNullOrWhiteSpace(dto.Phone))
            {
                return BadRequest(new
                {
                    message =
                        "Mobile number is required!"
                });
            }


            // =========================================
            // EMAIL VALIDATION
            // =========================================

            if (string.IsNullOrWhiteSpace(dto.Email))
            {
                return BadRequest(new
                {
                    message =
                        "Email is required!"
                });
            }


            // =========================================
            // PASSWORD VALIDATION
            // =========================================

            if (string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest(new
                {
                    message =
                        "Password is required!"
                });
            }


            if (dto.Password.Length < 6)
            {
                return BadRequest(new
                {
                    message =
                        "Password must be at least 6 characters!"
                });
            }


            // =========================================
            // TERMS VALIDATION
            // =========================================

            if (!dto.AcceptedTerms)
            {
                return BadRequest(new
                {
                    message =
                        "Please accept terms and conditions!"
                });
            }



            // =================================================
            // CLEAN / NORMALIZE VALUES
            // =================================================

            var email =
                dto.Email
                    .Trim()
                    .ToLower();


            var nationalId =
                dto.NationalId
                    .Trim();


            var bmdcNumber =
                dto.BmdcNumber
                    .Trim();



            // =================================================
            // CHECK EMAIL IN APPROVED DOCTORS
            // =================================================

            var emailApproved =
                await _context.Doctors
                    .AnyAsync(
                        d => d.Email == email
                    );


            if (emailApproved)
            {
                return Conflict(new
                {
                    message =
                        "This email is already registered!"
                });
            }



            // =================================================
            // CHECK BMDC IN APPROVED DOCTORS
            // =================================================

            var bmdcApproved =
                await _context.Doctors
                    .AnyAsync(
                        d =>
                            d.BmdcNumber ==
                            bmdcNumber
                    );


            if (bmdcApproved)
            {
                return Conflict(new
                {
                    message =
                        "This BMDC number is already registered!"
                });
            }



            // =================================================
            // CHECK NATIONAL ID IN APPROVED DOCTORS
            // =================================================

            var nationalIdApproved =
                await _context.Doctors
                    .AnyAsync(
                        d =>
                            d.NationalId ==
                            nationalId
                    );


            if (nationalIdApproved)
            {
                return Conflict(new
                {
                    message =
                        "This National ID / Passport is already registered!"
                });
            }



            // =================================================
            // CHECK EMAIL IN PENDING REQUESTS
            // =================================================

            var emailPending =
                await _context.DoctorRequests
                    .AnyAsync(
                        d => d.Email == email
                    );


            if (emailPending)
            {
                return Conflict(new
                {
                    message =
                        "A registration request with this email is already pending!"
                });
            }



            // =================================================
            // CHECK BMDC IN PENDING REQUESTS
            // =================================================

            var bmdcPending =
                await _context.DoctorRequests
                    .AnyAsync(
                        d =>
                            d.BmdcNumber ==
                            bmdcNumber
                    );


            if (bmdcPending)
            {
                return Conflict(new
                {
                    message =
                        "A registration request with this BMDC number is already pending!"
                });
            }



            // =================================================
            // CHECK NATIONAL ID IN PENDING REQUESTS
            // =================================================

            var nationalIdPending =
                await _context.DoctorRequests
                    .AnyAsync(
                        d =>
                            d.NationalId ==
                            nationalId
                    );


            if (nationalIdPending)
            {
                return Conflict(new
                {
                    message =
                        "A registration request with this National ID is already pending!"
                });
            }



            // =================================================
            // CREATE DOCTOR REQUEST
            // =================================================

            var request = new DoctorRequest
            {
                Title =
                    dto.Title.Trim(),

                FirstName =
                    dto.FirstName.Trim(),

                LastName =
                    dto.LastName.Trim(),

                DateOfBirth =
                    dto.DateOfBirth,

                Gender =
                    dto.Gender.Trim(),

                NationalId =
                    nationalId,

                BmdcNumber =
                    bmdcNumber,

                Phone =
                    dto.Phone.Trim(),

                Email =
                    email,

                AcceptedTerms =
                    true,

                TermsAcceptedAt =
                    DateTime.Now,

                CreatedAt =
                    DateTime.Now
            };



            // =================================================
            // HASH PASSWORD
            // =================================================

            var passwordHasher =
                new PasswordHasher<DoctorRequest>();


            request.PasswordHash =
                passwordHasher.HashPassword(
                    request,
                    dto.Password
                );



            // =================================================
            // SAVE INTO DoctorRequests TABLE
            // =================================================

            _context.DoctorRequests.Add(
                request
            );


            await _context.SaveChangesAsync();



            // =================================================
            // SIGNUP SUCCESS
            // =================================================

            return Ok(new
            {
                message =
                    "Doctor registration submitted for admin approval!"
            });
        }




        // =====================================================
        // DOCTOR LOGIN
        // POST: api/Doctor/login
        // =====================================================

        [HttpPost("login")]
        public async Task<IActionResult> Login(
            DoctorLoginDto dto
        )
        {
            // =========================================
            // EMAIL VALIDATION
            // =========================================

            if (string.IsNullOrWhiteSpace(dto.Email))
            {
                return BadRequest(new
                {
                    message =
                        "Email is required!"
                });
            }


            // =========================================
            // PASSWORD VALIDATION
            // =========================================

            if (string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest(new
                {
                    message =
                        "Password is required!"
                });
            }



            // =========================================
            // NORMALIZE EMAIL
            // =========================================

            var email =
                dto.Email
                    .Trim()
                    .ToLower();



            // =================================================
            // SEARCH APPROVED DOCTOR
            // =================================================

            var doctor =
                await _context.Doctors
                    .FirstOrDefaultAsync(
                        d =>
                            d.Email == email
                    );



            // =================================================
            // DOCTOR NOT IN APPROVED TABLE
            // =================================================

            if (doctor == null)
            {
                // -----------------------------------------
                // CHECK IF STILL WAITING FOR ADMIN
                // -----------------------------------------

                var pendingDoctor =
                    await _context.DoctorRequests
                        .AnyAsync(
                            d =>
                                d.Email == email
                        );


                if (pendingDoctor)
                {
                    return StatusCode(
                        StatusCodes.Status403Forbidden,

                        new
                        {
                            message =
                                "Your registration is waiting for admin approval."
                        }
                    );
                }


                // Not approved and not pending
                return Unauthorized(new
                {
                    message =
                        "Invalid email or password!"
                });
            }



            // =================================================
            // VERIFY PASSWORD
            // =================================================

            var passwordHasher =
                new PasswordHasher<Doctor>();


            var passwordResult =
                passwordHasher.VerifyHashedPassword(
                    doctor,
                    doctor.PasswordHash,
                    dto.Password
                );



            if (
                passwordResult ==
                PasswordVerificationResult.Failed
            )
            {
                return Unauthorized(new
                {
                    message =
                        "Invalid email or password!"
                });
            }



            // =================================================
            // CHECK ACCOUNT VISIBILITY
            // =================================================

            if (!doctor.IsVisible)
            {
                return StatusCode(
                    StatusCodes.Status403Forbidden,

                    new
                    {
                        message =
                            "Your doctor account is currently unavailable."
                    }
                );
            }



            // =================================================
            // LOGIN SUCCESS
            // =================================================

            return Ok(new
            {
                message =
                    "Login successful!",


                doctor = new
                {
                    doctor.Id,

                    doctor.Title,

                    doctor.FirstName,

                    doctor.LastName,


                    fullName =
                        doctor.Title + " " +
                        doctor.FirstName + " " +
                        doctor.LastName,


                    doctor.Email,

                    doctor.Phone,

                    doctor.BmdcNumber,

                    doctor.RequestStatus,

                    doctor.IsVisible
                }
            });
        }
    }
}