using FlightSearch.API.Domain.Entities;

namespace FlightSearch.API.Domain.Interfaces;

/// <summary>
/// Repository for managing bookings
/// </summary>
public interface IBookingRepository
{
    Task<Booking?> GetByIdAsync(int id);
    Task<IEnumerable<Booking>> GetAllAsync(int page = 1, int pageSize = 10, BookingStatus? status = null);
    Task<IEnumerable<Booking>> GetByUserIdAsync(int userId);
    Task<int> GetTotalCountAsync(BookingStatus? status = null);
    Task<Booking> CreateAsync(Booking booking);
    Task<Booking> UpdateAsync(Booking booking);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<Booking>> GetRecentAsync(int count = 10);
    Task<decimal> GetTotalRevenueAsync(DateTime? fromDate = null, DateTime? toDate = null);
    Task<Dictionary<BookingStatus, int>> GetStatusCountsAsync();
}

