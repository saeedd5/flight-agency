//backend/Application/UseCases/Auth/RegisterUseCase.cs : 

using FlightSearch.API.Application.DTOs.Auth;
using FlightSearch.API.Domain.Entities;
using FlightSearch.API.Domain.Interfaces;
using FlightSearch.API.Infrastructure.Identity;

namespace FlightSearch.API.Application.UseCases.Auth;

public class RegisterUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly PasswordHasher _passwordHasher;
    private readonly JwtTokenService _jwtTokenService;

    public RegisterUseCase(IUserRepository userRepository, PasswordHasher passwordHasher, JwtTokenService jwtTokenService)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

public async Task<LoginResponseDto> ExecuteAsync(RegisterDto request)
    {
        try
        {
            var existingUsers = await _userRepository.GetAllAsync(1, 1000);
            if (existingUsers.Any(u => u.Phone == request.Phone))
            {
                return new LoginResponseDto { Success = false, ErrorMessage = "این شماره تلفن قبلاً ثبت شده است." };
            }

            bool isAgency = request.AccountType.ToLower() == "agency";
            string roleName = isAgency ? Role.Agency : Role.UserRole;
            
            bool isActive = !isAgency; 

            var user = new User
            {
                Name = request.Name,
                Phone = request.Phone,
                Username = request.Phone, 
                Email = $"{request.Phone}@temp.com", 
                PasswordHash = _passwordHasher.HashPassword(request.Password),
                IsActive = isActive, 
                CreatedAt = DateTime.UtcNow
            };

            var createdUser = await _userRepository.CreateAsync(user);
            await _userRepository.AddToRoleAsync(createdUser.Id, roleName);

            if (isAgency)
            {
                return new LoginResponseDto
                {
                    Success = true,
                    Token = null,
                    ErrorMessage = "pending_approval" 
                };
            }

            var roles = new List<string> { roleName };
            var token = _jwtTokenService.GenerateToken(createdUser, roles);

            return new LoginResponseDto
            {
                Success = true,
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                User = new UserInfo
                {
                    Id = createdUser.Id,
                    Name = createdUser.Name ?? "",
                    Phone = createdUser.Phone ?? "",
                    Username = createdUser.Username ?? "",
                    Email = createdUser.Email ?? "",
                    Roles = roles
                }
            };
        }
        catch (Exception ex)
        {
            return new LoginResponseDto { Success = false, ErrorMessage = "خطا در ثبت نام: " + ex.Message };
        }
    }
}