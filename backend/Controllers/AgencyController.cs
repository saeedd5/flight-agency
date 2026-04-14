using FlightSearch.API.Domain.Entities;
using FlightSearch.API.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json.Serialization;

namespace FlightSearch.API.Controllers;


public class SaveAgencyFlightDto
{
    [JsonPropertyName("flightKey")] public string FlightKey { get; set; } = string.Empty;
    [JsonPropertyName("airline")] public string Airline { get; set; } = string.Empty;
    [JsonPropertyName("flightNumber")] public string FlightNumber { get; set; } = string.Empty;
    [JsonPropertyName("origin")] public string Origin { get; set; } = string.Empty;
    [JsonPropertyName("destination")] public string Destination { get; set; } = string.Empty;
    [JsonPropertyName("departureTime")] public DateTime DepartureTime { get; set; }
    [JsonPropertyName("basePrice")] public decimal BasePrice { get; set; }
    [JsonPropertyName("markupPercentage")] public decimal MarkupPercentage { get; set; }
    [JsonPropertyName("finalPrice")] public decimal FinalPrice { get; set; }
    [JsonPropertyName("currency")] public string Currency { get; set; } = "USD";
    [JsonPropertyName("rawFlightData")] public string RawFlightData { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Agency")] 
public class AgencyController : ControllerBase
{
    private readonly ApplicationDbContext _context;


    public AgencyController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("flights")]
    public async Task<IActionResult> SaveFlight([FromBody] SaveAgencyFlightDto request)
    {
        try
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdStr, out int agencyId)) return Unauthorized();

            var agencyFlight = new AgencyFlight
            {
                AgencyId = agencyId,
                FlightKey = request.FlightKey,
                Airline = request.Airline,
                FlightNumber = request.FlightNumber,
                Origin = request.Origin,
                Destination = request.Destination,
                DepartureTime = request.DepartureTime,
                BasePrice = request.BasePrice,
                MarkupPercentage = request.MarkupPercentage,
                FinalPrice = request.FinalPrice,
                Currency = request.Currency,
                RawFlightData = request.RawFlightData,
                CreatedAt = DateTime.UtcNow
            };

            _context.AgencyFlights.Add(agencyFlight);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Flight saved" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpGet("my-flights")]
    public async Task<IActionResult> GetMyFlights()
    {
        try
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdStr, out int agencyId)) return Unauthorized();

            var flights = await _context.AgencyFlights
                .Where(f => f.AgencyId == agencyId)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new {
                    id = f.Id,
                    airline = f.Airline,
                    flightNumber = f.FlightNumber,
                    origin = f.Origin,
                    destination = f.Destination,
                    departureTime = f.DepartureTime,
                    basePrice = f.BasePrice,
                    markupPercentage = f.MarkupPercentage,
                    finalPrice = f.FinalPrice,
                    createdAt = f.CreatedAt
                })
                .ToListAsync();

            return Ok(new { success = true, flights });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }







[HttpGet("bookings")]
    public async Task<IActionResult> GetAgencyBookings()
    {
        try
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdStr, out int agencyId)) return Unauthorized();


            var agencyFlights = await _context.AgencyFlights
                .Where(f => f.AgencyId == agencyId)
                .ToDictionaryAsync(f => f.Id);


            var allAgencyBookings = await _context.Bookings
                .Where(b => b.FlightKey.StartsWith("agency-"))
                .OrderByDescending(b => b.BookingDate)
                .ToListAsync();

            var result = new List<object>();


            foreach (var b in allAgencyBookings)
            {
                var parts = b.FlightKey.Split('-');

                if (parts.Length >= 2 && int.TryParse(parts[1], out int fId))
                {
                    if (agencyFlights.TryGetValue(fId, out var flight))
                    {
                        result.Add(new {
                            id = b.Id,
                            passengerName = b.PassengerName,
                            passengerEmail = b.PassengerEmail,
                            totalPrice = b.TotalPrice,
                            bookingDate = b.BookingDate,
                            status = b.Status.ToString(),
                            flightRoute = $"{flight.Origin} ➔ {flight.Destination}",
                            flightNumber = $"{flight.Airline}{flight.FlightNumber}",
                            departureTime = flight.DepartureTime
                        });
                    }
                }
            }

            return Ok(new { success = true, bookings = result });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }



}