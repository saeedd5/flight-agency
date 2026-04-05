using FlightSearch.API.Application.DTOs.Admin;
using FlightSearch.API.Domain.Entities;
using FlightSearch.API.Domain.Interfaces;

namespace FlightSearch.API.Application.UseCases.Admin;

/// <summary>
/// Use case for getting dashboard statistics
/// </summary>
public class GetDashboardStatsUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly IBookingRepository _bookingRepository;
    private readonly ISearchLogRepository _searchLogRepository;
    private readonly ILogger<GetDashboardStatsUseCase> _logger;

    public GetDashboardStatsUseCase(
        IUserRepository userRepository,
        IBookingRepository bookingRepository,
        ISearchLogRepository searchLogRepository,
        ILogger<GetDashboardStatsUseCase> logger)
    {
        _userRepository = userRepository;
        _bookingRepository = bookingRepository;
        _searchLogRepository = searchLogRepository;
        _logger = logger;
    }

    public async Task<DashboardStatsDto> ExecuteAsync()
    {
        try
        {
            var stats = new DashboardStatsDto();

            // User stats
            stats.TotalUsers = await _userRepository.GetTotalCountAsync();
            // For now, ActiveUsers = TotalUsers (can be improved later with IsActive filter)
            stats.ActiveUsers = stats.TotalUsers;
            
            // Booking stats
            stats.TotalBookings = await _bookingRepository.GetTotalCountAsync();
            stats.PendingBookings = await _bookingRepository.GetTotalCountAsync(BookingStatus.Pending);
            stats.ConfirmedBookings = await _bookingRepository.GetTotalCountAsync(BookingStatus.Confirmed);
            stats.CancelledBookings = await _bookingRepository.GetTotalCountAsync(BookingStatus.Cancelled);
            stats.TotalRevenue = await _bookingRepository.GetTotalRevenueAsync();

            // Search stats
            stats.TotalSearches = await _searchLogRepository.GetTotalCountAsync();
            stats.TodaySearches = await _searchLogRepository.GetTodayCountAsync();

            // Recent activities
            var recentBookings = await _bookingRepository.GetRecentAsync(5);
            stats.RecentBookings = recentBookings.Select(MapBookingToDto).ToList();

            var recentSearches = await _searchLogRepository.GetRecentAsync(5);
            stats.RecentSearches = recentSearches.Select(MapSearchLogToDto).ToList();

            // Top routes
            stats.TopRoutes = await _searchLogRepository.GetTopRoutesAsync(5);

            // Searches by day (last 7 days)
            var searchesByDate = await _searchLogRepository.GetSearchCountByDateAsync(7);
            stats.SearchesByDay = searchesByDate
                .ToDictionary(
                    kvp => kvp.Key.ToString("yyyy-MM-dd"),
                    kvp => kvp.Value
                );

            return stats;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dashboard stats");
            throw;
        }
    }

    private BookingDto MapBookingToDto(Booking booking)
    {
        return new BookingDto
        {
            Id = booking.Id,
            UserId = booking.UserId,
            Username = booking.User?.Username,
            FlightKey = booking.FlightKey,
            PassengerName = booking.PassengerName,
            PassengerEmail = booking.PassengerEmail,
            PassengerPhone = booking.PassengerPhone,
            Origin = booking.Origin,
            Destination = booking.Destination,
            FlightDate = booking.FlightDate,
            Airline = booking.Airline,
            FlightNumber = booking.FlightNumber,
            TotalPrice = booking.TotalPrice,
            Currency = booking.Currency,
            Status = booking.Status.ToString(),
            BookingDate = booking.BookingDate,
            Notes = booking.Notes
        };
    }

    private SearchLogDto MapSearchLogToDto(SearchLog log)
    {
        return new SearchLogDto
        {
            Id = log.Id,
            UserId = log.UserId,
            Username = log.User?.Username,
            IpAddress = log.IpAddress,
            Origin = log.Origin,
            Destination = log.Destination,
            DepartureDate = log.DepartureDate,
            ReturnDate = log.ReturnDate,
            AdultCount = log.AdultCount,
            ChildCount = log.ChildCount,
            InfantCount = log.InfantCount,
            ResultCount = log.ResultCount,
            ResponseTimeMs = log.ResponseTimeMs,
            Success = log.Success,
            ErrorMessage = log.ErrorMessage,
            SearchDate = log.SearchDate
        };
    }
}

