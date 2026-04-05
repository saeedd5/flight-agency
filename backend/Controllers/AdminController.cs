using FlightSearch.API.Application.DTOs.Admin;
using FlightSearch.API.Application.UseCases.Admin;
using FlightSearch.API.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlightSearch.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly GetDashboardStatsUseCase _getDashboardStatsUseCase;
    private readonly GetUsersUseCase _getUsersUseCase;
    private readonly CreateUserUseCase _createUserUseCase;
    private readonly UpdateUserUseCase _updateUserUseCase;
    private readonly DeleteUserUseCase _deleteUserUseCase;
    private readonly GetBookingsUseCase _getBookingsUseCase;
    private readonly CreateBookingUseCase _createBookingUseCase;
    private readonly UpdateBookingStatusUseCase _updateBookingStatusUseCase;
    private readonly GetSearchLogsUseCase _getSearchLogsUseCase;
    private readonly GetSettingsUseCase _getSettingsUseCase;
    private readonly UpdateSettingUseCase _updateSettingUseCase;
    private readonly GetAirlinesUseCase _getAirlinesUseCase;
    private readonly CreateAirlineUseCase _createAirlineUseCase;
    private readonly UpdateAirlineUseCase _updateAirlineUseCase;
    private readonly DeleteAirlineUseCase _deleteAirlineUseCase;
    private readonly ILogger<AdminController> _logger;

    public AdminController(
        GetDashboardStatsUseCase getDashboardStatsUseCase,
        GetUsersUseCase getUsersUseCase,
        CreateUserUseCase createUserUseCase,
        UpdateUserUseCase updateUserUseCase,
        DeleteUserUseCase deleteUserUseCase,
        GetBookingsUseCase getBookingsUseCase,
        CreateBookingUseCase createBookingUseCase,
        UpdateBookingStatusUseCase updateBookingStatusUseCase,
        GetSearchLogsUseCase getSearchLogsUseCase,
        GetSettingsUseCase getSettingsUseCase,
        UpdateSettingUseCase updateSettingUseCase,
        GetAirlinesUseCase getAirlinesUseCase,
        CreateAirlineUseCase createAirlineUseCase,
        UpdateAirlineUseCase updateAirlineUseCase,
        DeleteAirlineUseCase deleteAirlineUseCase,
        ILogger<AdminController> logger)
    {
        _getDashboardStatsUseCase = getDashboardStatsUseCase;
        _getUsersUseCase = getUsersUseCase;
        _createUserUseCase = createUserUseCase;
        _updateUserUseCase = updateUserUseCase;
        _deleteUserUseCase = deleteUserUseCase;
        _getBookingsUseCase = getBookingsUseCase;
        _createBookingUseCase = createBookingUseCase;
        _updateBookingStatusUseCase = updateBookingStatusUseCase;
        _getSearchLogsUseCase = getSearchLogsUseCase;
        _getSettingsUseCase = getSettingsUseCase;
        _updateSettingUseCase = updateSettingUseCase;
        _getAirlinesUseCase = getAirlinesUseCase;
        _createAirlineUseCase = createAirlineUseCase;
        _updateAirlineUseCase = updateAirlineUseCase;
        _deleteAirlineUseCase = deleteAirlineUseCase;
        _logger = logger;
    }

    #region Dashboard

    /// <summary>
    /// Get dashboard statistics
    /// </summary>
    [HttpGet("dashboard/stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
    {
        try
        {
            var stats = await _getDashboardStatsUseCase.ExecuteAsync();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dashboard stats");
            return StatusCode(500, new { error = "Error getting statistics" });
        }
    }

    #endregion

    #region Users

    /// <summary>
    /// Get list of users
    /// </summary>
    [HttpGet("users")]
    public async Task<ActionResult<UserListResponseDto>> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _getUsersUseCase.ExecuteAsync(page, pageSize);
        return Ok(result);
    }

    /// <summary>
    /// Create new user
    /// </summary>
    [HttpPost("users")]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto request)
    {
        if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(new { error = "All fields are required" });
        }

        var (success, user, error) = await _createUserUseCase.ExecuteAsync(request);

        if (!success)
        {
            return BadRequest(new { error });
        }

        return CreatedAtAction(nameof(GetUsers), new { id = user!.Id }, user);
    }

    /// <summary>
    /// Update user
    /// </summary>
    [HttpPut("users/{id}")]
    public async Task<ActionResult<UserDto>> UpdateUser(int id, [FromBody] UpdateUserDto request)
    {
        var (success, user, error) = await _updateUserUseCase.ExecuteAsync(id, request);

        if (!success)
        {
            return BadRequest(new { error });
        }

        return Ok(user);
    }

    /// <summary>
    /// Delete user
    /// </summary>
    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var (success, error) = await _deleteUserUseCase.ExecuteAsync(id);

        if (!success)
        {
            return BadRequest(new { error });
        }

        return NoContent();
    }

    #endregion

    #region Bookings

    /// <summary>
    /// Get list of bookings
    /// </summary>
    [HttpGet("bookings")]
    public async Task<ActionResult<BookingListResponseDto>> GetBookings(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10,
        [FromQuery] BookingStatus? status = null)
    {
        var result = await _getBookingsUseCase.ExecuteAsync(page, pageSize, status);
        return Ok(result);
    }

    /// <summary>
    /// Create new booking
    /// </summary>
    [HttpPost("bookings")]
    public async Task<ActionResult<BookingDto>> CreateBooking([FromBody] CreateBookingDto request)
    {
        var (success, booking, error) = await _createBookingUseCase.ExecuteAsync(request);

        if (!success)
        {
            return BadRequest(new { error });
        }

        return CreatedAtAction(nameof(GetBookings), new { id = booking!.Id }, booking);
    }

    /// <summary>
    /// Update booking status
    /// </summary>
    [HttpPut("bookings/{id}/status")]
    public async Task<ActionResult<BookingDto>> UpdateBookingStatus(int id, [FromBody] UpdateBookingStatusDto request)
    {
        var (success, booking, error) = await _updateBookingStatusUseCase.ExecuteAsync(id, request);

        if (!success)
        {
            return BadRequest(new { error });
        }

        return Ok(booking);
    }

    #endregion

    #region Search Logs

    /// <summary>
    /// Get search logs
    /// </summary>
    [HttpGet("logs")]
    public async Task<ActionResult<SearchLogListResponseDto>> GetSearchLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _getSearchLogsUseCase.ExecuteAsync(page, pageSize);
        return Ok(result);
    }

    #endregion

    #region Settings

    /// <summary>
    /// Get settings
    /// </summary>
    [HttpGet("settings")]
    public async Task<ActionResult<List<SettingDto>>> GetSettings()
    {
        var settings = await _getSettingsUseCase.ExecuteAsync();
        return Ok(settings);
    }

    /// <summary>
    /// Get setting by key
    /// </summary>
    [HttpGet("settings/{key}")]
    public async Task<ActionResult<SettingDto>> GetSetting(string key)
    {
        var setting = await _getSettingsUseCase.GetByKeyAsync(key);
        
        if (setting == null)
        {
            return NotFound(new { error = "Setting not found" });
        }

        return Ok(setting);
    }

    /// <summary>
    /// Update setting
    /// </summary>
    [HttpPut("settings/{key}")]
    public async Task<ActionResult<SettingDto>> UpdateSetting(string key, [FromBody] UpdateSettingDto request)
    {
        var (success, setting, error) = await _updateSettingUseCase.ExecuteAsync(key, request);

        if (!success)
        {
            return BadRequest(new { error });
        }

        return Ok(setting);
    }

    #endregion

    #region Airlines

    /// <summary>
    /// Get list of airlines
    /// </summary>
    [HttpGet("airlines")]
    public async Task<ActionResult<AirlineListResponseDto>> GetAirlines([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var result = await _getAirlinesUseCase.ExecuteAsync(page, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting airlines");
            return StatusCode(500, new { error = "Error getting airlines" });
        }
    }

    /// <summary>
    /// Create new airline
    /// </summary>
    [HttpPost("airlines")]
    public async Task<ActionResult<AirlineDto>> CreateAirline([FromBody] CreateAirlineDto request)
    {
        if (string.IsNullOrEmpty(request.Code) || string.IsNullOrEmpty(request.Name))
        {
            return BadRequest(new { error = "Code and Name are required" });
        }

        try
        {
            var airline = await _createAirlineUseCase.ExecuteAsync(request);
            return CreatedAtAction(nameof(GetAirlines), new { id = airline.Id }, airline);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating airline");
            return StatusCode(500, new { error = "Error creating airline" });
        }
    }

    /// <summary>
    /// Update airline
    /// </summary>
    [HttpPut("airlines/{id}")]
    public async Task<ActionResult<AirlineDto>> UpdateAirline(int id, [FromBody] UpdateAirlineDto request)
    {
        try
        {
            var airline = await _updateAirlineUseCase.ExecuteAsync(id, request);
            return Ok(airline);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating airline");
            return StatusCode(500, new { error = "Error updating airline" });
        }
    }

    /// <summary>
    /// Delete airline
    /// </summary>
    [HttpDelete("airlines/{id}")]
    public async Task<IActionResult> DeleteAirline(int id)
    {
        try
        {
            var result = await _deleteAirlineUseCase.ExecuteAsync(id);
            if (result)
            {
                return NoContent();
            }
            return NotFound(new { error = "Airline not found" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting airline");
            return StatusCode(500, new { error = "Error deleting airline" });
        }
    }

    #endregion
}

