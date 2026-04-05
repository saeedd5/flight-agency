namespace FlightSearch.API.Domain.Entities;

/// <summary>
/// Flight booking
/// </summary>
public class Booking
{
    public int Id { get; set; }
    public int? UserId { get; set; }
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
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public DateTime BookingDate { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? Notes { get; set; }

    // Navigation properties
    public virtual User? User { get; set; }
}

public enum BookingStatus
{
    Pending = 0,
    Confirmed = 1,
    Cancelled = 2,
    Completed = 3,
    Refunded = 4
}

