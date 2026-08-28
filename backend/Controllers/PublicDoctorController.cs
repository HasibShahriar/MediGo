using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Server.Data;


namespace Server.Controllers
{
    [Route("api/public-doctors")]
    [ApiController]
    public class PublicDoctorController : ControllerBase
    {
        private readonly AppDbContext _context;


        public PublicDoctorController(
            AppDbContext context
        )
        {
            _context = context;
        }



        // =====================================================
        // GET DOCTORS BY SPECIALTY
        //
        // Example:
        // GET /api/public-doctors/speciality/cardiology
        // =====================================================

        [HttpGet("speciality/{speciality}")]
        public async Task<IActionResult> GetDoctorsBySpeciality(
            string speciality
        )
        {
            if (
                string.IsNullOrWhiteSpace(
                    speciality
                )
            )
            {
                return BadRequest(new
                {
                    message =
                        "Speciality is required."
                });
            }


            var specialtyValue =
                speciality
                    .Trim()
                    .ToLower();



            // =================================================
            // JOIN Doctors + DoctorSettings
            // =================================================

            var doctors =
                await (
                    from doctor
                    in _context.Doctors

                    join settings
                    in _context.DoctorSettings

                    on doctor.Id
                    equals settings.DoctorId

                    where
                        doctor.IsVisible == true
                        &&
                        settings.Specialty
                        == specialtyValue

                    orderby
                        doctor.FirstName,
                        doctor.LastName

                    select new
                    {
                        // =====================================
                        // Doctors TABLE
                        // =====================================

                        id =
                            doctor.Id,


                        title =
                            doctor.Title,


                        firstName =
                            doctor.FirstName,


                        lastName =
                            doctor.LastName,


                        fullName =
                            doctor.Title
                            + " "
                            + doctor.FirstName
                            + " "
                            + doctor.LastName,


                        bmdcNumber =
                            doctor.BmdcNumber,


                        joinedAt =
                            doctor.CreatedAt,


                        // =====================================
                        // DoctorSettings TABLE
                        // =====================================

                        qualifications =
                            settings.Qualifications,


                        specialty =
                            settings.Specialty,


                        workingPlace =
                            settings.WorkingPlace,


                        workingDescription =
                            settings.WorkingDescription,


                        experienceYears =
                            settings.ExperienceYears,


                        consultationFee =
                            settings.ConsultationFee,


                        followUpFee =
                            settings.FollowUpFee,


                        patientsAttended =
                            settings.PatientsAttended,


                        doctorCode =
                            settings.DoctorCode,


                        profileImage =
                            settings.ProfileImage
                    }
                )
                .ToListAsync();



            return Ok(doctors);
        }



        // =====================================================
        // GET ONE DOCTOR DETAILS
        //
        // Example:
        // GET /api/public-doctors/5
        // =====================================================

        [HttpGet("{doctorId:int}")]
        public async Task<IActionResult> GetDoctorDetails(
            int doctorId
        )
        {
            var doctor =
                await (
                    from d
                    in _context.Doctors

                    join settings
                    in _context.DoctorSettings

                    on d.Id
                    equals settings.DoctorId

                    where
                        d.Id == doctorId
                        &&
                        d.IsVisible == true

                    select new
                    {
                        // =====================================
                        // Doctors TABLE
                        // =====================================

                        id =
                            d.Id,


                        title =
                            d.Title,


                        firstName =
                            d.FirstName,


                        lastName =
                            d.LastName,


                        fullName =
                            d.Title
                            + " "
                            + d.FirstName
                            + " "
                            + d.LastName,


                        bmdcNumber =
                            d.BmdcNumber,


                        joinedAt =
                            d.CreatedAt,


                        // =====================================
                        // DoctorSettings TABLE
                        // =====================================

                        qualifications =
                            settings.Qualifications,


                        specialty =
                            settings.Specialty,


                        workingPlace =
                            settings.WorkingPlace,


                        workingDescription =
                            settings.WorkingDescription,


                        experienceYears =
                            settings.ExperienceYears,


                        bio =
                            settings.Bio,


                        instantConsultationMinutes =
                            settings.InstantConsultationMinutes,


                        appointmentConsultationMinutes =
                            settings.AppointmentConsultationMinutes,


                        consultationFee =
                            settings.ConsultationFee,


                        followUpFee =
                            settings.FollowUpFee,


                        patientsAttended =
                            settings.PatientsAttended,


                        doctorCode =
                            settings.DoctorCode,


                        profileImage =
                            settings.ProfileImage
                    }
                )
                .FirstOrDefaultAsync();



            if (doctor == null)
            {
                return NotFound(new
                {
                    message =
                        "Doctor not found."
                });
            }



            return Ok(doctor);
        }
    }
}