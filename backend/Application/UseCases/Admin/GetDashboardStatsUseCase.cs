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
        var stats = new DashboardStatsDto();

        try
        {
            // User stats 
            stats.TotalUsers = await SafeExecuteAsync(() => _userRepository.GetTotalCountAsync(), 0);
            stats.ActiveUsers = stats.TotalUsers; 

            // Booking stats 
            stats.TotalBookings = await SafeExecuteAsync(() => _bookingRepository.GetTotalCountAsync(), 0);
            stats.PendingBookings = await SafeExecuteAsync(() => _bookingRepository.GetTotalCountAsync(BookingStatus.Pending), 0);
            stats.ConfirmedBookings = await SafeExecuteAsync(() => _bookingRepository.GetTotalCountAsync(BookingStatus.Confirmed), 0);
            stats.CancelledBookings = await SafeExecuteAsync(() => _bookingRepository.GetTotalCountAsync(BookingStatus.Cancelled), 0);
            stats.TotalRevenue = await SafeExecuteAsync(() => _bookingRepository.GetTotalRevenueAsync(), 0m);

            // Search stats 
            stats.TotalSearches = await SafeExecuteAsync(() => _searchLogRepository.GetTotalCountAsync(), 0);
            stats.TodaySearches = await SafeExecuteAsync(() => _searchLogRepository.GetTodayCountAsync(), 0);

            // Recent activities
            var recentBookings = await SafeExecuteAsync(() => _bookingRepository.GetRecentAsync(5), new List<Booking>());
            stats.RecentBookings = recentBookings.Select(MapBookingToDto).ToList();

            var recentSearches = await SafeExecuteAsync(() => _searchLogRepository.GetRecentAsync(5), new List<SearchLog>());
            stats.RecentSearches = recentSearches.Select(MapSearchLogToDto).ToList();

            // Top routes 
            stats.TopRoutes = await SafeExecuteAsync(() => _searchLogRepository.GetTopRoutesAsync(5), new Dictionary<string, int>());

            // Searches by day 
            var searchesByDate = await SafeExecuteAsync(() => _searchLogRepository.GetSearchCountByDateAsync(7), new Dictionary<DateTime, int>());
            stats.SearchesByDay = searchesByDate
                .ToDictionary(
                    kvp => kvp.Key.ToString("yyyy-MM-dd"),
                    kvp => kvp.Value
                );

            return stats;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Critical Error getting dashboard stats");

            return stats; 
        }
    }


    private async Task<T> SafeExecuteAsync<T>(Func<Task<T>> action, T defaultValue)
    {
        try
        {
            return await action();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error in partial dashboard stat query");
            return defaultValue; 
        }
    }

    private BookingDto MapBookingToDto(Booking booking)
    {
        return new BookingDto
        {
            Id = booking.Id,
            UserId = booking.UserId,
            Username = booking.User?.Name ?? booking.User?.Username, 
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
            Username = log.User?.Name ?? log.User?.Username,
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