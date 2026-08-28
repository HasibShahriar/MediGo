using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(
            DbContextOptions<AppDbContext> options
        ) : base(options)
        {
        }

        public DbSet<Patient> Patients { get; set; }

        public DbSet<Doctor> Doctors { get; set; }

        public DbSet<DoctorRequest> DoctorRequests { get; set; }
        public DbSet<DoctorSetting> DoctorSettings { get; set; }
        public DbSet<Admin> Admins { get; set; }
    }
}