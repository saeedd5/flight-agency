//Domain/Interfaces/IUserRepository.cs : 
using FlightSearch.API.Domain.Entities;

namespace FlightSearch.API.Domain.Interfaces;

/// <summary>
/// Repository for managing users
/// </summary>
public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByPhoneAsync(string phone); // <--- این خط را اضافه کنید
    Task<User?> GetByEmailAsync(string email);
    Task<IEnumerable<User>> GetAllAsync(int page = 1, int pageSize = 10);
    Task<int> GetTotalCountAsync();
    Task<User> CreateAsync(User user);
    Task<User> UpdateAsync(User user);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsAsync(string username);
    Task<IEnumerable<string>> GetUserRolesAsync(int userId);
    Task AddToRoleAsync(int userId, string roleName);
    Task RemoveFromRoleAsync(int userId, string roleName);
}

