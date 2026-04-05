using FlightSearch.API.Domain.Entities;

namespace FlightSearch.API.Domain.Interfaces;

/// <summary>
/// Repository for managing settings
/// </summary>
public interface ISettingRepository
{
    Task<Setting?> GetByKeyAsync(string key);
    Task<IEnumerable<Setting>> GetAllAsync();
    Task<IEnumerable<Setting>> GetByCategoryAsync(string category);
    Task<Setting> CreateAsync(Setting setting);
    Task<Setting> UpdateAsync(Setting setting);
    Task<bool> DeleteAsync(string key);
    Task<string?> GetValueAsync(string key);
    Task SetValueAsync(string key, string value);
}

