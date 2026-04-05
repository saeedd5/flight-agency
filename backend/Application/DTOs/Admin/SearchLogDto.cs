namespace FlightSearch.API.Application.DTOs.Admin;

/// <summary>
/// DTO for displaying search log
/// </summary>
public class SearchLogDto
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string? Username { get; set; }
    public string? IpAddress { get; set; }
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime DepartureDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public int AdultCount { get; set; }
    public int ChildCount { get; set; }
    public int InfantCount { get; set; }
    public int ResultCount { get; set; }
    public int ResponseTimeMs { get; set; }
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime SearchDate { get; set; }
}

/// <summary>
/// DTO for search log list with pagination
/// </summary>
public class SearchLogListResponseDto
{
    public List<SearchLogDto> Logs { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}

