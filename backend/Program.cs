using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;

using System.Threading.RateLimiting;

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
// GENERAL HTTP CLIENT
//
// Used by:
// - SSLCOMMERZ
// - other external API calls
// =====================================================

builder.Services.AddHttpClient();


// =====================================================
// EMAIL SERVICE
// =====================================================

builder.Services.AddScoped<
    IEmailService,
    EmailService
>();


// =====================================================
// GEMINI AI DOCTOR FINDER
// =====================================================

builder.Services.AddHttpClient<
    IAiDoctorService,
    AiDoctorService
>();


// =====================================================
// AI RATE LIMITING
//
// Maximum:
// 10 AI requests per IP per minute
// =====================================================

builder.Services.AddRateLimiter(
    options =>
    {
        options.RejectionStatusCode =
            StatusCodes.Status429TooManyRequests;


        options.AddPolicy(
            "ai",
            httpContext =>
                RateLimitPartition
                    .GetFixedWindowLimiter(
                        partitionKey:
                            httpContext
                                .Connection
                                .RemoteIpAddress
                                ?.ToString()
                            ??
                            "unknown",

                        factory:
                            _ =>
                                new FixedWindowRateLimiterOptions
                                {
                                    PermitLimit = 10,

                                    Window =
                                        TimeSpan.FromMinutes(1),

                                    QueueLimit = 0,

                                    AutoReplenishment = true
                                }
                    )
        );
    }
);


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
// FRONTEND URL
//
// LOCAL:
// http://localhost:5173
//
// PRODUCTION:
// Value will come from Azure environment variable:
// FrontendUrl
// =====================================================

var frontendUrl =
    builder.Configuration["FrontendUrl"]
    ??
    "http://localhost:5173";


frontendUrl =
    frontendUrl.TrimEnd('/');


// =====================================================
// CORS ORIGINS
// =====================================================

var allowedOrigins =
    new List<string>
    {
        "http://localhost:5173"
    };


if (
    !string.IsNullOrWhiteSpace(
        frontendUrl
    )
    &&
    !allowedOrigins.Any(
        origin =>
            origin.Equals(
                frontendUrl,
                StringComparison.OrdinalIgnoreCase
            )
    )
)
{
    allowedOrigins.Add(
        frontendUrl
    );
}


// =====================================================
// CORS
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
                        allowedOrigins.ToArray()
                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            }
        );
    }
);


// =====================================================
// UPLOAD DIRECTORIES
//
// LOCAL:
// backend/wwwroot/uploads
//
// AZURE:
// HOME/data/uploads
//
// Azure production storage is separated from the
// deployed application files so uploaded pictures are
// not lost every time the application is redeployed.
// =====================================================

var bundledUploadsPath =
    Path.Combine(
        builder.Environment.ContentRootPath,
        "wwwroot",
        "uploads"
    );


var azureHomeDirectory =
    Environment.GetEnvironmentVariable(
        "HOME"
    );


string uploadsPath;


if (
    builder.Environment.IsDevelopment()
    ||
    string.IsNullOrWhiteSpace(
        azureHomeDirectory
    )
)
{
    // =============================================
    // LOCAL DEVELOPMENT
    // =============================================

    uploadsPath =
        bundledUploadsPath;
}

else
{
    // =============================================
    // AZURE PRODUCTION
    // =============================================

    uploadsPath =
        Path.Combine(
            azureHomeDirectory,
            "data",
            "uploads"
        );
}


// =====================================================
// CREATE UPLOAD FOLDERS
// =====================================================

Directory.CreateDirectory(
    uploadsPath
);


Directory.CreateDirectory(
    Path.Combine(
        uploadsPath,
        "patients"
    )
);


Directory.CreateDirectory(
    Path.Combine(
        uploadsPath,
        "doctors"
    )
);


Directory.CreateDirectory(
    Path.Combine(
        uploadsPath,
        "medicines"
    )
);


// =====================================================
// COPY EXISTING BUNDLED IMAGES TO AZURE STORAGE
//
// Only copies files that are not already present.
//
// This helps preserve doctor/medicine demo images
// shipped with your project.
// =====================================================

if (
    !builder.Environment.IsDevelopment()
    &&
    Directory.Exists(
        bundledUploadsPath
    )
    &&
    !Path.GetFullPath(
        bundledUploadsPath
    ).Equals(
        Path.GetFullPath(
            uploadsPath
        ),
        StringComparison.OrdinalIgnoreCase
    )
)
{
    CopyMissingFiles(
        bundledUploadsPath,
        uploadsPath
    );
}


// =====================================================
// BUILD APPLICATION
// =====================================================

var app =
    builder.Build();


// =====================================================
// DEFAULT ADMIN SETTINGS
//
// Development fallback:
// Username = admin
// Password = admin123
//
// Production:
//
// DefaultAdmin__Username
// DefaultAdmin__Password
//
// must be configured in Azure.
//
// DO NOT expose the production admin password.
// =====================================================

var defaultAdminUsername =
    builder.Configuration[
        "DefaultAdmin:Username"
    ]
    ??
    "admin";


var defaultAdminPassword =
    builder.Configuration[
        "DefaultAdmin:Password"
    ];


// =====================================================
// LOCAL DEVELOPMENT PASSWORD
// =====================================================

if (
    builder.Environment.IsDevelopment()
    &&
    string.IsNullOrWhiteSpace(
        defaultAdminPassword
    )
)
{
    defaultAdminPassword =
        "admin123";
}


// =====================================================
// CREATE DEFAULT ADMIN
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


        var existingAdmin =
            await context.Admins
                .FirstOrDefaultAsync(
                    admin =>
                        admin.Email
                            .ToLower()
                        ==
                        defaultAdminUsername
                            .ToLower()
                );


        // =============================================
        // CREATE ONLY IF:
        //
        // 1. Admin doesn't exist
        // 2. Password is configured
        // =============================================

        if (
            existingAdmin == null
            &&
            !string.IsNullOrWhiteSpace(
                defaultAdminPassword
            )
        )
        {
            var admin =
                new Admin
                {
                    Email =
                        defaultAdminUsername,

                    CreatedAt =
                        DateTime.Now
                };


            var passwordHasher =
                new PasswordHasher<Admin>();


            admin.PasswordHash =
                passwordHasher
                    .HashPassword(
                        admin,
                        defaultAdminPassword
                    );


            context.Admins.Add(
                admin
            );


            await context
                .SaveChangesAsync();


            Console.WriteLine(
                "===================================="
            );

            Console.WriteLine(
                "Default MediGo admin created."
            );

            Console.WriteLine(
                "===================================="
            );
        }

        else if (
            existingAdmin != null
        )
        {
            Console.WriteLine(
                "MediGo admin already exists."
            );
        }

        else
        {
            Console.WriteLine(
                "Default admin was not created because no production password was configured."
            );
        }
    }

    catch (
        Exception ex
    )
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
// =====================================================

app.UseCors(
    "AllowReact"
);


// =====================================================
// NORMAL STATIC FILES
//
// Used for files bundled inside wwwroot.
// =====================================================

app.UseStaticFiles();


// =====================================================
// SERVE PERSISTENT UPLOADS
//
// Example:
//
// https://backend-domain/uploads/doctors/image.jpg
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
// RATE LIMITING
// =====================================================

app.UseRateLimiter();


// =====================================================
// SIMPLE API HEALTH CHECK
//
// Open the backend URL in a browser.
//
// Example:
//
// https://your-app.azurewebsites.net/
// =====================================================

app.MapGet(
    "/",
    () =>
        Results.Ok(
            new
            {
                application =
                    "MediGo API",

                status =
                    "running"
            }
        )
);


// =====================================================
// CONTROLLERS
// =====================================================

app.MapControllers();


// =====================================================
// RUN SERVER
// =====================================================

app.Run();


// =====================================================
// COPY EXISTING FILES
//
// Used to copy existing local/bundled demo images into
// Azure's writable persistent upload folder.
//
// Existing destination files are NOT overwritten.
// =====================================================

static void CopyMissingFiles(
    string sourceDirectory,
    string destinationDirectory
)
{
    if (
        !Directory.Exists(
            sourceDirectory
        )
    )
    {
        return;
    }


    Directory.CreateDirectory(
        destinationDirectory
    );


    // =================================================
    // CREATE SUBDIRECTORIES
    // =================================================

    foreach (
        var directory
        in Directory.GetDirectories(
            sourceDirectory,
            "*",
            SearchOption.AllDirectories
        )
    )
    {
        var relativePath =
            Path.GetRelativePath(
                sourceDirectory,
                directory
            );


        var destinationPath =
            Path.Combine(
                destinationDirectory,
                relativePath
            );


        Directory.CreateDirectory(
            destinationPath
        );
    }


    // =================================================
    // COPY FILES THAT DO NOT ALREADY EXIST
    // =================================================

    foreach (
        var file
        in Directory.GetFiles(
            sourceDirectory,
            "*",
            SearchOption.AllDirectories
        )
    )
    {
        var relativePath =
            Path.GetRelativePath(
                sourceDirectory,
                file
            );


        var destinationFile =
            Path.Combine(
                destinationDirectory,
                relativePath
            );


        var destinationParent =
            Path.GetDirectoryName(
                destinationFile
            );


        if (
            !string.IsNullOrWhiteSpace(
                destinationParent
            )
        )
        {
            Directory.CreateDirectory(
                destinationParent
            );
        }


        if (
            !File.Exists(
                destinationFile
            )
        )
        {
            File.Copy(
                file,
                destinationFile
            );
        }
    }
}