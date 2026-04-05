using FlightSearch.API.Application.DTOs;
using FlightSearch.API.Application.UseCases;
using Microsoft.AspNetCore.Mvc;

namespace FlightSearch.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FlightController : ControllerBase
{
    private readonly SearchFlightsUseCase _searchFlightsUseCase;
    private readonly ILogger<FlightController> _logger;

    public FlightController(
        SearchFlightsUseCase searchFlightsUseCase,
        ILogger<FlightController> logger)
    {
        _searchFlightsUseCase = searchFlightsUseCase;
        _logger = logger;
    }

    [HttpPost("search")]
    public async Task<ActionResult<FlightSearchResponseDto>> SearchFlights(
        [FromBody] FlightSearchRequestDto? request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (request == null)
            {
                return BadRequest(new FlightSearchResponseDto
                {
                    Success = false,
                    ErrorMessage = "Invalid request body. Expected JSON with Origin, Destination, DepartureDate."
                });
            }

            // Normalize DepartureDate - handle date-only string or default
            if (request.DepartureDate == default || request.DepartureDate.Date.Year < 2000)
            {
                request.DepartureDate = DateTime.Today.AddDays(1);
            }

            // Use Case handles all validation and business logic
            var result = await _searchFlightsUseCase.ExecuteAsync(request, cancellationToken);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in SearchFlights endpoint");
            var errorMessage = "Internal server error";
#if DEBUG
            errorMessage = ex.Message;
#endif
            return StatusCode(500, new FlightSearchResponseDto
            {
                Success = false,
                ErrorMessage = errorMessage
            });
        }
    }

    [HttpGet("all")]
    public async Task<ActionResult<FlightSearchResponseDto>> GetAllFlights(
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Create a default search request
            var defaultRequest = new FlightSearchRequestDto
            {
                Origin = "ORD",
                Destination = "ATL",
                DepartureDate = DateTime.Today.AddDays(1),
                AdultCount = 1
            };

            var result = await _searchFlightsUseCase.ExecuteAsync(defaultRequest, cancellationToken);

            if (!result.Success)
            {
                return StatusCode(500, result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetAllFlights endpoint");
            return StatusCode(500, new FlightSearchResponseDto
            {
                Success = false,
                ErrorMessage = "Internal server error"
            });
        }
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
    }
}
