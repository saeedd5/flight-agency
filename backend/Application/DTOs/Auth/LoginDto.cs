// namespace FlightSearch.API.Application.DTOs.Auth;

// /// <summary>
// /// DTO for login request
// /// </summary>

// public class LoginDto
// {
//     public string Phone { get; set; } = string.Empty; 
//     public string Password { get; set; } = string.Empty;
// }
// /// <summary>
// /// DTO for login response
// /// </summary>
// public class LoginResponseDto
// {
//     public bool Success { get; set; }
//     public string? Token { get; set; }
//     public DateTime? ExpiresAt { get; set; }
//     public UserInfo? User { get; set; }
//     public string? ErrorMessage { get; set; }
// }

// /// <summary>
// /// Logged in user information
// /// </summary>
// public class UserInfo
// {
//     public int Id { get; set; }
//     public string Username { get; set; } = string.Empty;
//     public string Email { get; set; } = string.Empty;
//     public List<string> Roles { get; set; } = new();
// }







//backend/Application/DTOs/Auth/LoginDto.cs : 
// File: backend/Application/DTOs/Auth/LoginDto.cs

using System.Collections.Generic;
using System.Text.Json.Serialization; 

namespace FlightSearch.API.Application.DTOs.Auth;

/// <summary>
/// DTO for login request
/// </summary>
public class LoginDto
{
    [JsonPropertyName("phone")]
    public string Phone { get; set; } = string.Empty;

    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;
}

/// <summary>
/// DTO for register request
/// </summary>
public class RegisterDto
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("phone")]
    public string Phone { get; set; } = string.Empty;

    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;
    
    [JsonPropertyName("accountType")]
    public string AccountType { get; set; } = "User"; // User or Agency
}

/// <summary>
/// DTO for login and register response
/// </summary>
public class LoginResponseDto
{
    public bool Success { get; set; }
    public string? Token { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public UserInfo? User { get; set; }
    public string? ErrorMessage { get; set; }
}

/// <summary>
/// Logged in user information
/// </summary>
public class UserInfo
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
}