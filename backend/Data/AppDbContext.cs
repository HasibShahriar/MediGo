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


        public DbSet<ContactMessage> ContactMessages { get; set; }

        public DbSet<Medicine> Medicines { get; set; }
        public DbSet<CartItem> CartItems { get; set; }

        public DbSet<Order> Orders { get; set; }

        public DbSet<OrderItem> OrderItems { get; set; }

        public DbSet<Payment> Payments { get; set; }

        public DbSet<AppointmentRequest> AppointmentRequests { get; set; }

        public DbSet<AppointmentPayment> AppointmentPayments { get; set; }
        
    }
}