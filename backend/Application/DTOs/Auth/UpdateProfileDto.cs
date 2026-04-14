using Microsoft.AspNetCore.Http;
using System.Text.Json.Serialization;

namespace FlightSearch.API.Application.DTOs.Auth;


public class UpdateProfileDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public IFormFile? ProfileImageFile { get; set; }
}