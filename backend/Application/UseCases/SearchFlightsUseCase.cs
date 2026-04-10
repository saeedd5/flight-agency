//backend/Application/UseCases/SearchFlightsUseCase.cs : 
using FlightSearch.API.Application.DTOs;
using FlightSearch.API.Domain.Entities;
using FlightSearch.API.Domain.Interfaces;
using FlightSearch.API.Infrastructure.Providers;

namespace FlightSearch.API.Application.UseCases;

/// <summary>
/// Use Case: Search Flights
/// Application layer - orchestrates domain and infrastructure
/// </summary>
public class SearchFlightsUseCase
{
    private readonly IFlightSearchProvider _flightSearchProvider;
    private readonly ILogger<SearchFlightsUseCase> _logger;

    public SearchFlightsUseCase(
        IFlightSearchProvider flightSearchProvider,
        ILogger<SearchFlightsUseCase> logger)
    {
        _flightSearchProvider = flightSearchProvider;
        _logger = logger;
    }

    /// <summary>
    /// Execute the search flights use case
    /// </summary>
    public async Task<FlightSearchResponseDto> ExecuteAsync(
        FlightSearchRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        
        try
        {
            _logger.LogInformation(
                "Searching flights: {Origin} -> {Destination} on {DepartureDate}",
                request.Origin, request.Destination, request.DepartureDate);

            // Convert DTO to Domain Entity (with validation)
            var criteria = new FlightSearchCriteria(
                origin: request.Origin,
                destination: request.Destination,
                departureDate: request.DepartureDate,
                returnDate: request.ReturnDate,
                adultCount: request.AdultCount,
                childAges: request.ChildAges,
                infantCount: request.InfantCount,
                preferredCarrier: request.PreferredCarrier
            );

            // Call domain service (provider)
            var flights = await _flightSearchProvider.SearchFlightsAsync(criteria, cancellationToken);

            // Note: Pricing info is now included directly in Flight entities from Sabre providers
            // No separate pricing info cache needed

            // Convert Domain Entities to DTOs
            var flightDtos = flights.Select(flight => MapToDto(flight, null)).ToList();

            stopwatch.Stop();

            return new FlightSearchResponseDto
            {
                Success = true,
                Flights = flightDtos,
                ResponseTime = (int)stopwatch.ElapsedMilliseconds,
                Currency = flights.FirstOrDefault()?.Currency ?? "USD"
            };
        }
        catch (DomainException ex)
        {
            _logger.LogWarning("Domain validation error: {Error}", ex.Message);
            stopwatch.Stop();
            return new FlightSearchResponseDto
            {
                Success = false,
                ErrorMessage = ex.Message,
                ResponseTime = (int)stopwatch.ElapsedMilliseconds
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in SearchFlightsUseCase");
            stopwatch.Stop();
            return new FlightSearchResponseDto
            {
                Success = false,
                ErrorMessage = "An error occurred while searching flights",
                ResponseTime = (int)stopwatch.ElapsedMilliseconds
            };
        }
    }

    /// <summary>
    /// Map Domain Entity to DTO
    /// </summary>
    private FlightOptionDto MapToDto(Domain.Entities.Flight flight, FlightPricingInfo? pricingInfo = null)
    {
        // Debug: Log pricing info
        if (pricingInfo != null)
        {
            _logger.LogInformation("Mapping flight {FlightKey} with BookingCount: {BookingCount}", 
                flight.Key, pricingInfo.BookingCount);
        }
        else
        {
            _logger.LogWarning("No pricing info for flight {FlightKey}", flight.Key);
        }

        return new FlightOptionDto
        {
            Key = flight.Key,
            Airline = flight.Airline,
            FlightNumber = flight.FlightNumber,
            Origin = flight.Origin,
            Destination = flight.Destination,
            DepartureTime = flight.DepartureTime,
            ArrivalTime = flight.ArrivalTime,
            FlightTime = flight.FlightTime,
            TravelTime = flight.TravelTime,
            Equipment = flight.Equipment,
            OriginTerminal = flight.OriginTerminal,
            DestinationTerminal = flight.DestinationTerminal,
            Stops = flight.Stops,
            Price = flight.Price,
            Currency = flight.Currency,
            Class = flight.Class,
            Segments = flight.Segments.Select(s => new FlightSegmentDto
            {
                Carrier = s.Carrier,
                FlightNumber = s.FlightNumber,
                Origin = s.Origin,
                Destination = s.Destination,
                DepartureTime = s.DepartureTime,
                ArrivalTime = s.ArrivalTime,
                FlightTime = s.FlightTime,
                Equipment = s.Equipment
            }).ToList(),
            // Additional fields from XML
            Refundable = pricingInfo?.Refundable,
            BookingClass = pricingInfo?.BookingClass,
            BookingCount = pricingInfo?.BookingCount,
            ChangePenalty = pricingInfo?.ChangePenalty,
            BaggageAllowance = pricingInfo?.BaggageAllowance,
            Distance = pricingInfo?.Distance,
            ETicketability = pricingInfo?.ETicketability,
            LatestTicketingTime = pricingInfo?.LatestTicketingTime,
            PricingMethod = pricingInfo?.PricingMethod,
            PlatingCarrier = pricingInfo?.PlatingCarrier,
            CancelPenalty = pricingInfo?.CancelPenalty,
            ChangePenaltyPercentage = pricingInfo?.ChangePenaltyPercentage,
            ChangePenaltyAmount = pricingInfo?.ChangePenaltyAmount,
            CancelPenaltyPercentage = pricingInfo?.CancelPenaltyPercentage,
            FareBasis = pricingInfo?.FareBasis,
            BaggageNumberOfPieces = pricingInfo?.BaggageNumberOfPieces,
            PassengerTypeCode = pricingInfo?.PassengerTypeCode,
            EffectiveDate = pricingInfo?.EffectiveDate,
            NotValidBefore = pricingInfo?.NotValidBefore,
            NotValidAfter = pricingInfo?.NotValidAfter,
            NegotiatedFare = pricingInfo?.NegotiatedFare,
            BrandId = pricingInfo?.BrandId,
            BrandTier = pricingInfo?.BrandTier,
            ChangeOfPlane = pricingInfo?.ChangeOfPlane,
            ParticipantLevel = pricingInfo?.ParticipantLevel,
            AvailabilitySource = pricingInfo?.AvailabilitySource,
            TotalTaxes = pricingInfo?.TotalTaxes,
            Taxes = pricingInfo?.Taxes?.Select(t => new DTOs.TaxInfoDto
            {
                Category = t.Category,
                Amount = t.Amount,
                Currency = t.Currency
            }).ToList()
        };
    }
}

