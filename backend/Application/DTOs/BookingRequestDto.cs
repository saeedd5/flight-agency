namespace FlightSearch.API.Application.DTOs;

/// <summary>
/// DTO for flight booking request
/// </summary>
public class BookingRequestDto
{
    /// <summary>
    /// Flight Key from search results (AirPricingSolution Key)
    /// </summary>
    public string FlightKey { get; set; } = string.Empty;
    
    /// <summary>
    /// Passenger information
    /// </summary>
    public List<PassengerDto> Passengers { get; set; } = new();
    
    /// <summary>
    /// Payment information
    /// </summary>
    public PaymentDto? Payment { get; set; }
    
    /// <summary>
    /// Contact information
    /// </summary>
    public ContactDto? Contact { get; set; }
}

public class PassengerDto
{
    public string Title { get; set; } = "Mr"; // Mr, Mrs, Ms, Miss
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string TravelerType { get; set; } = "ADT"; // ADT, CNN, INF
    public int? Age { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? PassportNumber { get; set; }
    public string? PassportCountry { get; set; }
    public DateTime? PassportExpiryDate { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
}

public class PaymentDto
{
    public string Type { get; set; } = "Credit"; // Credit, Cash, Check
    public string? CardType { get; set; } // CA, VI, AX, etc.
    public string? CardNumber { get; set; }
    public string? ExpiryDate { get; set; } // Format: YYYY-MM
    public string? CardHolderName { get; set; }
    public string? CVV { get; set; }
    public AddressDto? BillingAddress { get; set; }
}

public class ContactDto
{
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public AddressDto? Address { get; set; }
}

public class AddressDto
{
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
}

