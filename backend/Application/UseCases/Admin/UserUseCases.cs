//backend/Application/UseCases/Admin/UserUseCases.cs : 
using FlightSearch.API.Application.DTOs.Admin;
using FlightSearch.API.Domain.Entities;
using FlightSearch.API.Domain.Interfaces;
using FlightSearch.API.Infrastructure.Identity;

namespace FlightSearch.API.Application.UseCases.Admin;

/// <summary>
/// Use case for getting list of users
/// </summary>
public class GetUsersUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<GetUsersUseCase> _logger;

    public GetUsersUseCase(IUserRepository userRepository, ILogger<GetUsersUseCase> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<UserListResponseDto> ExecuteAsync(int page = 1, int pageSize = 10)
    {
        var users = await _userRepository.GetAllAsync(page, pageSize);
        var totalCount = await _userRepository.GetTotalCountAsync();

        return new UserListResponseDto
        {
            Users = users.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    private UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            IsActive = user.IsActive,
            Roles = user.UserRoles.Select(ur => ur.Role.Name).ToList(),
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }
}

/// <summary>
/// Use case for creating new user
/// </summary>
public class CreateUserUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly PasswordHasher _passwordHasher;
    private readonly ILogger<CreateUserUseCase> _logger;

    public CreateUserUseCase(
        IUserRepository userRepository,
        PasswordHasher passwordHasher,
        ILogger<CreateUserUseCase> logger)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    public async Task<(bool Success, UserDto? User, string? Error)> ExecuteAsync(CreateUserDto request)
    {
        try
        {
            // Check if username exists
            if (await _userRepository.ExistsAsync(request.Username))
            {
                return (false, null, "Username already exists");
            }

            // Check if email exists
            var existingEmail = await _userRepository.GetByEmailAsync(request.Email);
            if (existingEmail != null)
            {
                return (false, null, "Email already exists");
            }

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = _passwordHasher.HashPassword(request.Password),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.CreateAsync(user);

            // Add roles
            foreach (var role in request.Roles)
            {
                await _userRepository.AddToRoleAsync(user.Id, role);
            }

            // Reload user with roles
            user = await _userRepository.GetByIdAsync(user.Id);

            _logger.LogInformation("User {Username} created successfully", request.Username);

            return (true, MapToDto(user!), null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user {Username}", request.Username);
            return (false, null, "Error creating user");
        }
    }

    private UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            IsActive = user.IsActive,
            Roles = user.UserRoles.Select(ur => ur.Role.Name).ToList(),
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }
}

/// <summary>
/// Use case for updating user
/// </summary>
public class UpdateUserUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly PasswordHasher _passwordHasher;
    private readonly ILogger<UpdateUserUseCase> _logger;

    public UpdateUserUseCase(
        IUserRepository userRepository,
        PasswordHasher passwordHasher,
        ILogger<UpdateUserUseCase> logger)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    public async Task<(bool Success, UserDto? User, string? Error)> ExecuteAsync(int userId, UpdateUserDto request)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return (false, null, "User not found");
            }

            // Update fields if provided
            if (!string.IsNullOrEmpty(request.Username) && request.Username != user.Username)
            {
                if (await _userRepository.ExistsAsync(request.Username))
                {
                    return (false, null, "Username already exists");
                }
                user.Username = request.Username;
            }

            if (!string.IsNullOrEmpty(request.Email) && request.Email != user.Email)
            {
                var existingEmail = await _userRepository.GetByEmailAsync(request.Email);
                if (existingEmail != null && existingEmail.Id != userId)
                {
                    return (false, null, "Email already exists");
                }
                user.Email = request.Email;
            }

            if (!string.IsNullOrEmpty(request.Password))
            {
                user.PasswordHash = _passwordHasher.HashPassword(request.Password);
            }

            if (request.IsActive.HasValue)
            {
                user.IsActive = request.IsActive.Value;
            }

            await _userRepository.UpdateAsync(user);

            // Update roles if provided
            if (request.Roles != null)
            {
                var currentRoles = await _userRepository.GetUserRolesAsync(userId);
                
                // Remove roles not in request
                foreach (var role in currentRoles)
                {
                    if (!request.Roles.Contains(role))
                    {
                        await _userRepository.RemoveFromRoleAsync(userId, role);
                    }
                }

                // Add new roles
                foreach (var role in request.Roles)
                {
                    if (!currentRoles.Contains(role))
                    {
                        await _userRepository.AddToRoleAsync(userId, role);
                    }
                }
            }

            // Reload user with roles
            user = await _userRepository.GetByIdAsync(userId);

            _logger.LogInformation("User {Username} updated successfully", user!.Username);

            return (true, MapToDto(user), null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", userId);
            return (false, null, "Error updating user");
        }
    }

    private UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            IsActive = user.IsActive,
            Roles = user.UserRoles.Select(ur => ur.Role.Name).ToList(),
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }
}

/// <summary>
/// Use case for deleting user
/// </summary>
public class DeleteUserUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<DeleteUserUseCase> _logger;

    public DeleteUserUseCase(IUserRepository userRepository, ILogger<DeleteUserUseCase> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<(bool Success, string? Error)> ExecuteAsync(int userId)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return (false, "User not found");
            }

            // Prevent deleting the last admin
            var roles = await _userRepository.GetUserRolesAsync(userId);
            if (roles.Contains(Role.Admin))
            {
                // Check if this is the only admin
                var allUsers = await _userRepository.GetAllAsync(1, 1000);
                var adminCount = 0;
                foreach (var u in allUsers)
                {
                    var userRoles = await _userRepository.GetUserRolesAsync(u.Id);
                    if (userRoles.Contains(Role.Admin)) adminCount++;
                }

                if (adminCount <= 1)
                {
                    return (false, "Cannot delete the last admin");
                }
            }

            await _userRepository.DeleteAsync(userId);
            _logger.LogInformation("User {UserId} deleted successfully", userId);

            return (true, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", userId);
            return (false, "Error deleting user");
        }
    }
}

