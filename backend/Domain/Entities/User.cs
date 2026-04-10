//backend/Domain/Entities/User.cs

namespace FlightSearch.API.Domain.Entities;

/// <summary>
/// System user
/// </summary>
public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty; // نام کاربر یا آژانس
    public string Phone { get; set; } = string.Empty; // شماره تلفن (برای لاگین)
    public string? ProfileImageUrl { get; set; } 

    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }

    // Navigation properties
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public virtual ICollection<SearchLog> SearchLogs { get; set; } = new List<SearchLog>();
}

