namespace FlightSearch.API.Domain.Entities;

/// <summary>
/// Flight search log
/// </summary>
public class SearchLog
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string? IpAddress { get; set; }
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime DepartureDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public int AdultCount { get; set; } = 1;
    public int ChildCount { get; set; } = 0;
    public int InfantCount { get; set; } = 0;
    public int ResultCount { get; set; }
    public int ResponseTimeMs { get; set; }
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime SearchDate { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User? User { get; set; }
}

