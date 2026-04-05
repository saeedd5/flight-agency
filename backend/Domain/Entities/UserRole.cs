namespace FlightSearch.API.Domain.Entities;

/// <summary>
/// Many-to-Many relationship between User and Role
/// </summary>
public class UserRole
{
    public int UserId { get; set; }
    public int RoleId { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Role Role { get; set; } = null!;
}

