//flight-agancy/backend/Domain/interfaces/IAirlineRepository.cs

using FlightSearch.API.Domain.Entities;

namespace FlightSearch.API.Domain.Interfaces;

/// <summary>
/// Repository for managing airlines
/// </summary>
public interface IAirlineRepository
{
    Task<Airline?> GetByIdAsync(int id);
    Task<Airline?> GetByCodeAsync(string code);
    Task<IEnumerable<Airline>> GetAllAsync(int page = 1, int pageSize = 10);
    Task<int> GetTotalCountAsync();
    Task<Airline> CreateAsync(Airline airline);
    Task<Airline> UpdateAsync(Airline airline);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsAsync(string code);
}
