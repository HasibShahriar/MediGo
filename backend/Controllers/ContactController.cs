using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Server.Data;
using Server.Models;


namespace Server.Controllers
{
    [Route("api/contact")]
    [ApiController]
    public class ContactController : ControllerBase
    {
        private readonly AppDbContext _context;


        // =====================================================
        // CONSTRUCTOR
        // =====================================================

        public ContactController(
            AppDbContext context
        )
        {
            _context = context;
        }



        // =====================================================
        // SEND CONTACT MESSAGE
        //
        // POST:
        // /api/contact
        //
        // LOGGED-IN PATIENT EXAMPLE:
        //
        // {
        //     "patientId": 5,
        //     "concern": "Appointment Booking",
        //     "message": "I have a problem."
        // }
        //
        // NON-LOGGED-IN USER EXAMPLE:
        //
        // {
        //     "name": "Someone",
        //     "email": "someone@gmail.com",
        //     "concern": "Other",
        //     "message": "My message."
        // }
        // =====================================================

        [HttpPost]
        public async Task<IActionResult> SendMessage(
            ContactMessageRequestDto dto
        )
        {
            try
            {
                // =============================================
                // CONCERN VALIDATION
                // =============================================

                if (
                    string.IsNullOrWhiteSpace(
                        dto.Concern
                    )
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Concern is required."
                    });
                }



                // =============================================
                // MESSAGE VALIDATION
                // =============================================

                if (
                    string.IsNullOrWhiteSpace(
                        dto.Message
                    )
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Message is required."
                    });
                }



                string finalName;

                string finalEmail;



                // =============================================
                // IF LOGGED-IN PATIENT
                // =============================================

                if (
                    dto.PatientId.HasValue
                )
                {
                    var patient =
                        await _context.Patients
                            .FirstOrDefaultAsync(
                                patient =>
                                    patient.Id ==
                                    dto.PatientId.Value
                            );



                    if (patient == null)
                    {
                        return NotFound(new
                        {
                            message =
                                "Patient not found."
                        });
                    }



                    if (!patient.IsVisible)
                    {
                        return BadRequest(new
                        {
                            message =
                                "Patient account is unavailable."
                        });
                    }



                    // Use information from database.
                    // Do not trust browser name/email.

                    finalName =
                        patient.FullName;


                    finalEmail =
                        patient.Email;
                }

                else
                {
                    // =========================================
                    // NON-LOGGED-IN CONTACT USER
                    // =========================================

                    if (
                        string.IsNullOrWhiteSpace(
                            dto.Name
                        )
                    )
                    {
                        return BadRequest(new
                        {
                            message =
                                "Name is required."
                        });
                    }



                    if (
                        string.IsNullOrWhiteSpace(
                            dto.Email
                        )
                    )
                    {
                        return BadRequest(new
                        {
                            message =
                                "Email is required."
                        });
                    }



                    finalName =
                        dto.Name.Trim();


                    finalEmail =
                        dto.Email
                            .Trim()
                            .ToLower();
                }



                // =============================================
                // CREATE CONTACT MESSAGE
                // =============================================

                var contactMessage =
                    new ContactMessage
                    {
                        PatientId =
                            dto.PatientId,

                        Name =
                            finalName,

                        Email =
                            finalEmail,

                        Concern =
                            dto.Concern.Trim(),

                        Message =
                            dto.Message.Trim(),

                        IsRead =
                            false,

                        CreatedAt =
                            DateTime.Now
                    };



                // =============================================
                // SAVE DATABASE
                // =============================================

                _context.ContactMessages.Add(
                    contactMessage
                );


                await _context.SaveChangesAsync();



                // =============================================
                // SUCCESS
                // =============================================

                return Ok(new
                {
                    message =
                        "Your message has been sent successfully.",

                    id =
                        contactMessage.Id
                });
            }

            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes
                        .Status500InternalServerError,

                    new
                    {
                        message =
                            "Could not send your message.",

                        detail =
                            ex.InnerException?.Message
                            ??
                            ex.Message
                    }
                );
            }
        }



        // =====================================================
        // ADMIN - GET ALL CONTACT MESSAGES
        //
        // GET:
        // /api/contact/admin/messages
        // =====================================================

        [HttpGet("admin/messages")]
        public async Task<IActionResult> GetAdminMessages()
        {
            try
            {
                var messages =
                    await _context.ContactMessages

                        .OrderByDescending(
                            message =>
                                message.CreatedAt
                        )

                        .Select(
                            message => new
                            {
                                message.Id,

                                message.PatientId,

                                message.Name,

                                message.Email,

                                message.Concern,

                                message.Message,

                                message.IsRead,

                                message.CreatedAt
                            }
                        )

                        .ToListAsync();



                return Ok(
                    messages
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
                            "Could not load contact messages.",

                        detail =
                            ex.InnerException?.Message
                            ??
                            ex.Message
                    }
                );
            }
        }



        // =====================================================
        // ADMIN - GET ONE CONTACT MESSAGE
        //
        // GET:
        // /api/contact/admin/messages/5
        // =====================================================

        [HttpGet("admin/messages/{id:int}")]
        public async Task<IActionResult> GetAdminMessage(
            int id
        )
        {
            try
            {
                var message =
                    await _context.ContactMessages

                        .Where(
                            message =>
                                message.Id ==
                                id
                        )

                        .Select(
                            message => new
                            {
                                message.Id,

                                message.PatientId,

                                message.Name,

                                message.Email,

                                message.Concern,

                                message.Message,

                                message.IsRead,

                                message.CreatedAt
                            }
                        )

                        .FirstOrDefaultAsync();



                if (message == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Contact message not found."
                    });
                }



                return Ok(
                    message
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
                            "Could not load contact message.",

                        detail =
                            ex.InnerException?.Message
                            ??
                            ex.Message
                    }
                );
            }
        }



        // =====================================================
        // ADMIN - MARK MESSAGE AS READ
        //
        // PUT:
        // /api/contact/admin/messages/5/read
        // =====================================================

        [HttpPut("admin/messages/{id:int}/read")]
        public async Task<IActionResult> MarkAsRead(
            int id
        )
        {
            try
            {
                var message =
                    await _context.ContactMessages
                        .FirstOrDefaultAsync(
                            message =>
                                message.Id ==
                                id
                        );



                if (message == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Contact message not found."
                    });
                }



                message.IsRead =
                    true;



                await _context.SaveChangesAsync();



                return Ok(new
                {
                    message =
                        "Message marked as read."
                });
            }

            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes
                        .Status500InternalServerError,

                    new
                    {
                        message =
                            "Could not update message.",

                        detail =
                            ex.InnerException?.Message
                            ??
                            ex.Message
                    }
                );
            }
        }



        // =====================================================
        // ADMIN - DELETE MESSAGE
        //
        // DELETE:
        // /api/contact/admin/messages/5
        // =====================================================

        [HttpDelete("admin/messages/{id:int}")]
        public async Task<IActionResult> DeleteMessage(
            int id
        )
        {
            try
            {
                var message =
                    await _context.ContactMessages
                        .FirstOrDefaultAsync(
                            message =>
                                message.Id ==
                                id
                        );



                if (message == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Contact message not found."
                    });
                }



                _context.ContactMessages.Remove(
                    message
                );


                await _context.SaveChangesAsync();



                return Ok(new
                {
                    message =
                        "Contact message deleted successfully."
                });
            }

            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes
                        .Status500InternalServerError,

                    new
                    {
                        message =
                            "Could not delete contact message.",

                        detail =
                            ex.InnerException?.Message
                            ??
                            ex.Message
                    }
                );
            }
        }



        // =====================================================
        // PATIENT - GET OWN SENT REPORTS
        //
        // GET:
        // /api/contact/patient/5
        //
        // Patient 5 gets ONLY rows where:
        //
        // PatientId = 5
        // =====================================================

        [HttpGet("patient/{patientId:int}")]
        public async Task<IActionResult> GetPatientMessages(
            int patientId
        )
        {
            try
            {
                // =============================================
                // CHECK PATIENT EXISTS
                // =============================================

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



                // =============================================
                // LOAD THIS PATIENT'S REPORTS
                // =============================================

                var messages =
                    await _context.ContactMessages

                        .Where(
                            message =>
                                message.PatientId ==
                                patientId
                        )

                        .OrderByDescending(
                            message =>
                                message.CreatedAt
                        )

                        .Select(
                            message => new
                            {
                                message.Id,

                                message.PatientId,

                                message.Name,

                                message.Email,

                                message.Concern,

                                message.Message,

                                message.IsRead,

                                message.CreatedAt
                            }
                        )

                        .ToListAsync();



                return Ok(
                    messages
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
                            "Could not load patient reports.",

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
    // REQUEST DTO
    //
    // It is kept here so you don't need another DTO file.
    // =========================================================

    public class ContactMessageRequestDto
    {
        public int? PatientId { get; set; }


        public string? Name { get; set; }


        public string? Email { get; set; }


        public string Concern { get; set; }
            = string.Empty;


        public string Message { get; set; }
            = string.Empty;
    }
}