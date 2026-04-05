using FlightSearch.API.Application.DTOs.Auth;
using FlightSearch.API.Domain.Interfaces;
using FlightSearch.API.Infrastructure.Identity;

namespace FlightSearch.API.Application.UseCases.Auth;

/// <summary>
/// Use case for user login
/// </summary>
public class LoginUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly PasswordHasher _passwordHasher;
    private readonly JwtTokenService _jwtTokenService;
    private readonly ILogger<LoginUseCase> _logger;

    public LoginUseCase(
        IUserRepository userRepository,
        PasswordHasher passwordHasher,
        JwtTokenService jwtTokenService,
        ILogger<LoginUseCase> logger)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _logger = logger;
    }

    public async Task<LoginResponseDto> ExecuteAsync(LoginDto request)
    {
        try
        {
            // Find user by username
            var user = await _userRepository.GetByUsernameAsync(request.Username);
            
            if (user == null)
            {
                _logger.LogWarning("Login failed: User {Username} not found", request.Username);
                return new LoginResponseDto
                {
                    Success = false,
                    ErrorMessage = "Invalid username or password"
                };
            }

            // Check if user is active
            if (!user.IsActive)
            {
                _logger.LogWarning("Login failed: User {Username} is inactive", request.Username);
                return new LoginResponseDto
                {
                    Success = false,
                    ErrorMessage = "User account is inactive"
                };
            }

            // Verify password
            if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
            {
                _logger.LogWarning("Login failed: Invalid password for user {Username}", request.Username);
                return new LoginResponseDto
                {
                    Success = false,
                    ErrorMessage = "Invalid username or password"
                };
            }

            // Get user roles
            var roles = await _userRepository.GetUserRolesAsync(user.Id);

            // Generate JWT token
            var token = _jwtTokenService.GenerateToken(user, roles);
            var expiresAt = _jwtTokenService.GetTokenExpiration();

            // Update last login time
            user.LastLoginAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            _logger.LogInformation("User {Username} logged in successfully", request.Username);

            return new LoginResponseDto
            {
                Success = true,
                Token = token,
                ExpiresAt = expiresAt,
                User = new UserInfo
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    Roles = roles.ToList()
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for user {Username}", request.Username);
            return new LoginResponseDto
            {
                Success = false,
                ErrorMessage = "Error during login"
            };
        }
    }
}

