using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Server.Data;


namespace Server.Controllers
{
    [Route("api/admin/dashboard")]
    [ApiController]
    public class AdminDashboardController : ControllerBase
    {
        private readonly AppDbContext _context;


        // =====================================================
        // CONSTRUCTOR
        // =====================================================

        public AdminDashboardController(
            AppDbContext context
        )
        {
            _context = context;
        }



        // =====================================================
        // ADMIN DASHBOARD
        //
        // GET:
        // /api/admin/dashboard
        // =====================================================

        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var now =
                    DateTime.Now;


                var currentYear =
                    now.Year;


                var currentMonth =
                    now.Month;



                // =================================================
                // TOTAL DOCTORS
                // =================================================

                var totalDoctors =
                    await _context.Doctors
                        .CountAsync();



                // =================================================
                // TOTAL PATIENTS
                // =================================================

                var totalPatients =
                    await _context.Patients
                        .CountAsync();



                // =================================================
                // TOTAL DEPARTMENTS
                //
                // Count actual specialties currently assigned
                // to doctors.
                // =================================================

                var totalDepartments =
                    await _context.DoctorSettings

                        .Where(
                            setting =>
                                setting.Specialty != null
                                &&
                                setting.Specialty != ""
                        )

                        .Select(
                            setting =>
                                setting.Specialty
                        )

                        .Distinct()

                        .CountAsync();



                // =================================================
                // TOTAL APPOINTMENTS
                //
                // Only successfully paid appointment bookings.
                // Failed/cancelled payments are not appointments.
                // =================================================

                var totalAppointments =
                    await _context.AppointmentRequests

                        .CountAsync(
                            appointment =>
                                appointment.PaymentStatus ==
                                "Paid"
                        );



                // =================================================
                // PENDING DOCTOR REGISTRATION REQUESTS
                // =================================================

                var pendingDoctorRequests =
                    await _context.DoctorRequests
                        .CountAsync();



                // =================================================
                // MEDICINE REVENUE
                //
                // Payments.Status becomes "Paid"
                // only after successful validation.
                // =================================================

                var medicineRevenue =
                    await _context.Payments

                        .Where(
                            payment =>
                                payment.Status ==
                                "Paid"
                        )

                        .SumAsync(
                            payment =>
                                (decimal?)
                                payment.Amount
                        )

                    ??
                    0m;



                // =================================================
                // APPOINTMENT BOOKING REVENUE
                //
                // This is the ৳50 booking payment.
                // Consultation Fee is NOT added because it is
                // Pay Later.
                // =================================================

                var appointmentRevenue =
                    await _context.AppointmentPayments

                        .Where(
                            payment =>
                                payment.Status ==
                                "Paid"
                        )

                        .SumAsync(
                            payment =>
                                (decimal?)
                                payment.Amount
                        )

                    ??
                    0m;



                // =================================================
                // TOTAL REVENUE
                // =================================================

                var totalRevenue =
                    medicineRevenue
                    +
                    appointmentRevenue;



                // =================================================
                // THIS MONTH MEDICINE REVENUE
                // =================================================

                var thisMonthMedicineRevenue =
                    await _context.Payments

                        .Where(
                            payment =>
                                payment.Status ==
                                    "Paid"

                                &&

                                payment.PaidAt
                                    .HasValue

                                &&

                                payment.PaidAt.Value.Year ==
                                    currentYear

                                &&

                                payment.PaidAt.Value.Month ==
                                    currentMonth
                        )

                        .SumAsync(
                            payment =>
                                (decimal?)
                                payment.Amount
                        )

                    ??
                    0m;



                // =================================================
                // THIS MONTH APPOINTMENT REVENUE
                // =================================================

                var thisMonthAppointmentRevenue =
                    await _context.AppointmentPayments

                        .Where(
                            payment =>
                                payment.Status ==
                                    "Paid"

                                &&

                                payment.PaidAt
                                    .HasValue

                                &&

                                payment.PaidAt.Value.Year ==
                                    currentYear

                                &&

                                payment.PaidAt.Value.Month ==
                                    currentMonth
                        )

                        .SumAsync(
                            payment =>
                                (decimal?)
                                payment.Amount
                        )

                    ??
                    0m;



                // =================================================
                // THIS MONTH TOTAL
                // =================================================

                var thisMonthRevenue =
                    thisMonthMedicineRevenue
                    +
                    thisMonthAppointmentRevenue;



                // =================================================
                // MONTHLY REGISTERED USERS
                //
                // Patient registration
                // +
                // approved doctor registration
                //
                // for current year Jan-Dec
                // =================================================

                var patientRegistrationData =
                    await _context.Patients

                        .Where(
                            patient =>
                                patient.CreatedAt.Year ==
                                currentYear
                        )

                        .GroupBy(
                            patient =>
                                patient.CreatedAt.Month
                        )

                        .Select(
                            group => new
                            {
                                Month =
                                    group.Key,

                                Count =
                                    group.Count()
                            }
                        )

                        .ToListAsync();



                var doctorRegistrationData =
                    await _context.Doctors

                        .Where(
                            doctor =>
                                doctor.CreatedAt.Year ==
                                currentYear
                        )

                        .GroupBy(
                            doctor =>
                                doctor.CreatedAt.Month
                        )

                        .Select(
                            group => new
                            {
                                Month =
                                    group.Key,

                                Count =
                                    group.Count()
                            }
                        )

                        .ToListAsync();



                var monthNames =
                    new[]
                    {
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec"
                    };



                var monthlyUsers =
                    Enumerable
                        .Range(
                            1,
                            12
                        )

                        .Select(
                            month =>
                            {
                                var patientCount =
                                    patientRegistrationData

                                        .FirstOrDefault(
                                            item =>
                                                item.Month ==
                                                month
                                        )

                                        ?.Count
                                        ??
                                        0;


                                var doctorCount =
                                    doctorRegistrationData

                                        .FirstOrDefault(
                                            item =>
                                                item.Month ==
                                                month
                                        )

                                        ?.Count
                                        ??
                                        0;



                                return new
                                {
                                    month =
                                        monthNames[
                                            month - 1
                                        ],

                                    users =
                                        patientCount
                                        +
                                        doctorCount,

                                    patients =
                                        patientCount,

                                    doctors =
                                        doctorCount
                                };
                            }
                        )

                        .ToList();



                // =================================================
                // MONTHLY REVENUE FOR JAN-DEC
                // =================================================

                var medicineMonthlyData =
                    await _context.Payments

                        .Where(
                            payment =>
                                payment.Status ==
                                    "Paid"

                                &&

                                payment.PaidAt
                                    .HasValue

                                &&

                                payment.PaidAt.Value.Year ==
                                    currentYear
                        )

                        .GroupBy(
                            payment =>
                                payment.PaidAt!
                                    .Value.Month
                        )

                        .Select(
                            group => new
                            {
                                Month =
                                    group.Key,

                                Amount =
                                    group.Sum(
                                        payment =>
                                            payment.Amount
                                    )
                            }
                        )

                        .ToListAsync();



                var appointmentMonthlyData =
                    await _context.AppointmentPayments

                        .Where(
                            payment =>
                                payment.Status ==
                                    "Paid"

                                &&

                                payment.PaidAt
                                    .HasValue

                                &&

                                payment.PaidAt.Value.Year ==
                                    currentYear
                        )

                        .GroupBy(
                            payment =>
                                payment.PaidAt!
                                    .Value.Month
                        )

                        .Select(
                            group => new
                            {
                                Month =
                                    group.Key,

                                Amount =
                                    group.Sum(
                                        payment =>
                                            payment.Amount
                                    )
                            }
                        )

                        .ToListAsync();



                var monthlyRevenue =
                    Enumerable
                        .Range(
                            1,
                            12
                        )

                        .Select(
                            month =>
                            {
                                var medicine =
                                    medicineMonthlyData

                                        .FirstOrDefault(
                                            item =>
                                                item.Month ==
                                                month
                                        )

                                        ?.Amount
                                        ??
                                        0m;


                                var appointment =
                                    appointmentMonthlyData

                                        .FirstOrDefault(
                                            item =>
                                                item.Month ==
                                                month
                                        )

                                        ?.Amount
                                        ??
                                        0m;



                                return new
                                {
                                    month =
                                        monthNames[
                                            month - 1
                                        ],

                                    medicineRevenue =
                                        medicine,

                                    appointmentRevenue =
                                        appointment,

                                    totalRevenue =
                                        medicine
                                        +
                                        appointment
                                };
                            }
                        )

                        .ToList();



                // =================================================
                // RETURN DASHBOARD
                // =================================================

                return Ok(new
                {
                    cards = new
                    {
                        totalDoctors,

                        totalPatients,

                        totalDepartments,

                        totalAppointments,

                        pendingDoctorRequests,

                        totalRevenue
                    },


                    revenue = new
                    {
                        medicineRevenue,

                        appointmentRevenue,

                        totalRevenue,

                        thisMonthMedicineRevenue,

                        thisMonthAppointmentRevenue,

                        thisMonthRevenue
                    },


                    monthlyUsers,


                    monthlyRevenue,


                    currentYear,


                    currentMonth
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
                            "Could not load admin dashboard.",

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