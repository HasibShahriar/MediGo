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
    public class DoctorSettingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;


        // =====================================================
        // ALLOWED MEDIGO SPECIALTIES
        // =====================================================

        private static readonly HashSet<string> AllowedSpecialties =
            new HashSet<string>(
                StringComparer.OrdinalIgnoreCase
            )
            {
                "general-physician",
                "pediatrics",
                "gyne-obs",
                "dermatology",
                "internal-medicine",
                "cardiology",
                "neurology",
                "dentistry",
                "ophthalmology",
                "oncology",
                "family-medicine",
                "physical-medicine"
            };


        // =====================================================
        // CONSTRUCTOR
        // =====================================================

        public DoctorSettingsController(
            AppDbContext context,
            IWebHostEnvironment environment
        )
        {
            _context = context;
            _environment = environment;
        }



        // =====================================================
        // GET DOCTOR SETTINGS
        //
        // GET:
        // api/DoctorSettings/2
        // =====================================================

        [HttpGet("{doctorId}")]
        public async Task<IActionResult> GetSettings(
            int doctorId
        )
        {
            try
            {
                // =============================================
                // GET DOCTOR FROM EXISTING Doctors TABLE
                // =============================================

                var doctor =
                    await _context.Doctors
                        .FirstOrDefaultAsync(
                            d => d.Id == doctorId
                        );


                if (doctor == null)
                {
                    return NotFound(new
                    {
                        message = "Doctor not found!"
                    });
                }


                // =============================================
                // GET DoctorSettings ROW
                // =============================================

                var settings =
                    await _context.DoctorSettings
                        .FirstOrDefaultAsync(
                            s => s.DoctorId == doctorId
                        );


                // =============================================
                // FIRST TIME SETTINGS
                // CREATE ROW AUTOMATICALLY
                // =============================================

                if (settings == null)
                {
                    settings = new DoctorSetting
                    {
                        DoctorId = doctor.Id,

                        DoctorCode =
                            $"MED-DOC-{doctor.Id:D5}",

                        PatientsAttended = 0,

                        UpdatedAt = DateTime.Now
                    };


                    _context.DoctorSettings.Add(
                        settings
                    );


                    await _context.SaveChangesAsync();
                }


                // =============================================
                // RETURN Doctors + DoctorSettings
                // =============================================

                return Ok(new
                {
                    // =========================================
                    // Doctors TABLE
                    // =========================================

                    doctor.Id,

                    doctor.Title,

                    doctor.FirstName,

                    doctor.LastName,

                    fullName =
                        doctor.Title + " " +
                        doctor.FirstName + " " +
                        doctor.LastName,

                    doctor.DateOfBirth,

                    doctor.Gender,

                    doctor.NationalId,

                    doctor.BmdcNumber,

                    doctor.Phone,

                    doctor.Email,

                    joinedAt =
                        doctor.CreatedAt,


                    // =========================================
                    // DoctorSettings TABLE
                    // =========================================

                    settings.Qualifications,

                    settings.Specialty,

                    settings.WorkingPlace,

                    settings.WorkingDescription,

                    settings.ExperienceYears,

                    settings.Bio,

                    settings.InstantConsultationMinutes,

                    settings.AppointmentConsultationMinutes,

                    settings.ConsultationFee,

                    settings.FollowUpFee,

                    settings.PatientsAttended,

                    settings.DoctorCode,

                    settings.ProfileImage,

                    settings.UpdatedAt
                });
            }
            catch (DbUpdateException ex)
            {
                var realError =
                    ex.InnerException?.Message
                    ?? ex.Message;


                Console.WriteLine(
                    "GET DOCTOR SETTINGS DATABASE ERROR:"
                );

                Console.WriteLine(
                    realError
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Database error while loading doctor settings!",

                        detail =
                            realError
                    }
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    "GET DOCTOR SETTINGS ERROR:"
                );

                Console.WriteLine(
                    ex.Message
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Could not load doctor settings!",

                        detail =
                            ex.Message
                    }
                );
            }
        }



        // =====================================================
        // UPDATE GENERAL INFORMATION
        //
        // PUT:
        // api/DoctorSettings/2/general
        //
        // Existing information:
        // → Doctors table
        //
        // New professional information:
        // → DoctorSettings table
        // =====================================================

        [HttpPut("{doctorId}/general")]
        public async Task<IActionResult> UpdateGeneral(
            int doctorId,
            DoctorSettingsUpdateDto dto
        )
        {
            try
            {
                // =============================================
                // FIND DOCTOR
                // =============================================

                var doctor =
                    await _context.Doctors
                        .FirstOrDefaultAsync(
                            d => d.Id == doctorId
                        );


                if (doctor == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Doctor not found!"
                    });
                }


                // =============================================
                // TITLE
                // =============================================

                if (
                    string.IsNullOrWhiteSpace(
                        dto.Title
                    )
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Title is required!"
                    });
                }


                // =============================================
                // FIRST NAME
                // =============================================

                if (
                    string.IsNullOrWhiteSpace(
                        dto.FirstName
                    )
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "First name is required!"
                    });
                }


                // =============================================
                // LAST NAME
                // =============================================

                if (
                    string.IsNullOrWhiteSpace(
                        dto.LastName
                    )
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Last name is required!"
                    });
                }


                // =============================================
                // EMAIL
                // =============================================

                if (
                    string.IsNullOrWhiteSpace(
                        dto.Email
                    )
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Email is required!"
                    });
                }


                // =============================================
                // PHONE
                // =============================================

                if (
                    string.IsNullOrWhiteSpace(
                        dto.Phone
                    )
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Phone number is required!"
                    });
                }


                // =============================================
                // NORMALIZE EMAIL
                // =============================================

                var email =
                    dto.Email
                        .Trim()
                        .ToLower();


                // =============================================
                // NORMALIZE SPECIALTY
                // =============================================

                var specialtyValue =
                    dto.Specialty?
                        .Trim()
                        .ToLower();


                // =============================================
                // SPECIALTY REQUIRED
                // =============================================

                if (
                    string.IsNullOrWhiteSpace(
                        specialtyValue
                    )
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Please select a specialty!"
                    });
                }


                // =============================================
                // VALID SPECIALTY
                // =============================================

                if (
                    !AllowedSpecialties.Contains(
                        specialtyValue
                    )
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Invalid specialty selected!"
                    });
                }


                // =============================================
                // EXPERIENCE VALIDATION
                // =============================================

                if (
                    dto.ExperienceYears.HasValue
                    &&
                    dto.ExperienceYears.Value < 0
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Experience cannot be negative!"
                    });
                }


                // =============================================
                // CONSULTATION TIME VALIDATION
                // =============================================

                if (
                    dto.InstantConsultationMinutes.HasValue
                    &&
                    dto.InstantConsultationMinutes.Value <= 0
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Instant consultation time must be greater than 0!"
                    });
                }


                if (
                    dto.AppointmentConsultationMinutes.HasValue
                    &&
                    dto.AppointmentConsultationMinutes.Value <= 0
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Appointment consultation time must be greater than 0!"
                    });
                }


                // =============================================
                // FEE VALIDATION
                // =============================================

                if (
                    dto.ConsultationFee.HasValue
                    &&
                    dto.ConsultationFee.Value < 0
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Consultation fee cannot be negative!"
                    });
                }


                if (
                    dto.FollowUpFee.HasValue
                    &&
                    dto.FollowUpFee.Value < 0
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Follow-up fee cannot be negative!"
                    });
                }


                // =============================================
                // DUPLICATE EMAIL IN Doctors
                // =============================================

                var emailExists =
                    await _context.Doctors
                        .AnyAsync(
                            d =>
                                d.Id != doctorId
                                &&
                                d.Email.ToLower()
                                == email
                        );


                if (emailExists)
                {
                    return Conflict(new
                    {
                        message =
                            "Another doctor already uses this email!"
                    });
                }


                // =============================================
                // CHECK PENDING DoctorRequests
                // =============================================

                var pendingEmailExists =
                    await _context.DoctorRequests
                        .AnyAsync(
                            d =>
                                d.Email.ToLower()
                                == email
                        );


                if (
                    pendingEmailExists
                    &&
                    doctor.Email.ToLower() != email
                )
                {
                    return Conflict(new
                    {
                        message =
                            "This email is already used by a pending doctor registration!"
                    });
                }


                // =================================================
                // UPDATE EXISTING Doctors TABLE
                // =================================================

                doctor.Title =
                    dto.Title.Trim();


                doctor.FirstName =
                    dto.FirstName.Trim();


                doctor.LastName =
                    dto.LastName.Trim();


                doctor.Email =
                    email;


                doctor.Phone =
                    dto.Phone.Trim();


                // =============================================
                // FIND DoctorSettings
                // =============================================

                var settings =
                    await _context.DoctorSettings
                        .FirstOrDefaultAsync(
                            s =>
                                s.DoctorId ==
                                doctorId
                        );


                // =============================================
                // CREATE IF DOES NOT EXIST
                // =============================================

                if (settings == null)
                {
                    settings =
                        new DoctorSetting
                        {
                            DoctorId =
                                doctorId,

                            DoctorCode =
                                $"MED-DOC-{doctorId:D5}",

                            PatientsAttended =
                                0,

                            UpdatedAt =
                                DateTime.Now
                        };


                    _context.DoctorSettings.Add(
                        settings
                    );
                }


                // =================================================
                // UPDATE DoctorSettings TABLE
                // =================================================

                settings.Qualifications =
                    string.IsNullOrWhiteSpace(
                        dto.Qualifications
                    )
                        ? null
                        : dto.Qualifications.Trim();


                settings.Specialty =
                    specialtyValue;


                settings.WorkingPlace =
                    string.IsNullOrWhiteSpace(
                        dto.WorkingPlace
                    )
                        ? null
                        : dto.WorkingPlace.Trim();


                settings.WorkingDescription =
                    string.IsNullOrWhiteSpace(
                        dto.WorkingDescription
                    )
                        ? null
                        : dto.WorkingDescription.Trim();


                settings.ExperienceYears =
                    dto.ExperienceYears;


                settings.Bio =
                    string.IsNullOrWhiteSpace(
                        dto.Bio
                    )
                        ? null
                        : dto.Bio.Trim();


                settings.InstantConsultationMinutes =
                    dto.InstantConsultationMinutes;


                settings.AppointmentConsultationMinutes =
                    dto.AppointmentConsultationMinutes;


                settings.ConsultationFee =
                    dto.ConsultationFee;


                settings.FollowUpFee =
                    dto.FollowUpFee;


                settings.UpdatedAt =
                    DateTime.Now;


                // =================================================
                // SAVE BOTH TABLES
                // =================================================

                await _context.SaveChangesAsync();


                // =============================================
                // SUCCESS
                // =============================================

                return Ok(new
                {
                    message =
                        "Doctor settings updated successfully!",


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

                        specialty =
                            settings.Specialty,

                        settings.ProfileImage
                    }
                });
            }


            // =================================================
            // DATABASE ERROR
            // =================================================

            catch (DbUpdateException ex)
            {
                var realError =
                    ex.InnerException?.Message
                    ?? ex.Message;


                Console.WriteLine(
                    "===================================="
                );

                Console.WriteLine(
                    "DOCTOR SETTINGS DATABASE ERROR"
                );

                Console.WriteLine(
                    realError
                );

                Console.WriteLine(
                    "===================================="
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Database update failed!",

                        detail =
                            realError
                    }
                );
            }


            // =================================================
            // OTHER ERROR
            // =================================================

            catch (Exception ex)
            {
                Console.WriteLine(
                    "===================================="
                );

                Console.WriteLine(
                    "DOCTOR SETTINGS ERROR"
                );

                Console.WriteLine(
                    ex.Message
                );

                Console.WriteLine(
                    "===================================="
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Could not update doctor settings!",

                        detail =
                            ex.Message
                    }
                );
            }
        }



        // =====================================================
        // UPLOAD PROFILE IMAGE
        //
        // POST:
        // api/DoctorSettings/2/profile-image
        // =====================================================

        [HttpPost("{doctorId}/profile-image")]
        public async Task<IActionResult> UploadProfileImage(
            int doctorId,
            [FromForm] IFormFile image
        )
        {
            try
            {
                // =============================================
                // FIND DOCTOR
                // =============================================

                var doctor =
                    await _context.Doctors
                        .FirstOrDefaultAsync(
                            d => d.Id == doctorId
                        );


                if (doctor == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Doctor not found!"
                    });
                }


                // =============================================
                // IMAGE REQUIRED
                // =============================================

                if (
                    image == null
                    ||
                    image.Length == 0
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Please select an image!"
                    });
                }


                // =============================================
                // MAXIMUM 5MB
                // =============================================

                const long maxSize =
                    5 * 1024 * 1024;


                if (
                    image.Length >
                    maxSize
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Image must be less than 5MB!"
                    });
                }


                // =============================================
                // EXTENSION
                // =============================================

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
                        ".png",
                        ".webp"
                    };


                if (
                    !allowedExtensions.Contains(
                        extension
                    )
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Only JPG, JPEG, PNG and WEBP images are allowed!"
                    });
                }


                // =============================================
                // CONTENT TYPE
                // =============================================

                var allowedContentTypes =
                    new[]
                    {
                        "image/jpeg",
                        "image/png",
                        "image/webp"
                    };


                if (
                    string.IsNullOrWhiteSpace(
                        image.ContentType
                    )
                    ||
                    !allowedContentTypes.Contains(
                        image.ContentType
                            .ToLowerInvariant()
                    )
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Invalid image format!"
                    });
                }


                // =============================================
                // FIND SETTINGS
                // =============================================

                var settings =
                    await _context.DoctorSettings
                        .FirstOrDefaultAsync(
                            s =>
                                s.DoctorId ==
                                doctorId
                        );


                if (settings == null)
                {
                    settings =
                        new DoctorSetting
                        {
                            DoctorId =
                                doctorId,

                            DoctorCode =
                                $"MED-DOC-{doctorId:D5}",

                            PatientsAttended =
                                0,

                            UpdatedAt =
                                DateTime.Now
                        };


                    _context.DoctorSettings.Add(
                        settings
                    );
                }


                // =============================================
                // WWWROOT
                // =============================================

                var webRootPath =
                    Path.Combine(
                        _environment.ContentRootPath,
                        "wwwroot"
                    );


                // =============================================
                // UPLOAD FOLDER
                // =============================================

                var uploadFolder =
                    Path.Combine(
                        webRootPath,
                        "uploads",
                        "doctors"
                    );


                Directory.CreateDirectory(
                    uploadFolder
                );


                // =============================================
                // FILE NAME
                // =============================================

                var fileName =
                    $"doctor_{doctorId}_{Guid.NewGuid()}{extension}";


                var fullFilePath =
                    Path.Combine(
                        uploadFolder,
                        fileName
                    );


                // =============================================
                // SAVE FILE
                // =============================================

                await using (
                    var stream =
                        new FileStream(
                            fullFilePath,
                            FileMode.Create
                        )
                )
                {
                    await image.CopyToAsync(
                        stream
                    );
                }


                // =============================================
                // OLD IMAGE
                // =============================================

                var oldProfileImage =
                    settings.ProfileImage;


                // =============================================
                // SAVE NEW PATH
                // =============================================

                settings.ProfileImage =
                    $"uploads/doctors/{fileName}";


                settings.UpdatedAt =
                    DateTime.Now;


                // =============================================
                // SAVE DATABASE
                // =============================================

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateException ex)
                {
                    // Remove uploaded file
                    // if database save failed

                    if (
                        System.IO.File.Exists(
                            fullFilePath
                        )
                    )
                    {
                        System.IO.File.Delete(
                            fullFilePath
                        );
                    }


                    var realError =
                        ex.InnerException?.Message
                        ?? ex.Message;


                    return StatusCode(
                        StatusCodes.Status500InternalServerError,
                        new
                        {
                            message =
                                "Could not save profile picture to database!",

                            detail =
                                realError
                        }
                    );
                }


                // =============================================
                // DELETE OLD PROFILE IMAGE
                // =============================================

                if (
                    !string.IsNullOrWhiteSpace(
                        oldProfileImage
                    )
                )
                {
                    var oldRelativePath =
                        oldProfileImage
                            .Replace(
                                '/',
                                Path.DirectorySeparatorChar
                            )
                            .TrimStart(
                                Path.DirectorySeparatorChar
                            );


                    var oldFullPath =
                        Path.Combine(
                            webRootPath,
                            oldRelativePath
                        );


                    if (
                        System.IO.File.Exists(
                            oldFullPath
                        )
                    )
                    {
                        try
                        {
                            System.IO.File.Delete(
                                oldFullPath
                            );
                        }
                        catch
                        {
                            // Ignore old image
                            // deletion error
                        }
                    }
                }


                // =============================================
                // SUCCESS
                // =============================================

                return Ok(new
                {
                    message =
                        "Profile picture updated successfully!",

                    profileImage =
                        settings.ProfileImage
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    "PROFILE IMAGE ERROR:"
                );


                Console.WriteLine(
                    ex.Message
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Could not upload profile picture!",

                        detail =
                            ex.Message
                    }
                );
            }
        }



        // =====================================================
        // CHANGE PASSWORD
        //
        // PUT:
        // api/DoctorSettings/2/password
        // =====================================================

        [HttpPut("{doctorId}/password")]
        public async Task<IActionResult> UpdatePassword(
            int doctorId,
            DoctorPasswordUpdateDto dto
        )
        {
            try
            {
                // =============================================
                // FIND DOCTOR
                // =============================================

                var doctor =
                    await _context.Doctors
                        .FirstOrDefaultAsync(
                            d =>
                                d.Id ==
                                doctorId
                        );


                if (doctor == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Doctor not found!"
                    });
                }


                // =============================================
                // CURRENT PASSWORD
                // =============================================

                if (
                    string.IsNullOrWhiteSpace(
                        dto.CurrentPassword
                    )
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Current password is required!"
                    });
                }


                // =============================================
                // NEW PASSWORD
                // =============================================

                if (
                    string.IsNullOrWhiteSpace(
                        dto.NewPassword
                    )
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "New password is required!"
                    });
                }


                if (
                    dto.NewPassword.Length <
                    6
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "New password must be at least 6 characters!"
                    });
                }


                // =============================================
                // PASSWORD HASHER
                // =============================================

                var passwordHasher =
                    new PasswordHasher<Doctor>();


                // =============================================
                // CHECK CURRENT PASSWORD
                // =============================================

                var passwordResult =
                    passwordHasher
                        .VerifyHashedPassword(
                            doctor,
                            doctor.PasswordHash,
                            dto.CurrentPassword
                        );


                if (
                    passwordResult ==
                    PasswordVerificationResult.Failed
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Current password is incorrect!"
                    });
                }


                // =============================================
                // CHECK SAME PASSWORD
                // =============================================

                var samePassword =
                    passwordHasher
                        .VerifyHashedPassword(
                            doctor,
                            doctor.PasswordHash,
                            dto.NewPassword
                        );


                if (
                    samePassword !=
                    PasswordVerificationResult.Failed
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "New password must be different from the current password!"
                    });
                }


                // =============================================
                // CREATE NEW HASH
                // =============================================

                doctor.PasswordHash =
                    passwordHasher.HashPassword(
                        doctor,
                        dto.NewPassword
                    );


                // =============================================
                // SAVE
                // =============================================

                await _context.SaveChangesAsync();


                return Ok(new
                {
                    message =
                        "Password changed successfully!"
                });
            }
            catch (DbUpdateException ex)
            {
                var realError =
                    ex.InnerException?.Message
                    ?? ex.Message;


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Database error while changing password!",

                        detail =
                            realError
                    }
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Could not change password!",

                        detail =
                            ex.Message
                    }
                );
            }
        }
    }
}