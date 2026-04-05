namespace FlightSearch.API.Application.DTOs.Admin;

/// <summary>
/// DTO for dashboard statistics
/// </summary>
public class DashboardStatsDto
{
    // Users
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    
    // Bookings
    public int TotalBookings { get; set; }
    public int PendingBookings { get; set; }
    public int ConfirmedBookings { get; set; }
    public int CancelledBookings { get; set; }
    public decimal TotalRevenue { get; set; }
    
    // Searches
    public int TotalSearches { get; set; }
    public int TodaySearches { get; set; }
    
    // Recent activities
    public List<BookingDto> RecentBookings { get; set; } = new();
    public List<SearchLogDto> RecentSearches { get; set; } = new();
    
    // Top routes
    public Dictionary<string, int> TopRoutes { get; set; } = new();
    
    // Daily search statistics (for chart)
    public Dictionary<string, int> SearchesByDay { get; set; } = new();
}

