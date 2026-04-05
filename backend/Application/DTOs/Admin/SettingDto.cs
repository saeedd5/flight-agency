namespace FlightSearch.API.Application.DTOs.Admin;

/// <summary>
/// DTO for displaying settings
/// </summary>
public class SettingDto
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO for updating settings
/// </summary>
public class UpdateSettingDto
{
    public string Value { get; set; } = string.Empty;
}

/// <summary>
/// DTO for creating new settings
/// </summary>
public class CreateSettingDto
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
}

