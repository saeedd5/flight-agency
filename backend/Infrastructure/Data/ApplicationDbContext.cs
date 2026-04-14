//backend/Domain/Entities/ApplicationDbContext.cs


using FlightSearch.API.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlightSearch.API.Infrastructure.Data;

/// <summary>
/// Main application DbContext with SQLite
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<SearchLog> SearchLogs => Set<SearchLog>();
    public DbSet<Setting> Settings => Set<Setting>();
    public DbSet<Airline> Airlines => Set<Airline>();
    public DbSet<AgencyFlight> AgencyFlights => Set<AgencyFlight>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // در داخل متد OnModelCreating ، این بخش را جایگزین کنید:
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Phone).IsUnique(); // شماره تلفن باید یکتا باشد
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Phone).IsRequired().HasMaxLength(20);
            entity.Property(e => e.PasswordHash).IsRequired();
        });





            // AgencyFlight configuration
            modelBuilder.Entity<AgencyFlight>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Agency)
                    .WithMany() // یک یوزر میتواند چندین پرواز ذخیره کند
                    .HasForeignKey(e => e.AgencyId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.Property(e => e.RawFlightData).HasColumnType("TEXT");
                 entity.HasIndex(e => new { e.Origin, e.Destination, e.DepartureTime });


            });



        // Role configuration
        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
        });

        // UserRole configuration (Many-to-Many)
        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.RoleId });

            entity.HasOne(e => e.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Booking configuration
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FlightKey).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PassengerName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PassengerEmail).IsRequired().HasMaxLength(100);
            entity.Property(e => e.TotalPrice).HasPrecision(18, 2);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // SearchLog configuration
        modelBuilder.Entity<SearchLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Origin).IsRequired().HasMaxLength(10);
            entity.Property(e => e.Destination).IsRequired().HasMaxLength(10);
            entity.HasIndex(e => e.SearchDate);

            entity.HasOne(e => e.User)
                .WithMany(u => u.SearchLogs)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Setting configuration
        modelBuilder.Entity<Setting>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Key).IsUnique();
            entity.Property(e => e.Key).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Value).IsRequired();
        });

        // Airline configuration
        modelBuilder.Entity<Airline>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Code).IsRequired().HasMaxLength(10);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Country).HasMaxLength(100);
            entity.Property(e => e.LogoUrl).HasMaxLength(500);
        });

        // Seed data
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Seed roles
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = Role.Admin, Description = "System administrator" },
            new Role { Id = 2, Name = Role.UserRole, Description = "Regular user" },
            new Role { Id = 3, Name = Role.Agency, Description = "Travel Agency" } // <--- این خط اضافه شد

        );

        // Note: Admin user is created in Program.cs at runtime with proper password hashing

        // Seed default settings
        modelBuilder.Entity<Setting>().HasData(
            new Setting { Id = 1, Key = Setting.SiteName, Value = "Flight Search Platform", Description = "Site name", Category = "General" },
            new Setting { Id = 2, Key = Setting.DefaultCurrency, Value = "USD", Description = "Default currency", Category = "General" },
            new Setting { Id = 3, Key = Setting.MaintenanceMode, Value = "false", Description = "Maintenance mode", Category = "System" },
            new Setting { Id = 4, Key = Setting.MaxSearchResults, Value = "100", Description = "Maximum search results", Category = "Search" },
            new Setting { Id = 5, Key = Setting.BookingEnabled, Value = "true", Description = "Booking enabled", Category = "Booking" },
            new Setting { Id = 6, Key = Setting.FlightMarkupPercentage, Value = "10", Description = "Flight Markup Percentage (%)", Category = "Pricing" }

        );
    }
}

