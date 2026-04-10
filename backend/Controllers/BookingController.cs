// using FlightSearch.API.Application.DTOs.Admin;
// using FlightSearch.API.Application.UseCases.Admin;
// using Microsoft.AspNetCore.Mvc;

// namespace FlightSearch.API.Controllers;

// [ApiController]
// [Route("api/[controller]")]
// public class BookingController : ControllerBase
// {
//     private readonly CreateBookingUseCase _createBookingUseCase;
//     private readonly ILogger<BookingController> _logger;

//     public BookingController(
//         CreateBookingUseCase createBookingUseCase,
//         ILogger<BookingController> logger)
//     {
//         _createBookingUseCase = createBookingUseCase;
//         _logger = logger;
//     }

//     /// <summary>
//     /// Create a new booking (public endpoint for users)
//     /// </summary>
//     [HttpPost]
//     public async Task<ActionResult<BookingDto>> CreateBooking([FromBody] CreateBookingDto request)
//     {
//         try
//         {
//             var (success, booking, error) = await _createBookingUseCase.ExecuteAsync(request, userId: null);

//             if (!success)
//             {
//                 return BadRequest(new { error });
//             }

//             return Ok(booking);
//         }
//         catch (Exception ex)
//         {
//             _logger.LogError(ex, "Error creating booking");
//             return StatusCode(500, new { error = "Error creating booking" });
//         }
//     }
// }





using FlightSearch.API.Domain.Entities;
using FlightSearch.API.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json.Serialization;

namespace FlightSearch.API.Controllers;

public class CreateUserBookingDto
{
    [JsonPropertyName("flightKey")] public string FlightKey { get; set; } = string.Empty;
    [JsonPropertyName("passengerName")] public string PassengerName { get; set; } = string.Empty;
    [JsonPropertyName("passengerEmail")] public string PassengerEmail { get; set; } = string.Empty;
    [JsonPropertyName("totalPrice")] public decimal TotalPrice { get; set; }
}

[ApiController]
[Route("api/[controller]")]
[Authorize] // تمام کاربران لاگین شده دسترسی دارند
public class BookingController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BookingController(ApplicationDbContext context)
    {
        _context = context;
    }

    // ثبت رزرو جدید توسط کاربر
    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateUserBookingDto request)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

        var booking = new Booking
        {
            UserId = userId,
            FlightKey = request.FlightKey,
            PassengerName = request.PassengerName,
            PassengerEmail = request.PassengerEmail,
            TotalPrice = request.TotalPrice,
            Status = BookingStatus.Confirmed, // مستقیماً تایید میشود
            BookingDate = DateTime.UtcNow
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Booking created successfully", bookingId = booking.Id });
    }

    // دریافت لیست رزروهای خود کاربر
    [HttpGet("my-bookings")]
    public async Task<IActionResult> GetMyBookings()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

        var bookings = await _context.Bookings
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.BookingDate)
            .Select(b => new {
                id = b.Id,
                flightKey = b.FlightKey,
                passengerName = b.PassengerName,
                totalPrice = b.TotalPrice,
                status = b.Status.ToString(),
                bookingDate = b.BookingDate
            })
            .ToListAsync();

        return Ok(new { success = true, bookings });
    }
}