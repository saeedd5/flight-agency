using FlightSearch.API.Domain.Entities;
using FlightSearch.API.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FlightSearch.API.Infrastructure.Data.Repositories;

/// <summary>
/// Airline repository implementation
/// </summary>
public class AirlineRepository : IAirlineRepository
{
    private readonly ApplicationDbContext _context;

    public AirlineRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Airline?> GetByIdAsync(int id)
    {
        return await _context.Airlines.FindAsync(id);
    }

    public async Task<Airline?> GetByCodeAsync(string code)
    {
        return await _context.Airlines
            .FirstOrDefaultAsync(a => a.Code.ToUpper() == code.ToUpper());
    }

    public async Task<IEnumerable<Airline>> GetAllAsync(int page = 1, int pageSize = 10)
    {
        return await _context.Airlines
            .OrderBy(a => a.Code)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetTotalCountAsync()
    {
        return await _context.Airlines.CountAsync();
    }

    public async Task<Airline> CreateAsync(Airline airline)
    {
        _context.Airlines.Add(airline);
        await _context.SaveChangesAsync();
        return airline;
    }

    public async Task<Airline> UpdateAsync(Airline airline)
    {
        airline.UpdatedAt = DateTime.UtcNow;
        _context.Airlines.Update(airline);
        await _context.SaveChangesAsync();
        return airline;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var airline = await _context.Airlines.FindAsync(id);
        if (airline == null) return false;

        _context.Airlines.Remove(airline);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(string code)
    {
        return await _context.Airlines.AnyAsync(a => a.Code.ToUpper() == code.ToUpper());
    }
}
