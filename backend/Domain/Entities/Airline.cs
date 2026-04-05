namespace FlightSearch.API.Domain.Entities;

/// <summary>
/// Airline entity
/// </summary>
public class Airline
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty; // IATA code (e.g., "UA", "AA")
    public string Name { get; set; } = string.Empty; // Full name
    public string? Country { get; set; }
    public string? LogoUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
