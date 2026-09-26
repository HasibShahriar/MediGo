using System.Security.Cryptography;

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Server.Data;
using Server.DTOs;
using Server.Models;
using Server.Services;


namespace Server.Controllers
{
    [Route("api/password-recovery")]
    [ApiController]
    public class PasswordRecoveryController
        : ControllerBase
    {
        private readonly AppDbContext _context;

        private readonly IEmailService
            _emailService;


        // =====================================================
        // CONSTRUCTOR
        // =====================================================

        public PasswordRecoveryController(
            AppDbContext context,
            IEmailService emailService
        )
        {
            _context =
                context;

            _emailService =
                emailService;
        }


        // =====================================================
        // SEND RECOVERY PASSWORD
        //
        // POST:
        // api/password-recovery/send
        //
        // BODY:
        //
        // {
        //     "email": "example@gmail.com",
        //     "accountType": "patient"
        // }
        //
        // OR:
        //
        // {
        //     "email": "example@gmail.com",
        //     "accountType": "doctor"
        // }
        // =====================================================

        [HttpPost("send")]
        public async Task<IActionResult>
            SendRecoveryPassword(
                PasswordRecoveryRequestDto request
            )
        {
            // =================================================
            // EMAIL REQUIRED
            // =================================================

            if (
                string.IsNullOrWhiteSpace(
                    request.Email
                )
            )
            {
                return BadRequest(
                    new
                    {
                        message =
                            "Email is required!"
                    }
                );
            }


            // =================================================
            // ACCOUNT TYPE REQUIRED
            // =================================================

            if (
                string.IsNullOrWhiteSpace(
                    request.AccountType
                )
            )
            {
                return BadRequest(
                    new
                    {
                        message =
                            "Account type is required!"
                    }
                );
            }


            // =================================================
            // NORMALIZE INPUT
            // =================================================

            var email =
                request.Email
                    .Trim()
                    .ToLower();


            var accountType =
                request.AccountType
                    .Trim()
                    .ToLower();


            // =================================================
            // PATIENT
            // =================================================

            if (
                accountType ==
                "patient"
            )
            {
                return await
                    RecoverPatientPassword(
                        email
                    );
            }


            // =================================================
            // DOCTOR
            // =================================================

            if (
                accountType ==
                "doctor"
            )
            {
                return await
                    RecoverDoctorPassword(
                        email
                    );
            }


            // =================================================
            // INVALID TYPE
            // =================================================

            return BadRequest(
                new
                {
                    message =
                        "Invalid account type!"
                }
            );
        }


        // =====================================================
        // PATIENT PASSWORD RECOVERY
        //
        // IMPORTANT:
        // Only checks Patients table.
        // =====================================================

        private async Task<IActionResult>
            RecoverPatientPassword(
                string email
            )
        {
            // =================================================
            // FIND PATIENT
            // =================================================

            var patient =
                await _context.Patients
                    .FirstOrDefaultAsync(
                        p =>
                            p.Email
                                .ToLower()
                            ==
                            email
                    );


            // =================================================
            // PATIENT NOT FOUND
            // =================================================

            if (
                patient == null
            )
            {
                return NotFound(
                    new
                    {
                        message =
                            "No patient account was found with this email."
                    }
                );
            }


            // =================================================
            // GENERATE NEW RECOVERY PASSWORD
            // =================================================

            var recoveryPassword =
                GenerateRecoveryPassword();


            // =================================================
            // START DATABASE TRANSACTION
            // =================================================

            await using var transaction =
                await _context.Database
                    .BeginTransactionAsync();


            try
            {
                // =============================================
                // HASH RECOVERY PASSWORD
                // =============================================

                var passwordHasher =
                    new PasswordHasher<Patient>();


                patient.PasswordHash =
                    passwordHasher
                        .HashPassword(
                            patient,
                            recoveryPassword
                        );


                // =============================================
                // SAVE NEW PASSWORD HASH
                // =============================================

                await _context
                    .SaveChangesAsync();


                // =============================================
                // CREATE EMAIL
                // =============================================

                var subject =
                    "MediGo Patient Password Recovery";


                var body =
                    BuildRecoveryEmail(
                        "Patient",
                        recoveryPassword
                    );


                // =============================================
                // SEND EMAIL
                // =============================================

                await _emailService
                    .SendEmailAsync(
                        patient.Email,
                        subject,
                        body
                    );


                // =============================================
                // EMAIL SUCCESS
                // COMMIT PASSWORD CHANGE
                // =============================================

                await transaction
                    .CommitAsync();


                // =============================================
                // SUCCESS RESPONSE
                // =============================================

                return Ok(
                    new
                    {
                        message =
                            "A new recovery password has been sent to your patient email."
                    }
                );
            }

            catch (Exception ex)
            {
                // =============================================
                // ROLLBACK PASSWORD CHANGE
                // =============================================

                await transaction
                    .RollbackAsync();


                // =============================================
                // SHOW REAL ERROR IN BACKEND TERMINAL
                // =============================================

                Console.WriteLine(
                    "===================================="
                );

                Console.WriteLine(
                    "PATIENT PASSWORD RECOVERY ERROR"
                );

                Console.WriteLine(
                    ex.ToString()
                );

                Console.WriteLine(
                    "===================================="
                );


                // =============================================
                // REAL ERROR MESSAGE
                // =============================================

                var realError =
                    ex.InnerException?.Message
                    ??
                    ex.Message;


                // =============================================
                // DEVELOPMENT RESPONSE
                // =============================================

                return StatusCode(
                    StatusCodes
                        .Status500InternalServerError,

                    new
                    {
                        message =
                            "Could not send the recovery email. Your password has not been changed.",

                        detail =
                            realError
                    }
                );
            }
        }


        // =====================================================
        // DOCTOR PASSWORD RECOVERY
        //
        // IMPORTANT:
        // Only checks Doctors table.
        // =====================================================

        private async Task<IActionResult>
            RecoverDoctorPassword(
                string email
            )
        {
            // =================================================
            // FIND DOCTOR
            // =================================================

            var doctor =
                await _context.Doctors
                    .FirstOrDefaultAsync(
                        d =>
                            d.Email
                                .ToLower()
                            ==
                            email
                    );


            // =================================================
            // DOCTOR NOT FOUND
            // =================================================

            if (
                doctor == null
            )
            {
                return NotFound(
                    new
                    {
                        message =
                            "No doctor account was found with this email."
                    }
                );
            }


            // =================================================
            // GENERATE NEW RECOVERY PASSWORD
            // =================================================

            var recoveryPassword =
                GenerateRecoveryPassword();


            // =================================================
            // START DATABASE TRANSACTION
            // =================================================

            await using var transaction =
                await _context.Database
                    .BeginTransactionAsync();


            try
            {
                // =============================================
                // HASH RECOVERY PASSWORD
                // =============================================

                var passwordHasher =
                    new PasswordHasher<Doctor>();


                doctor.PasswordHash =
                    passwordHasher
                        .HashPassword(
                            doctor,
                            recoveryPassword
                        );


                // =============================================
                // SAVE NEW PASSWORD HASH
                // =============================================

                await _context
                    .SaveChangesAsync();


                // =============================================
                // CREATE EMAIL
                // =============================================

                var subject =
                    "MediGo Doctor Password Recovery";


                var body =
                    BuildRecoveryEmail(
                        "Doctor",
                        recoveryPassword
                    );


                // =============================================
                // SEND EMAIL
                // =============================================

                await _emailService
                    .SendEmailAsync(
                        doctor.Email,
                        subject,
                        body
                    );


                // =============================================
                // EMAIL SUCCESS
                // COMMIT PASSWORD CHANGE
                // =============================================

                await transaction
                    .CommitAsync();


                // =============================================
                // SUCCESS RESPONSE
                // =============================================

                return Ok(
                    new
                    {
                        message =
                            "A new recovery password has been sent to your doctor email."
                    }
                );
            }

            catch (Exception ex)
            {
                // =============================================
                // ROLLBACK PASSWORD CHANGE
                // =============================================

                await transaction
                    .RollbackAsync();


                // =============================================
                // SHOW REAL ERROR IN BACKEND TERMINAL
                // =============================================

                Console.WriteLine(
                    "===================================="
                );

                Console.WriteLine(
                    "DOCTOR PASSWORD RECOVERY ERROR"
                );

                Console.WriteLine(
                    ex.ToString()
                );

                Console.WriteLine(
                    "===================================="
                );


                // =============================================
                // REAL ERROR
                // =============================================

                var realError =
                    ex.InnerException?.Message
                    ??
                    ex.Message;


                return StatusCode(
                    StatusCodes
                        .Status500InternalServerError,

                    new
                    {
                        message =
                            "Could not send the recovery email. Your password has not been changed.",

                        detail =
                            realError
                    }
                );
            }
        }


        // =====================================================
        // GENERATE RECOVERY PASSWORD
        //
        // Example:
        // MediGo@538291
        // =====================================================

        private static string
            GenerateRecoveryPassword()
        {
            var number =
                RandomNumberGenerator
                    .GetInt32(
                        100000,
                        1000000
                    );


            return
                $"MediGo@{number}";
        }


        // =====================================================
        // EMAIL DESIGN
        // =====================================================

        private static string
            BuildRecoveryEmail(
                string accountType,
                string recoveryPassword
            )
        {
            return $@"
<!DOCTYPE html>

<html>

<head>
    <meta charset='UTF-8'>
</head>


<body style='
    margin:0;
    padding:0;
    background:#f5f7fb;
    font-family:Arial,sans-serif;
'>


    <div style='
        max-width:600px;
        margin:30px auto;
        background:#ffffff;
        border-radius:14px;
        overflow:hidden;
        box-shadow:0 8px 30px rgba(0,0,0,0.08);
    '>


        <!-- HEADER -->

        <div style='
            padding:28px;
            text-align:center;
            background:
                linear-gradient(
                    135deg,
                    #ec4899,
                    #8b5cf6
                );
            color:white;
        '>


            <h1 style='
                margin:0;
                font-size:30px;
            '>

                MediGo

            </h1>


            <p style='
                margin:8px 0 0;
                font-size:15px;
            '>

                Healthcare Anytime Anywhere

            </p>


        </div>



        <!-- BODY -->

        <div style='
            padding:32px;
            color:#374151;
        '>


            <h2 style='
                margin-top:0;
                color:#111827;
            '>

                {accountType} Password Recovery

            </h2>


            <p style='
                line-height:1.7;
            '>

                A password recovery request
                was made for your MediGo
                {accountType.ToLower()} account.

            </p>


            <p style='
                line-height:1.7;
            '>

                Your new recovery password is:

            </p>



            <!-- PASSWORD -->

            <div style='
                margin:25px 0;
                padding:20px;
                border-radius:12px;
                background:#f5f3ff;
                border:1px solid #ddd6fe;
                text-align:center;
                color:#7c3aed;
                font-size:25px;
                font-weight:bold;
                letter-spacing:1px;
            '>

                {recoveryPassword}

            </div>



            <p style='
                line-height:1.7;
            '>

                You can now sign in to your
                MediGo account using this password.

            </p>


            <p style='
                line-height:1.7;
            '>

                After signing in, please change
                this password from your account
                settings.

            </p>



            <div style='
                margin-top:28px;
                padding:15px;
                background:#fff7ed;
                border-radius:8px;
                color:#9a3412;
                font-size:13px;
                line-height:1.6;
            '>

                If you did not request this
                password recovery, please contact
                MediGo support.

            </div>


        </div>



        <!-- FOOTER -->

        <div style='
            padding:18px;
            text-align:center;
            background:#f8fafc;
            color:#9ca3af;
            font-size:12px;
        '>

            MediGo Healthcare

        </div>


    </div>


</body>

</html>";
        }
    }
}