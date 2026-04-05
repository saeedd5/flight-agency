using FlightSearch.API.Application.DTOs.Admin;
using FlightSearch.API.Domain.Entities;
using FlightSearch.API.Domain.Interfaces;

namespace FlightSearch.API.Application.UseCases.Admin;

/// <summary>
/// Use case for getting list of bookings
/// </summary>
public class GetBookingsUseCase
{
    private readonly IBookingRepository _bookingRepository;
    private readonly ILogger<GetBookingsUseCase> _logger;

    public GetBookingsUseCase(IBookingRepository bookingRepository, ILogger<GetBookingsUseCase> logger)
    {
        _bookingRepository = bookingRepository;
        _logger = logger;
    }

    public async Task<BookingListResponseDto> ExecuteAsync(int page = 1, int pageSize = 10, BookingStatus? status = null)
    {
        var bookings = await _bookingRepository.GetAllAsync(page, pageSize, status);
        var totalCount = await _bookingRepository.GetTotalCountAsync(status);

        return new BookingListResponseDto
        {
            Bookings = bookings.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    private BookingDto MapToDto(Booking booking)
    {
        return new BookingDto
        {
            Id = booking.Id,
            UserId = booking.UserId,
            Username = booking.User?.Username,
            FlightKey = booking.FlightKey,
            PassengerName = booking.PassengerName,
            PassengerEmail = booking.PassengerEmail,
            PassengerPhone = booking.PassengerPhone,
            Origin = booking.Origin,
            Destination = booking.Destination,
            FlightDate = booking.FlightDate,
            Airline = booking.Airline,
            FlightNumber = booking.FlightNumber,
            TotalPrice = booking.TotalPrice,
            Currency = booking.Currency,
            Status = booking.Status.ToString(),
            BookingDate = booking.BookingDate,
            Notes = booking.Notes
        };
    }
}

/// <summary>
/// Use case for creating booking
/// </summary>
public class CreateBookingUseCase
{
    private readonly IBookingRepository _bookingRepository;
    private readonly ILogger<CreateBookingUseCase> _logger;

    public CreateBookingUseCase(IBookingRepository bookingRepository, ILogger<CreateBookingUseCase> logger)
    {
        _bookingRepository = bookingRepository;
        _logger = logger;
    }

    public async Task<(bool Success, BookingDto? Booking, string? Error)> ExecuteAsync(CreateBookingDto request, int? userId = null)
    {
        try
        {
            var booking = new Booking
            {
                UserId = userId,
                FlightKey = request.FlightKey,
                PassengerName = request.PassengerName,
                PassengerEmail = request.PassengerEmail,
                PassengerPhone = request.PassengerPhone,
                PassengerPassport = request.PassengerPassport,
                Origin = request.Origin,
                Destination = request.Destination,
                FlightDate = request.FlightDate,
                Airline = request.Airline,
                FlightNumber = request.FlightNumber,
                TotalPrice = request.TotalPrice,
                Currency = request.Currency,
                Status = BookingStatus.Pending,
                BookingDate = DateTime.UtcNow
            };

            await _bookingRepository.CreateAsync(booking);

            _logger.LogInformation("Booking {BookingId} created for {PassengerName}", booking.Id, request.PassengerName);

            return (true, MapToDto(booking), null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating booking for {PassengerName}", request.PassengerName);
            return (false, null, "Error creating booking");
        }
    }

    private BookingDto MapToDto(Booking booking)
    {
        return new BookingDto
        {
            Id = booking.Id,
            UserId = booking.UserId,
            FlightKey = booking.FlightKey,
            PassengerName = booking.PassengerName,
            PassengerEmail = booking.PassengerEmail,
            PassengerPhone = booking.PassengerPhone,
            Origin = booking.Origin,
            Destination = booking.Destination,
            FlightDate = booking.FlightDate,
            Airline = booking.Airline,
            FlightNumber = booking.FlightNumber,
            TotalPrice = booking.TotalPrice,
            Currency = booking.Currency,
            Status = booking.Status.ToString(),
            BookingDate = booking.BookingDate,
            Notes = booking.Notes
        };
    }
}

/// <summary>
/// Use case for updating booking status
/// </summary>
public class UpdateBookingStatusUseCase
{
    private readonly IBookingRepository _bookingRepository;
    private readonly ILogger<UpdateBookingStatusUseCase> _logger;

    public UpdateBookingStatusUseCase(IBookingRepository bookingRepository, ILogger<UpdateBookingStatusUseCase> logger)
    {
        _bookingRepository = bookingRepository;
        _logger = logger;
    }

    public async Task<(bool Success, BookingDto? Booking, string? Error)> ExecuteAsync(int bookingId, UpdateBookingStatusDto request)
    {
        try
        {
            var booking = await _bookingRepository.GetByIdAsync(bookingId);
            if (booking == null)
            {
                return (false, null, "Booking not found");
            }

            booking.Status = request.Status;
            if (!string.IsNullOrEmpty(request.Notes))
            {
                booking.Notes = request.Notes;
            }

            await _bookingRepository.UpdateAsync(booking);

            _logger.LogInformation("Booking {BookingId} status updated to {Status}", bookingId, request.Status);

            return (true, MapToDto(booking), null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating booking {BookingId} status", bookingId);
            return (false, null, "Error updating booking status");
        }
    }

    private BookingDto MapToDto(Booking booking)
    {
        return new BookingDto
        {
            Id = booking.Id,
            UserId = booking.UserId,
            Username = booking.User?.Username,
            FlightKey = booking.FlightKey,
            PassengerName = booking.PassengerName,
            PassengerEmail = booking.PassengerEmail,
            PassengerPhone = booking.PassengerPhone,
            Origin = booking.Origin,
            Destination = booking.Destination,
            FlightDate = booking.FlightDate,
            Airline = booking.Airline,
            FlightNumber = booking.FlightNumber,
            TotalPrice = booking.TotalPrice,
            Currency = booking.Currency,
            Status = booking.Status.ToString(),
            BookingDate = booking.BookingDate,
            Notes = booking.Notes
        };
    }
}

