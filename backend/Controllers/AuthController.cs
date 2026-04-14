// using FlightSearch.API.Application.DTOs.Auth;
// using FlightSearch.API.Application.UseCases.Auth;
// using Microsoft.AspNetCore.Mvc;

// namespace FlightSearch.API.Controllers;

// [ApiController]
// [Route("api/[controller]")]
// public class AuthController : ControllerBase
// {
//     private readonly LoginUseCase _loginUseCase;
//     private readonly ILogger<AuthController> _logger;

//     public AuthController(LoginUseCase loginUseCase, ILogger<AuthController> logger)
//     {
//         _loginUseCase = loginUseCase;
//         _logger = logger;
//     }

//     /// <summary>
//     /// Login to system (sets httpOnly cookie for security)
//     /// </summary>
//     [HttpPost("login")]
//     public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto request)
//     {
//         if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
//         {
//             return BadRequest(new LoginResponseDto
//             {
//                 Success = false,
//                 ErrorMessage = "Username and password are required"
//             });
//         }

//         var result = await _loginUseCase.ExecuteAsync(request);

//         if (!result.Success)
//         {
//             return Unauthorized(result);
//         }

//         // Set httpOnly cookie for security (prevents XSS attacks)
//         var cookieOptions = new CookieOptions
//         {
//             HttpOnly = true, // Cannot be accessed by JavaScript
//             Secure = true, // Only sent over HTTPS (set to false for development if needed)
//             SameSite = SameSiteMode.Strict, // CSRF protection
//             Expires = DateTimeOffset.UtcNow.AddHours(24), // 24 hours expiry
//             Path = "/"
//         };

//         Response.Cookies.Append("authToken", result.Token ?? string.Empty, cookieOptions);

//         // Also return token in response for backward compatibility
//         // Frontend can choose to use either cookie or localStorage
//         return Ok(result);
//     }

//     /// <summary>
//     /// Logout (clears httpOnly cookie)
//     /// </summary>
//     [HttpPost("logout")]
//     public IActionResult Logout()
//     {
//         Response.Cookies.Delete("authToken");
//         return Ok(new { success = true, message = "Logged out successfully" });
//     }

//     /// <summary>
//     /// Validate token
//     /// </summary>
//     [HttpGet("validate")]
//     public IActionResult ValidateToken()
//     {
//         // Token is validated by JWT middleware
//         // If we get here, token is valid
//         var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
//         var username = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
//         var roles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();

//         if (string.IsNullOrEmpty(userId))
//         {
//             return Unauthorized(new { success = false, message = "Invalid token" });
//         }

//         return Ok(new
//         {
//             success = true,
//             user = new
//             {
//                 id = int.Parse(userId),
//                 username,
//                 roles
//             }
//         });
//     }
// }












//backend/Controllers/AuthController.cs :
// using FlightSearch.API.Application.DTOs.Auth;
// using FlightSearch.API.Application.UseCases.Auth;
// using Microsoft.AspNetCore.Mvc;

// namespace FlightSearch.API.Controllers;

// [ApiController]
// [Route("api/[controller]")]
// public class AuthController : ControllerBase
// {
//     private readonly LoginUseCase _loginUseCase;
//     private readonly RegisterUseCase _registerUseCase;
//     private readonly ILogger<AuthController> _logger;

//     public AuthController(
//         LoginUseCase loginUseCase, 
//         RegisterUseCase registerUseCase,
//         ILogger<AuthController> logger)
//     {
//         _loginUseCase = loginUseCase;
//         _registerUseCase = registerUseCase;
//         _logger = logger;
//     }

//     /// <summary>
//     /// Login to system (sets httpOnly cookie for security)
//     /// </summary>
//     [HttpPost("login")]
//     public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto request)
//     {
//         // تغییر اعتبار سنجی از Username به Phone
//         if (string.IsNullOrEmpty(request.Phone) || string.IsNullOrEmpty(request.Password))
//         {
//             return BadRequest(new LoginResponseDto
//             {
//                 Success = false,
//                 ErrorMessage = "Phone number and password are required"
//             });
//         }

//         var result = await _loginUseCase.ExecuteAsync(request);

//         if (!result.Success)
//         {
//             return Unauthorized(result);
//         }

//         SetAuthCookie(result.Token);
//         return Ok(result);
//     }

//     /// <summary>
//     /// Register new user or agency
//     /// </summary>
//     [HttpPost("register")]
//     public async Task<ActionResult<LoginResponseDto>> Register([FromBody] RegisterDto request)
//     {
//         if (string.IsNullOrEmpty(request.Phone) || string.IsNullOrEmpty(request.Password) || string.IsNullOrEmpty(request.Name))
//         {
//             return BadRequest(new LoginResponseDto
//             {
//                 Success = false,
//                 ErrorMessage = "Name, Phone and password are required"
//             });
//         }

//         var result = await _registerUseCase.ExecuteAsync(request);

//         if (!result.Success)
//         {
//             return BadRequest(result);
//         }

//         SetAuthCookie(result.Token);
//         return Ok(result);
//     }

//     /// <summary>
//     /// Logout (clears httpOnly cookie)
//     /// </summary>
//     [HttpPost("logout")]
//     public IActionResult Logout()
//     {
//         Response.Cookies.Delete("authToken");
//         return Ok(new { success = true, message = "Logged out successfully" });
//     }

//     /// <summary>
//     /// Validate token
//     /// </summary>
//     [HttpGet("validate")]
//     public IActionResult ValidateToken()
//     {
//         var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
//         var username = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
//         var roles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();

//         if (string.IsNullOrEmpty(userId))
//         {
//             return Unauthorized(new { success = false, message = "Invalid token" });
//         }

//         return Ok(new
//         {
//             success = true,
//             user = new
//             {
//                 id = int.Parse(userId),
//                 username,
//                 roles
//             }
//         });
//     }

//     // متد کمکی برای جلوگیری از تکرار کدهای ساخت کوکی
//     private void SetAuthCookie(string? token)
//     {
//         var cookieOptions = new CookieOptions
//         {
//             HttpOnly = true,
//             Secure = true, // در محیط توسعه میتواند false باشد
//             SameSite = SameSiteMode.Strict,
//             Expires = DateTimeOffset.UtcNow.AddDays(7),
//             Path = "/"
//         };

//         Response.Cookies.Append("authToken", token ?? string.Empty, cookieOptions);
//     }





// }










using FlightSearch.API.Application.DTOs.Auth;
using FlightSearch.API.Application.UseCases.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FlightSearch.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly LoginUseCase _loginUseCase;
    private readonly RegisterUseCase _registerUseCase;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        LoginUseCase loginUseCase, 
        RegisterUseCase registerUseCase,
        ILogger<AuthController> logger)
    {
        _loginUseCase = loginUseCase;
        _registerUseCase = registerUseCase;
        _logger = logger;
    }

    /// <summary>
    /// Login to system
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto request)
    {
        if (string.IsNullOrEmpty(request.Phone) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(new LoginResponseDto { Success = false, ErrorMessage = "Phone and password required" });
        }

        var result = await _loginUseCase.ExecuteAsync(request);
        if (!result.Success) return Unauthorized(result);

        SetAuthCookie(result.Token);
        return Ok(result);
    }

    /// <summary>
    /// Register new user or agency
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<LoginResponseDto>> Register([FromBody] RegisterDto request)
    {
        if (string.IsNullOrEmpty(request.Phone) || string.IsNullOrEmpty(request.Password) || string.IsNullOrEmpty(request.Name))
        {
            return BadRequest(new LoginResponseDto { Success = false, ErrorMessage = "Name, Phone and password are required" });
        }

        var result = await _registerUseCase.ExecuteAsync(request);
        if (!result.Success) return BadRequest(result);

        SetAuthCookie(result.Token);
        return Ok(result);
    }

    /// <summary>
    /// Update profile (Name, Email, Image) - Supports multipart/form-data
    /// </summary>
    [HttpPut("profile")]
    [Authorize] 
    public async Task<IActionResult> UpdateProfile(
        [FromForm] UpdateProfileDto request, 
        [FromServices] FlightSearch.API.Domain.Interfaces.IUserRepository userRepository, 
        [FromServices] IWebHostEnvironment env)
    {
        try
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var user = await userRepository.GetByIdAsync(userId);
            if (user == null) return NotFound(new { message = "User not found" });

            if (!string.IsNullOrEmpty(request.Name)) user.Name = request.Name;
            if (!string.IsNullOrEmpty(request.Email)) user.Email = request.Email;


            if (request.ProfileImageFile != null && request.ProfileImageFile.Length > 0)
            {
                var fileName = $"profile_{userId}_{Guid.NewGuid()}{Path.GetExtension(request.ProfileImageFile.FileName)}";
                
                var uploadsFolder = Path.Combine(env.ContentRootPath, "wwwroot", "uploads");

                if (!Directory.Exists(uploadsFolder)) 
                    Directory.CreateDirectory(uploadsFolder);

                var filePath = Path.Combine(uploadsFolder, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.ProfileImageFile.CopyToAsync(stream);
                }

                user.ProfileImageUrl = $"/uploads/{fileName}";
            }

            await userRepository.UpdateAsync(user);
            var roles = await userRepository.GetUserRolesAsync(user.Id);

            return Ok(new {
                success = true,
                user = new {
                    id = user.Id,
                    name = user.Name,
                    phone = user.Phone,
                    username = user.Username,
                    email = user.Email,
                    roles = roles.ToList(),
                    profileImageUrl = user.ProfileImageUrl
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating profile for user {userId}", User.Identity?.Name);
            return StatusCode(500, new { success = false, message = "Profile update failed" });
        }
    }

    /// <summary>
    /// Logout (clears cookie)
    /// </summary>
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("authToken");
        return Ok(new { success = true, message = "Logged out successfully" });
    }

    /// <summary>
    /// Validate token
    /// </summary>
    [HttpGet("validate")]
    public IActionResult ValidateToken()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var username = User.FindFirst(ClaimTypes.Name)?.Value;
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

        if (string.IsNullOrEmpty(userId)) return Unauthorized(new { success = false });

        return Ok(new {
            success = true,
            user = new { id = int.Parse(userId), username, roles }
        });
    }

    private void SetAuthCookie(string? token)
    {
        if (string.IsNullOrEmpty(token)) return;

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true, 
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(7),
            Path = "/"
        };

        Response.Cookies.Append("authToken", token, cookieOptions);
    }
}