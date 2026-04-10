
//backend/Domain/Entities/Role.cs
namespace FlightSearch.API.Domain.Entities;

/// <summary>
/// User role (Admin, User)
/// </summary>
public class Role
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Navigation properties
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

    // Constants for role names
    public const string Admin = "Admin";
    public const string UserRole = "User";
    public const string Agency = "Agency";
}

