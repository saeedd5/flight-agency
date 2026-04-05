using FlightSearch.API.Domain.Entities;
using FlightSearch.API.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FlightSearch.API.Infrastructure.Data.Repositories;

/// <summary>
/// Booking repository implementation
/// </summary>
public class BookingRepository : IBookingRepository
{
    private readonly ApplicationDbContext _context;

    public BookingRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Booking?> GetByIdAsync(int id)
    {
        return await _context.Bookings
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<IEnumerable<Booking>> GetAllAsync(int page = 1, int pageSize = 10, BookingStatus? status = null)
    {
        var query = _context.Bookings
            .Include(b => b.User)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(b => b.Status == status.Value);
        }

        return await query
            .OrderByDescending(b => b.BookingDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<Booking>> GetByUserIdAsync(int userId)
    {
        return await _context.Bookings
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.BookingDate)
            .ToListAsync();
    }

    public async Task<int> GetTotalCountAsync(BookingStatus? status = null)
    {
        var query = _context.Bookings.AsQueryable();
        
        if (status.HasValue)
        {
            query = query.Where(b => b.Status == status.Value);
        }

        return await query.CountAsync();
    }

    public async Task<Booking> CreateAsync(Booking booking)
    {
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();
        return booking;
    }

    public async Task<Booking> UpdateAsync(Booking booking)
    {
        booking.UpdatedAt = DateTime.UtcNow;
        _context.Bookings.Update(booking);
        await _context.SaveChangesAsync();
        return booking;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null) return false;

        _context.Bookings.Remove(booking);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Booking>> GetRecentAsync(int count = 10)
    {
        return await _context.Bookings
            .Include(b => b.User)
            .OrderByDescending(b => b.BookingDate)
            .Take(count)
            .ToListAsync();
    }

    public async Task<decimal> GetTotalRevenueAsync(DateTime? fromDate = null, DateTime? toDate = null)
    {
        var query = _context.Bookings
            .Where(b => b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.Completed);

        if (fromDate.HasValue)
        {
            query = query.Where(b => b.BookingDate >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(b => b.BookingDate <= toDate.Value);
        }

        return await query.SumAsync(b => b.TotalPrice);
    }

    public async Task<Dictionary<BookingStatus, int>> GetStatusCountsAsync()
    {
        return await _context.Bookings
            .GroupBy(b => b.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Status, x => x.Count);
    }
}

