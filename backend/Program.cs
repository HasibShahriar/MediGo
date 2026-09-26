using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;

using Server.Data;
using Server.Models;
using Server.Services;


var builder =
    WebApplication.CreateBuilder(args);


// =====================================================
// CONTROLLERS
// =====================================================

builder.Services.AddControllers();


// =====================================================
// HTTP CLIENT
//
// Required for:
// PaymentController
// SSLCOMMERZ API communication
// =====================================================

builder.Services.AddHttpClient();


// =====================================================
// EMAIL SERVICE
//
// Required for:
// Patient password recovery
// Doctor password recovery
//
// IEmailService:
// Services/IEmailService.cs
//
// EmailService:
// Services/EmailService.cs
// =====================================================

builder.Services.AddScoped<
    IEmailService,
    EmailService
>();


// =====================================================
// DATABASE
// =====================================================

builder.Services.AddDbContext<AppDbContext>(
    options =>
    {
        options.UseSqlServer(
            builder.Configuration
                .GetConnectionString(
                    "DefaultConnection"
                )
        );
    }
);


// =====================================================
// CORS
//
// React:
// http://localhost:5173
//
// Backend:
// http://localhost:5138
// =====================================================

builder.Services.AddCors(
    options =>
    {
        options.AddPolicy(
            "AllowReact",
            policy =>
            {
                policy
                    .WithOrigins(
                        "http://localhost:5173",
                        "http://localhost:5138"
                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            }
        );
    }
);


// =====================================================
// UPLOAD DIRECTORY
// =====================================================

var uploadsPath =
    Path.Combine(
        builder.Environment.ContentRootPath,
        "wwwroot",
        "uploads"
    );


// =====================================================
// CREATE MAIN UPLOAD FOLDER
// =====================================================

Directory.CreateDirectory(
    uploadsPath
);


// =====================================================
// PATIENT IMAGE FOLDER
//
// wwwroot/uploads/patients
// =====================================================

Directory.CreateDirectory(
    Path.Combine(
        uploadsPath,
        "patients"
    )
);


// =====================================================
// DOCTOR IMAGE FOLDER
//
// wwwroot/uploads/doctors
// =====================================================

Directory.CreateDirectory(
    Path.Combine(
        uploadsPath,
        "doctors"
    )
);


// =====================================================
// MEDICINE IMAGE FOLDER
//
// wwwroot/uploads/medicines
// =====================================================

Directory.CreateDirectory(
    Path.Combine(
        uploadsPath,
        "medicines"
    )
);


// =====================================================
// BUILD APPLICATION
// =====================================================

var app =
    builder.Build();


// =====================================================
// CREATE DEFAULT ADMIN
//
// Username: admin
// Password: admin123
//
// Password is stored HASHED.
// =====================================================

using (
    var scope =
        app.Services.CreateScope()
)
{
    try
    {
        var context =
            scope.ServiceProvider
                .GetRequiredService<AppDbContext>();


        // =============================================
        // CHECK ADMIN
        // =============================================

        var existingAdmin =
            await context.Admins
                .FirstOrDefaultAsync(
                    admin =>
                        admin.Email
                            .ToLower()
                        ==
                        "admin"
                );


        // =============================================
        // CREATE ADMIN ONLY ONCE
        // =============================================

        if (
            existingAdmin ==
            null
        )
        {
            var admin =
                new Admin
                {
                    Email =
                        "admin",

                    CreatedAt =
                        DateTime.Now
                };


            // =========================================
            // PASSWORD HASHER
            // =========================================

            var passwordHasher =
                new PasswordHasher<Admin>();


            // =========================================
            // HASH PASSWORD
            // =========================================

            admin.PasswordHash =
                passwordHasher
                    .HashPassword(
                        admin,
                        "admin123"
                    );


            // =========================================
            // SAVE ADMIN
            // =========================================

            context.Admins.Add(
                admin
            );


            await context
                .SaveChangesAsync();


            Console.WriteLine(
                "===================================="
            );

            Console.WriteLine(
                "Default MediGo Admin Created"
            );

            Console.WriteLine(
                "Username: admin"
            );

            Console.WriteLine(
                "Password: admin123"
            );

            Console.WriteLine(
                "===================================="
            );
        }

        else
        {
            Console.WriteLine(
                "MediGo admin already exists."
            );
        }
    }

    catch (Exception ex)
    {
        Console.WriteLine(
            "===================================="
        );

        Console.WriteLine(
            "ADMIN CREATION ERROR"
        );

        Console.WriteLine(
            ex.InnerException?.Message
            ??
            ex.Message
        );

        Console.WriteLine(
            "===================================="
        );
    }
}


// =====================================================
// CORS
//
// Must be before MapControllers.
// =====================================================

app.UseCors(
    "AllowReact"
);


// =====================================================
// NORMAL WWWROOT STATIC FILES
// =====================================================

app.UseStaticFiles();


// =====================================================
// EXPLICITLY SERVE /uploads
//
// Examples:
//
// http://localhost:5138/uploads/patients/photo.jpg
//
// http://localhost:5138/uploads/doctors/photo.jpg
//
// http://localhost:5138/uploads/medicines/medicine.jpg
// =====================================================

app.UseStaticFiles(
    new StaticFileOptions
    {
        FileProvider =
            new PhysicalFileProvider(
                uploadsPath
            ),

        RequestPath =
            "/uploads"
    }
);


// =====================================================
// MAP API CONTROLLERS
// =====================================================

app.MapControllers();


// =====================================================
// RUN SERVER
// =====================================================

app.Run();