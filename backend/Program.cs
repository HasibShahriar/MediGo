using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;

using Server.Data;
using Server.Models;


var builder = WebApplication.CreateBuilder(args);


// =====================================================
// SERVICES
// =====================================================

builder.Services.AddControllers();


// =====================================================
// DATABASE
// =====================================================

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString(
            "DefaultConnection"
        )
    );
});


// =====================================================
// CORS
// =====================================================

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowReact",
        policy =>
        {
            policy
                .WithOrigins(
                    "http://localhost:5167",
                    "http://localhost:5173"
                )
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    );
});


// =====================================================
// UPLOAD DIRECTORY
// =====================================================

var uploadsPath =
    Path.Combine(
        builder.Environment.ContentRootPath,
        "wwwroot",
        "uploads"
    );


// Main uploads folder
Directory.CreateDirectory(
    uploadsPath
);


// Patient images
Directory.CreateDirectory(
    Path.Combine(
        uploadsPath,
        "patients"
    )
);


// Doctor images
Directory.CreateDirectory(
    Path.Combine(
        uploadsPath,
        "doctors"
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

using (var scope = app.Services.CreateScope())
{
    try
    {
        var context =
            scope.ServiceProvider
                .GetRequiredService<AppDbContext>();


        // Check if admin already exists
        var existingAdmin =
            await context.Admins
                .FirstOrDefaultAsync(
                    a =>
                        a.Email.ToLower()
                        == "admin"
                );


        // Only create once
        if (existingAdmin == null)
        {
            var admin =
                new Admin
                {
                    Email = "admin",

                    CreatedAt =
                        DateTime.Now
                };


            // Create password hasher
            var passwordHasher =
                new PasswordHasher<Admin>();


            // Hash admin123
            admin.PasswordHash =
                passwordHasher.HashPassword(
                    admin,
                    "admin123"
                );


            // Add to database
            context.Admins.Add(
                admin
            );


            await context.SaveChangesAsync();


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
            ex.Message
        );

        Console.WriteLine(
            "===================================="
        );
    }
}


// =====================================================
// CORS
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
// http://localhost:5167/uploads/patients/photo.jpg
//
// http://localhost:5167/uploads/doctors/photo.jpg
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