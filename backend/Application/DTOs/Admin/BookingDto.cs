using FlightSearch.API.Domain.Entities;

namespace FlightSearch.API.Application.DTOs.Admin;

/// <summary>
/// DTO for displaying booking
/// </summary>
public class BookingDto
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string? Username { get; set; }
    public string FlightKey { get; set; } = string.Empty;
    public string PassengerName { get; set; } = string.Empty;
    public string PassengerEmail { get; set; } = string.Empty;
    public string? PassengerPhone { get; set; }
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime FlightDate { get; set; }
    public string? Airline { get; set; }
    public string? FlightNumber { get; set; }
    public decimal TotalPrice { get; set; }
    public string Currency { get; set; } = "USD";
    public string Status { get; set; } = string.Empty;
    public DateTime BookingDate { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for creating booking
/// </summary>
public class CreateBookingDto
{
    public string FlightKey { get; set; } = string.Empty;
    public string PassengerName { get; set; } = string.Empty;
    public string PassengerEmail { get; set; } = string.Empty;
    public string? PassengerPhone { get; set; }
    public string? PassengerPassport { get; set; }
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime FlightDate { get; set; }
    public string? Airline { get; set; }
    public string? FlightNumber { get; set; }
    public decimal TotalPrice { get; set; }
    public string Currency { get; set; } = "USD";
}

/// <summary>
/// DTO for updating booking status
/// </summary>
public class UpdateBookingStatusDto
{
    public BookingStatus Status { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for booking list with pagination
/// </summary>
public class BookingListResponseDto
{
    public List<BookingDto> Bookings { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}

