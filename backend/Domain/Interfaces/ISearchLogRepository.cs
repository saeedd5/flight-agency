using FlightSearch.API.Domain.Entities;

namespace FlightSearch.API.Domain.Interfaces;

/// <summary>
/// Repository for managing search logs
/// </summary>
public interface ISearchLogRepository
{
    Task<SearchLog> CreateAsync(SearchLog searchLog);
    Task<IEnumerable<SearchLog>> GetAllAsync(int page = 1, int pageSize = 10);
    Task<IEnumerable<SearchLog>> GetByUserIdAsync(int userId);
    Task<IEnumerable<SearchLog>> GetRecentAsync(int count = 10);
    Task<int> GetTotalCountAsync();
    Task<int> GetTodayCountAsync();
    Task<Dictionary<string, int>> GetTopRoutesAsync(int count = 10);
    Task<Dictionary<DateTime, int>> GetSearchCountByDateAsync(int days = 7);
}

