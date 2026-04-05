namespace FlightSearch.API.Domain.Entities;

/// <summary>
/// System settings
/// </summary>
public class Setting
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Common setting keys
    public const string SiteName = "SiteName";
    public const string DefaultCurrency = "DefaultCurrency";
    public const string MaintenanceMode = "MaintenanceMode";
    public const string MaxSearchResults = "MaxSearchResults";
    public const string BookingEnabled = "BookingEnabled";
}

