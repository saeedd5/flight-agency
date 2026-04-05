using FlightSearch.API.Domain.Entities;
using FlightSearch.API.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FlightSearch.API.Infrastructure.Data.Repositories;

/// <summary>
/// Search log repository implementation
/// </summary>
public class SearchLogRepository : ISearchLogRepository
{
    private readonly ApplicationDbContext _context;

    public SearchLogRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SearchLog> CreateAsync(SearchLog searchLog)
    {
        _context.SearchLogs.Add(searchLog);
        await _context.SaveChangesAsync();
        return searchLog;
    }

    public async Task<IEnumerable<SearchLog>> GetAllAsync(int page = 1, int pageSize = 10)
    {
        return await _context.SearchLogs
            .Include(s => s.User)
            .OrderByDescending(s => s.SearchDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<SearchLog>> GetByUserIdAsync(int userId)
    {
        return await _context.SearchLogs
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.SearchDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<SearchLog>> GetRecentAsync(int count = 10)
    {
        return await _context.SearchLogs
            .Include(s => s.User)
            .OrderByDescending(s => s.SearchDate)
            .Take(count)
            .ToListAsync();
    }

    public async Task<int> GetTotalCountAsync()
    {
        return await _context.SearchLogs.CountAsync();
    }

    public async Task<int> GetTodayCountAsync()
    {
        var today = DateTime.UtcNow.Date;
        return await _context.SearchLogs
            .Where(s => s.SearchDate.Date == today)
            .CountAsync();
    }

    public async Task<Dictionary<string, int>> GetTopRoutesAsync(int count = 10)
    {
        return await _context.SearchLogs
            .GroupBy(s => $"{s.Origin}-{s.Destination}")
            .Select(g => new { Route = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(count)
            .ToDictionaryAsync(x => x.Route, x => x.Count);
    }

    public async Task<Dictionary<DateTime, int>> GetSearchCountByDateAsync(int days = 7)
    {
        var startDate = DateTime.UtcNow.Date.AddDays(-days + 1);
        
        var data = await _context.SearchLogs
            .Where(s => s.SearchDate.Date >= startDate)
            .GroupBy(s => s.SearchDate.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .OrderBy(x => x.Date)
            .ToDictionaryAsync(x => x.Date, x => x.Count);

        return data;
    }
}

