using FlightSearch.API.Application.DTOs.Admin;
using FlightSearch.API.Application.UseCases.Admin;
using Microsoft.AspNetCore.Mvc;

namespace FlightSearch.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingController : ControllerBase
{
    private readonly CreateBookingUseCase _createBookingUseCase;
    private readonly ILogger<BookingController> _logger;

    public BookingController(
        CreateBookingUseCase createBookingUseCase,
        ILogger<BookingController> logger)
    {
        _createBookingUseCase = createBookingUseCase;
        _logger = logger;
    }

    /// <summary>
    /// Create a new booking (public endpoint for users)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<BookingDto>> CreateBooking([FromBody] CreateBookingDto request)
    {
        try
        {
            var (success, booking, error) = await _createBookingUseCase.ExecuteAsync(request, userId: null);

            if (!success)
            {
                return BadRequest(new { error });
            }

            return Ok(booking);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating booking");
            return StatusCode(500, new { error = "Error creating booking" });
        }
    }
}
