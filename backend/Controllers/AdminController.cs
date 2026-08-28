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
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;


        // =====================================================
        // CONSTRUCTOR
        // =====================================================

        public AdminController(
            AppDbContext context
        )
        {
            _context = context;
        }



        // =====================================================
        // ADMIN LOGIN
        //
        // POST:
        // api/Admin/login
        // =====================================================

        [HttpPost("login")]
        public async Task<IActionResult> Login(
            AdminLoginDto dto
        )
        {
            // =============================================
            // EMAIL / USERNAME VALIDATION
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
                        "Admin username is required!"
                });
            }


            // =============================================
            // PASSWORD VALIDATION
            // =============================================

            if (
                string.IsNullOrWhiteSpace(
                    dto.Password
                )
            )
            {
                return BadRequest(new
                {
                    message =
                        "Password is required!"
                });
            }


            // =============================================
            // NORMALIZE EMAIL / USERNAME
            // =============================================

            var email =
                dto.Email
                    .Trim()
                    .ToLower();


            // =============================================
            // FIND ADMIN
            // =============================================

            var admin =
                await _context.Admins
                    .FirstOrDefaultAsync(
                        a =>
                            a.Email.ToLower()
                            == email
                    );


            if (admin == null)
            {
                return Unauthorized(new
                {
                    message =
                        "Invalid admin username or password!"
                });
            }


            // =============================================
            // VERIFY PASSWORD
            // =============================================

            var passwordHasher =
                new PasswordHasher<Admin>();


            var result =
                passwordHasher
                    .VerifyHashedPassword(
                        admin,
                        admin.PasswordHash,
                        dto.Password
                    );


            if (
                result ==
                PasswordVerificationResult.Failed
            )
            {
                return Unauthorized(new
                {
                    message =
                        "Invalid admin username or password!"
                });
            }


            // =============================================
            // SUCCESS
            // =============================================

            return Ok(new
            {
                message =
                    "Admin login successful!",

                admin = new
                {
                    admin.Id,

                    admin.Email
                }
            });
        }
    }
}