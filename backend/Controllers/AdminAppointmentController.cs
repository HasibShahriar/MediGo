using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Server.Data;


namespace Server.Controllers
{
    [Route("api/admin/appointments")]
    [ApiController]
    public class AdminAppointmentController : ControllerBase
    {
        private readonly AppDbContext _context;


        // =====================================================
        // CONSTRUCTOR
        // =====================================================

        public AdminAppointmentController(
            AppDbContext context
        )
        {
            _context = context;
        }



        // =====================================================
        // GET ALL PAID APPOINTMENT REQUESTS
        //
        // GET:
        // /api/admin/appointments
        //
        // Shows:
        // Patient
        // Doctor
        // Booking fee
        // Consultation fee
        // Payment status
        // Request status
        // Appointment date
        // Time
        // Serial
        // =====================================================

        [HttpGet]
        public async Task<IActionResult> GetAppointments()
        {
            try
            {
                var appointments =
                    await (
                        from appointment
                            in _context.AppointmentRequests

                        join patient
                            in _context.Patients
                            on appointment.PatientId
                            equals patient.Id

                        join doctor
                            in _context.Doctors
                            on appointment.DoctorId
                            equals doctor.Id

                        where
                            appointment.PaymentStatus
                            ==
                            "Paid"

                        orderby
                            appointment.CreatedAt
                            descending

                        select new
                        {
                            appointment.Id,


                            // =================================
                            // PATIENT
                            // =================================

                            appointment.PatientId,

                            patientName =
                                patient.FullName,

                            patientEmail =
                                patient.Email,

                            patientPhone =
                                patient.Phone,


                            // =================================
                            // DOCTOR
                            // =================================

                            appointment.DoctorId,

                            doctorName =
                                doctor.Title
                                + " "
                                + doctor.FirstName
                                + " "
                                + doctor.LastName,

                            doctorEmail =
                                doctor.Email,

                            doctorPhone =
                                doctor.Phone,

                            bmdcNumber =
                                doctor.BmdcNumber,


                            // =================================
                            // PAYMENT
                            // =================================

                            appointment.BookingFee,

                            appointment.ConsultationFee,

                            appointment.PaymentStatus,


                            // =================================
                            // APPOINTMENT
                            // =================================

                            appointment.RequestStatus,

                            appointment.SerialNo,

                            appointment.AppointmentDate,

                            appointment.PatientTime,

                            appointment.DoctorComment,

                            appointment.CreatedAt,

                            appointment.PaidAt,

                            appointment.RespondedAt
                        }
                    )
                    .ToListAsync();



                return Ok(
                    appointments
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
                            "Could not load appointments.",

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