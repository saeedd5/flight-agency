//backend/Application/UseCases/Auth/LoginUseCase.cs : 
using FlightSearch.API.Application.DTOs.Auth;
using FlightSearch.API.Domain.Interfaces;
using FlightSearch.API.Infrastructure.Identity;
using Microsoft.Extensions.Logging;
using System.Linq; // اضافه شد

namespace FlightSearch.API.Application.UseCases.Auth;

/// <summary>
/// Use case for user login via Phone Number
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
            // ۱. ابتدا سعی می‌کنیم کاربر را مستقیماً با متد قدیمی پیدا کنیم (این برای Admin عالی است)
            var user = await _userRepository.GetByUsernameAsync(request.Phone); // دقت کنید: در کنترلر ما Phone را جایگزین Username کردیم

            // ۲. اگر پیدا نشد (یعنی کاربر عادی/آژانس است)، کل کاربران را می‌گیریم و با تلفن مقایسه می‌کنیم
            if (user == null)
            {
                var totalUsers = await _userRepository.GetTotalCountAsync();
                var allUsers = await _userRepository.GetAllAsync(1, totalUsers > 0 ? totalUsers : 1);
                
                // جستجوی دقیق: شماره تلفن با Phone برابر باشد یا با Username (چون ما شماره تلفن را در هر دو فیلد ذخیره می‌کنیم)
                user = allUsers.FirstOrDefault(u => 
                    u.Phone == request.Phone || 
                    u.Username == request.Phone || 
                    u.Email == request.Phone); 
            }
            
            // ۳. اگر باز هم پیدا نشد، ارور می‌دهیم
            if (user == null)
            {
                _logger.LogWarning("Login failed: User with identifier {Phone} not found", request.Phone);
                return new LoginResponseDto
                {
                    Success = false,
                    ErrorMessage = "نام کاربری یا رمز عبور اشتباه است" 
                };
            }


            // 3. بررسی رمز عبور
            if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
            {
                _logger.LogWarning("Login failed: Invalid password for user {Phone}", request.Phone);
                return new LoginResponseDto
                {
                    Success = false,
                    ErrorMessage = "شماره تلفن یا رمز عبور اشتباه است"
                };
            }

            if (!user.IsActive)
            {
                _logger.LogWarning("Login failed: User {Phone} is inactive", request.Phone);
                return new LoginResponseDto
                {
                    Success = false,
                    ErrorMessage = "حساب کاربری شما غیرفعال است یا هنوز توسط مدیریت تایید نشده است." // <--- تغییر پیام
                };
            }

            // 4. دریافت نقش‌ها و ساخت توکن
            var roles = await _userRepository.GetUserRolesAsync(user.Id);

            var token = _jwtTokenService.GenerateToken(user, roles);
            var expiresAt = _jwtTokenService.GetTokenExpiration();

            // 5. آپدیت زمان آخرین ورود
            user.LastLoginAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            _logger.LogInformation("User {Phone} logged in successfully", request.Phone);

            return new LoginResponseDto
            {
                Success = true,
                Token = token,
                ExpiresAt = expiresAt,
                User = new UserInfo
                {
                    Id = user.Id,
                    Name = user.Name ?? "", // این فیلد اضافه شد
                    Phone = user.Phone ?? "", // این فیلد اضافه شد
                    Username = user.Username ?? "",
                    Email = user.Email ?? "",
                    Roles = roles.ToList()
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for phone {Phone}", request.Phone);
            return new LoginResponseDto
            {
                Success = false,
                ErrorMessage = "خطایی در سیستم رخ داده است. لطفاً مجدداً تلاش کنید."
            };
        }
    }
}