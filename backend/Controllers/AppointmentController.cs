using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Server.Data;
using Server.DTOs;


namespace Server.Controllers
{
    [Route("api/appointments")]
    [ApiController]
    public class AppointmentController : ControllerBase
    {
        private readonly AppDbContext _context;


        public AppointmentController(
            AppDbContext context
        )
        {
            _context =
                context;
        }



        // =====================================================
        // PATIENT DOCTOR REQUESTS
        //
        // GET:
        // /api/appointments/patient/5
        // =====================================================

        [HttpGet("patient/{patientId:int}")]
        public async Task<IActionResult> GetPatientRequests(
            int patientId
        )
        {
            var requests =
                await (
                    from request
                    in _context.AppointmentRequests

                    join doctor
                    in _context.Doctors

                    on request.DoctorId
                    equals doctor.Id


                    join setting
                    in _context.DoctorSettings

                    on doctor.Id
                    equals setting.DoctorId

                    into settings


                    from setting
                    in settings.DefaultIfEmpty()


                    where
                        request.PatientId ==
                        patientId

                        &&

                        request.PaymentStatus ==
                        "Paid"


                    orderby
                        request.CreatedAt descending


                    select new
                    {
                        request.Id,

                        request.DoctorId,

                        doctorName =
                            doctor.Title
                            + " "
                            + doctor.FirstName
                            + " "
                            + doctor.LastName,

                        specialty =
                            setting != null
                                ? setting.Specialty
                                : null,

                        qualifications =
                            setting != null
                                ? setting.Qualifications
                                : null,

                        profileImage =
                            setting != null
                                ? setting.ProfileImage
                                : null,

                        request.BookingFee,

                        request.ConsultationFee,

                        request.PaymentStatus,

                        request.RequestStatus,

                        request.SerialNo,

                        request.AppointmentDate,

                        request.PatientTime,

                        request.DoctorComment,

                        request.CreatedAt,

                        request.PaidAt,

                        request.RespondedAt
                    }
                )
                .ToListAsync();


            return Ok(
                requests
            );
        }



        // =====================================================
        // DOCTOR APPOINTMENT REQUESTS
        //
        // GET:
        // /api/appointments/doctor/2
        // =====================================================

        [HttpGet("doctor/{doctorId:int}")]
        public async Task<IActionResult> GetDoctorRequests(
            int doctorId
        )
        {
            var requests =
                await (
                    from request
                    in _context.AppointmentRequests

                    join patient
                    in _context.Patients

                    on request.PatientId
                    equals patient.Id


                    where
                        request.DoctorId ==
                        doctorId

                        &&

                        request.PaymentStatus ==
                        "Paid"


                    orderby
                        request.CreatedAt descending


                    select new
                    {
                        request.Id,

                        request.PatientId,

                        patientName =
                            patient.FullName,

                        email =
                            patient.Email,

                        phone =
                            patient.Phone,

                        request.BookingFee,

                        request.ConsultationFee,

                        request.PaymentStatus,

                        request.RequestStatus,

                        request.SerialNo,

                        request.AppointmentDate,

                        request.PatientTime,

                        request.DoctorComment,

                        request.CreatedAt
                    }
                )
                .ToListAsync();


            return Ok(
                requests
            );
        }



        // =====================================================
        // APPROVE APPOINTMENT
        //
        // PUT:
        // /api/appointments/doctor/2/10/approve
        // =====================================================

        [HttpPut(
            "doctor/{doctorId:int}/{requestId:int}/approve"
        )]
        public async Task<IActionResult> Approve(
            int doctorId,
            int requestId,
            ApproveAppointmentDto dto
        )
        {
            var request =
                await _context.AppointmentRequests
                    .FirstOrDefaultAsync(
                        request =>
                            request.Id ==
                            requestId

                            &&

                            request.DoctorId ==
                            doctorId
                    );


            if (request == null)
            {
                return NotFound(new
                {
                    message =
                        "Appointment request not found."
                });
            }



            if (
                request.PaymentStatus !=
                "Paid"
            )
            {
                return BadRequest(new
                {
                    message =
                        "Booking payment has not been completed."
                });
            }



            if (
                string.IsNullOrWhiteSpace(
                    dto.SerialNo
                )
            )
            {
                return BadRequest(new
                {
                    message =
                        "Serial number is required."
                });
            }



            request.SerialNo =
                dto.SerialNo.Trim();


            request.AppointmentDate =
                dto.AppointmentDate.Date;


            request.PatientTime =
                dto.PatientTime;


            request.DoctorComment =
                dto.Comment?.Trim();


            request.RequestStatus =
                "Approved";


            request.RespondedAt =
                DateTime.Now;



            await _context.SaveChangesAsync();



            return Ok(new
            {
                message =
                    "Appointment approved successfully."
            });
        }



        // =====================================================
        // REJECT APPOINTMENT
        //
        // PUT:
        // /api/appointments/doctor/2/10/reject
        // =====================================================

        [HttpPut(
            "doctor/{doctorId:int}/{requestId:int}/reject"
        )]
        public async Task<IActionResult> Reject(
            int doctorId,
            int requestId
        )
        {
            var request =
                await _context.AppointmentRequests
                    .FirstOrDefaultAsync(
                        request =>
                            request.Id ==
                            requestId

                            &&

                            request.DoctorId ==
                            doctorId
                    );


            if (request == null)
            {
                return NotFound(new
                {
                    message =
                        "Appointment request not found."
                });
            }



            request.RequestStatus =
                "Rejected";


            request.RespondedAt =
                DateTime.Now;



            await _context.SaveChangesAsync();



            return Ok(new
            {
                message =
                    "Appointment rejected."
            });
        }
    }
}