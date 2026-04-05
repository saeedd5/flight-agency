using FlightSearch.API.Application.DTOs.Auth;
using FlightSearch.API.Application.UseCases.Auth;
using Microsoft.AspNetCore.Mvc;

namespace FlightSearch.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly LoginUseCase _loginUseCase;
    private readonly ILogger<AuthController> _logger;

    public AuthController(LoginUseCase loginUseCase, ILogger<AuthController> logger)
    {
        _loginUseCase = loginUseCase;
        _logger = logger;
    }

    /// <summary>
    /// Login to system (sets httpOnly cookie for security)
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto request)
    {
        if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(new LoginResponseDto
            {
                Success = false,
                ErrorMessage = "Username and password are required"
            });
        }

        var result = await _loginUseCase.ExecuteAsync(request);

        if (!result.Success)
        {
            return Unauthorized(result);
        }

        // Set httpOnly cookie for security (prevents XSS attacks)
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true, // Cannot be accessed by JavaScript
            Secure = true, // Only sent over HTTPS (set to false for development if needed)
            SameSite = SameSiteMode.Strict, // CSRF protection
            Expires = DateTimeOffset.UtcNow.AddHours(24), // 24 hours expiry
            Path = "/"
        };

        Response.Cookies.Append("authToken", result.Token ?? string.Empty, cookieOptions);

        // Also return token in response for backward compatibility
        // Frontend can choose to use either cookie or localStorage
        return Ok(result);
    }

    /// <summary>
    /// Logout (clears httpOnly cookie)
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
        // Token is validated by JWT middleware
        // If we get here, token is valid
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var username = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
        var roles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { success = false, message = "Invalid token" });
        }

        return Ok(new
        {
            success = true,
            user = new
            {
                id = int.Parse(userId),
                username,
                roles
            }
        });
    }
}

