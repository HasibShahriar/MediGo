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
    public class PatientController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public PatientController(
            AppDbContext context,
            IWebHostEnvironment environment
        )
        {
            _context = context;
            _environment = environment;
        }


        // =====================================================
        // PATIENT SIGNUP
        // POST: api/Patient/signup
        // =====================================================
        [HttpPost("signup")]
        public async Task<IActionResult> SignUp(PatientSignUpDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest(new
                {
                    message = "Password is required!"
                });
            }

            var email = dto.Email.Trim().ToLower();

            var emailExists = await _context.Patients
                .AnyAsync(p => p.Email.ToLower() == email);

            if (emailExists)
            {
                return Conflict(new
                {
                    message = "Email already exists!"
                });
            }

            var patient = new Patient
            {
                FullName = dto.FullName.Trim(),
                DateOfBirth = dto.DateOfBirth,
                Gender = dto.Gender,
                Phone = dto.Phone,
                Email = email,
                Address = dto.Address,
                ProfileImage = null,
                IsVisible = true
            };

            var passwordHasher =
                new PasswordHasher<Patient>();

            patient.PasswordHash =
                passwordHasher.HashPassword(
                    patient,
                    dto.Password
                );

            _context.Patients.Add(patient);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Patient registration successful!"
            });
        }


        // =====================================================
        // PATIENT LOGIN
        // POST: api/Patient/login
        // =====================================================
        [HttpPost("login")]
        public async Task<IActionResult> Login(
            PatientLoginDto dto
        )
        {
            var email = dto.Email.Trim().ToLower();

            var patient = await _context.Patients
                .FirstOrDefaultAsync(
                    p => p.Email.ToLower() == email
                );

            if (patient == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password!"
                });
            }

            var passwordHasher =
                new PasswordHasher<Patient>();

            var result =
                passwordHasher.VerifyHashedPassword(
                    patient,
                    patient.PasswordHash,
                    dto.Password
                );

            if (result == PasswordVerificationResult.Failed)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password!"
                });
            }

            return Ok(new
            {
                message = "Login successful!",

                patient = new
                {
                    patient.Id,
                    patient.FullName,
                    patient.Email,
                    patient.Phone,
                    patient.DateOfBirth,
                    patient.Gender,
                    patient.Address,
                    patient.ProfileImage,
                    patient.IsVisible
                }
            });
        }


        // =====================================================
        // GET ONE PATIENT
        // GET: api/Patient/1
        // =====================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPatient(int id)
        {
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.Id == id);

            if (patient == null)
            {
                return NotFound(new
                {
                    message = "Patient not found!"
                });
            }

            return Ok(new
            {
                patient.Id,
                patient.FullName,
                patient.Email,
                patient.Phone,
                patient.DateOfBirth,
                patient.Gender,
                patient.Address,
                patient.ProfileImage,
                patient.IsVisible
            });
        }


        // =====================================================
        // UPDATE GENERAL INFORMATION
        // PUT: api/Patient/1/profile
        // =====================================================
        [HttpPut("{id}/profile")]
        public async Task<IActionResult> UpdateProfile(
            int id,
            PatientUpdateDto dto
        )
        {
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.Id == id);

            if (patient == null)
            {
                return NotFound(new
                {
                    message = "Patient not found!"
                });
            }

            if (string.IsNullOrWhiteSpace(dto.FullName))
            {
                return BadRequest(new
                {
                    message = "Full name is required!"
                });
            }

            if (string.IsNullOrWhiteSpace(dto.Email))
            {
                return BadRequest(new
                {
                    message = "Email is required!"
                });
            }

            var email = dto.Email.Trim().ToLower();

            var emailExists = await _context.Patients
                .AnyAsync(p =>
                    p.Email.ToLower() == email &&
                    p.Id != id
                );

            if (emailExists)
            {
                return Conflict(new
                {
                    message = "Email already exists!"
                });
            }

            patient.FullName = dto.FullName.Trim();
            patient.Email = email;
            patient.Phone = dto.Phone.Trim();
            patient.Address = dto.Address.Trim();

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Profile updated successfully!",

                patient = new
                {
                    patient.Id,
                    patient.FullName,
                    patient.Email,
                    patient.Phone,
                    patient.DateOfBirth,
                    patient.Gender,
                    patient.Address,
                    patient.ProfileImage,
                    patient.IsVisible
                }
            });
        }


        // =====================================================
        // UPLOAD PROFILE PICTURE
        // POST: api/Patient/1/profile-image
        // =====================================================
        [HttpPost("{id}/profile-image")]
        public async Task<IActionResult> UploadProfileImage(
            int id,
            IFormFile image
        )
        {
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.Id == id);

            if (patient == null)
            {
                return NotFound(new
                {
                    message = "Patient not found!"
                });
            }

            if (image == null || image.Length == 0)
            {
                return BadRequest(new
                {
                    message = "Please select an image!"
                });
            }


            // Maximum image size = 5 MB
            if (image.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new
                {
                    message = "Image must be smaller than 5 MB!"
                });
            }


            var allowedExtensions = new[]
            {
                ".jpg",
                ".jpeg",
                ".png"
            };


            var extension = Path
                .GetExtension(image.FileName)
                .ToLowerInvariant();


            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new
                {
                    message = "Only JPG, JPEG and PNG images are allowed!"
                });
            }


            // Get wwwroot location
            var webRootPath = _environment.WebRootPath;


            if (string.IsNullOrWhiteSpace(webRootPath))
            {
                webRootPath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot"
                );
            }


            // Create:
            // wwwroot/uploads/patients
            var uploadFolder = Path.Combine(
                webRootPath,
                "uploads",
                "patients"
            );


            if (!Directory.Exists(uploadFolder))
            {
                Directory.CreateDirectory(uploadFolder);
            }


            // Unique filename for each image
            var fileName =
                $"patient_{patient.Id}_{Guid.NewGuid()}{extension}";


            var fullFilePath = Path.Combine(
                uploadFolder,
                fileName
            );


            // Save image physically
            using (var stream = new FileStream(
                fullFilePath,
                FileMode.Create
            ))
            {
                await image.CopyToAsync(stream);
            }


            // Delete previous profile picture
            if (!string.IsNullOrWhiteSpace(patient.ProfileImage))
            {
                var oldPath = patient.ProfileImage
                    .Replace(
                        "/",
                        Path.DirectorySeparatorChar.ToString()
                    );


                var oldFullPath = Path.Combine(
                    webRootPath,
                    oldPath
                );


                if (System.IO.File.Exists(oldFullPath))
                {
                    System.IO.File.Delete(oldFullPath);
                }
            }


            // Store only image LOCATION in SQL Server
            patient.ProfileImage =
                $"uploads/patients/{fileName}";


            await _context.SaveChangesAsync();


            return Ok(new
            {
                message = "Profile picture updated successfully!",

                profileImage = patient.ProfileImage
            });
        }


        // =====================================================
        // CHANGE PASSWORD
        // PUT: api/Patient/1/password
        // =====================================================
        [HttpPut("{id}/password")]
        public async Task<IActionResult> UpdatePassword(
            int id,
            PatientPasswordUpdateDto dto
        )
        {
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.Id == id);

            if (patient == null)
            {
                return NotFound(new
                {
                    message = "Patient not found!"
                });
            }


            if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
            {
                return BadRequest(new
                {
                    message = "Current password is required!"
                });
            }


            if (
                string.IsNullOrWhiteSpace(dto.NewPassword) ||
                dto.NewPassword.Length < 6
            )
            {
                return BadRequest(new
                {
                    message =
                        "New password must be at least 6 characters!"
                });
            }


            var passwordHasher =
                new PasswordHasher<Patient>();


            var result =
                passwordHasher.VerifyHashedPassword(
                    patient,
                    patient.PasswordHash,
                    dto.CurrentPassword
                );


            if (result == PasswordVerificationResult.Failed)
            {
                return Unauthorized(new
                {
                    message = "Current password is incorrect!"
                });
            }


            patient.PasswordHash =
                passwordHasher.HashPassword(
                    patient,
                    dto.NewPassword
                );


            await _context.SaveChangesAsync();


            return Ok(new
            {
                message = "Password changed successfully!"
            });
        }
    }
}