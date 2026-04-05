using FlightSearch.API.Domain.Entities;
using FlightSearch.API.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FlightSearch.API.Infrastructure.Data.Repositories;

/// <summary>
/// Setting repository implementation
/// </summary>
public class SettingRepository : ISettingRepository
{
    private readonly ApplicationDbContext _context;

    public SettingRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Setting?> GetByKeyAsync(string key)
    {
        return await _context.Settings
            .FirstOrDefaultAsync(s => s.Key == key);
    }

    public async Task<IEnumerable<Setting>> GetAllAsync()
    {
        return await _context.Settings
            .OrderBy(s => s.Category)
            .ThenBy(s => s.Key)
            .ToListAsync();
    }

    public async Task<IEnumerable<Setting>> GetByCategoryAsync(string category)
    {
        return await _context.Settings
            .Where(s => s.Category == category)
            .OrderBy(s => s.Key)
            .ToListAsync();
    }

    public async Task<Setting> CreateAsync(Setting setting)
    {
        _context.Settings.Add(setting);
        await _context.SaveChangesAsync();
        return setting;
    }

    public async Task<Setting> UpdateAsync(Setting setting)
    {
        setting.UpdatedAt = DateTime.UtcNow;
        _context.Settings.Update(setting);
        await _context.SaveChangesAsync();
        return setting;
    }

    public async Task<bool> DeleteAsync(string key)
    {
        var setting = await _context.Settings.FirstOrDefaultAsync(s => s.Key == key);
        if (setting == null) return false;

        _context.Settings.Remove(setting);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<string?> GetValueAsync(string key)
    {
        var setting = await _context.Settings
            .FirstOrDefaultAsync(s => s.Key == key);
        return setting?.Value;
    }

    public async Task SetValueAsync(string key, string value)
    {
        var setting = await _context.Settings.FirstOrDefaultAsync(s => s.Key == key);
        
        if (setting != null)
        {
            setting.Value = value;
            setting.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
        else
        {
            _context.Settings.Add(new Setting
            {
                Key = key,
                Value = value,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();
        }
    }
}

