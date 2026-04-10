//backend/infrastructure/identity/JwtTokenService.cs : 
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FlightSearch.API.Domain.Entities;
using Microsoft.IdentityModel.Tokens;

namespace FlightSearch.API.Infrastructure.Identity;

/// <summary>
/// Service for generating and validating JWT tokens
/// </summary>
public class JwtTokenService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<JwtTokenService> _logger;

    public JwtTokenService(IConfiguration configuration, ILogger<JwtTokenService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public string GenerateToken(User user, IEnumerable<string> roles)
    {
        var secretKey = _configuration["Jwt:Secret"] ?? _configuration["Jwt:SecretKey"] ?? "your-super-secret-key-change-in-production-min-32-chars";
        var issuer = _configuration["Jwt:Issuer"] ?? "FlightSearchAPI";
        var audience = _configuration["Jwt:Audience"] ?? "FlightSearchClient";
        var expirationHours = int.Parse(_configuration["Jwt:ExpirationHours"] ?? "24");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.GivenName, user.Name)
        };

        // Add roles to claims
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expirationHours),
            signingCredentials: credentials
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
        
        _logger.LogInformation("JWT token generated for user {Username}", user.Username);
        
        return tokenString;
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        try
        {
            var secretKey = _configuration["Jwt:Secret"] ?? _configuration["Jwt:SecretKey"] ?? "your-super-secret-key-change-in-production-min-32-chars";
            var issuer = _configuration["Jwt:Issuer"] ?? "FlightSearchAPI";
            var audience = _configuration["Jwt:Audience"] ?? "FlightSearchClient";

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = issuer,
                ValidAudience = audience,
                IssuerSigningKey = key,
                ClockSkew = TimeSpan.Zero
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
            return principal;
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Token validation failed: {Message}", ex.Message);
            return null;
        }
    }

    public int? GetUserIdFromToken(string token)
    {
        var principal = ValidateToken(token);
        if (principal == null) return null;

        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
        {
            return userId;
        }

        return null;
    }

    public DateTime GetTokenExpiration()
    {
        var expirationHours = int.Parse(_configuration["Jwt:ExpirationHours"] ?? "24");
        return DateTime.UtcNow.AddHours(expirationHours);
    }
}

