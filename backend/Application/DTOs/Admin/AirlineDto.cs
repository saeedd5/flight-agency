namespace FlightSearch.API.Application.DTOs.Admin;

/// <summary>
/// DTO for displaying airline
/// </summary>
public class AirlineDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Country { get; set; }
    public string? LogoUrl { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for creating new airline
/// </summary>
public class CreateAirlineDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Country { get; set; }
    public string? LogoUrl { get; set; }
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// DTO for updating airline
/// </summary>
public class UpdateAirlineDto
{
    public string? Code { get; set; }
    public string? Name { get; set; }
    public string? Country { get; set; }
    public string? LogoUrl { get; set; }
    public bool? IsActive { get; set; }
}

/// <summary>
/// DTO for airline list with pagination
/// </summary>
public class AirlineListResponseDto
{
    public List<AirlineDto> Airlines { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}
