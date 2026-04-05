using FlightSearch.API.Application.DTOs.Admin;
using FlightSearch.API.Domain.Entities;
using FlightSearch.API.Domain.Interfaces;

namespace FlightSearch.API.Application.UseCases.Admin;

/// <summary>
/// Use case for getting list of airlines
/// </summary>
public class GetAirlinesUseCase
{
    private readonly IAirlineRepository _airlineRepository;
    private readonly ILogger<GetAirlinesUseCase> _logger;

    public GetAirlinesUseCase(IAirlineRepository airlineRepository, ILogger<GetAirlinesUseCase> logger)
    {
        _airlineRepository = airlineRepository;
        _logger = logger;
    }

    public async Task<AirlineListResponseDto> ExecuteAsync(int page = 1, int pageSize = 10)
    {
        var airlines = await _airlineRepository.GetAllAsync(page, pageSize);
        var totalCount = await _airlineRepository.GetTotalCountAsync();

        return new AirlineListResponseDto
        {
            Airlines = airlines.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    private AirlineDto MapToDto(Airline airline)
    {
        return new AirlineDto
        {
            Id = airline.Id,
            Code = airline.Code,
            Name = airline.Name,
            Country = airline.Country,
            LogoUrl = airline.LogoUrl,
            IsActive = airline.IsActive,
            CreatedAt = airline.CreatedAt,
            UpdatedAt = airline.UpdatedAt
        };
    }
}

/// <summary>
/// Use case for creating new airline
/// </summary>
public class CreateAirlineUseCase
{
    private readonly IAirlineRepository _airlineRepository;
    private readonly ILogger<CreateAirlineUseCase> _logger;

    public CreateAirlineUseCase(IAirlineRepository airlineRepository, ILogger<CreateAirlineUseCase> logger)
    {
        _airlineRepository = airlineRepository;
        _logger = logger;
    }

    public async Task<AirlineDto> ExecuteAsync(CreateAirlineDto request)
    {
        // Check if airline code already exists
        if (await _airlineRepository.ExistsAsync(request.Code))
        {
            throw new InvalidOperationException($"Airline with code '{request.Code}' already exists");
        }

        var airline = new Airline
        {
            Code = request.Code.ToUpper(),
            Name = request.Name,
            Country = request.Country,
            LogoUrl = request.LogoUrl,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _airlineRepository.CreateAsync(airline);
        _logger.LogInformation("Airline {Code} created successfully", created.Code);

        return new AirlineDto
        {
            Id = created.Id,
            Code = created.Code,
            Name = created.Name,
            Country = created.Country,
            LogoUrl = created.LogoUrl,
            IsActive = created.IsActive,
            CreatedAt = created.CreatedAt,
            UpdatedAt = created.UpdatedAt
        };
    }
}

/// <summary>
/// Use case for updating airline
/// </summary>
public class UpdateAirlineUseCase
{
    private readonly IAirlineRepository _airlineRepository;
    private readonly ILogger<UpdateAirlineUseCase> _logger;

    public UpdateAirlineUseCase(IAirlineRepository airlineRepository, ILogger<UpdateAirlineUseCase> logger)
    {
        _airlineRepository = airlineRepository;
        _logger = logger;
    }

    public async Task<AirlineDto> ExecuteAsync(int airlineId, UpdateAirlineDto request)
    {
        var airline = await _airlineRepository.GetByIdAsync(airlineId);
        if (airline == null)
        {
            throw new KeyNotFoundException($"Airline with ID {airlineId} not found");
        }

        // Check if code is being changed and if new code already exists
        if (!string.IsNullOrEmpty(request.Code) && request.Code.ToUpper() != airline.Code)
        {
            if (await _airlineRepository.ExistsAsync(request.Code))
            {
                throw new InvalidOperationException($"Airline with code '{request.Code}' already exists");
            }
            airline.Code = request.Code.ToUpper();
        }

        if (!string.IsNullOrEmpty(request.Name))
            airline.Name = request.Name;

        if (request.Country != null)
            airline.Country = request.Country;

        if (request.LogoUrl != null)
            airline.LogoUrl = request.LogoUrl;

        if (request.IsActive.HasValue)
            airline.IsActive = request.IsActive.Value;

        var updated = await _airlineRepository.UpdateAsync(airline);
        _logger.LogInformation("Airline {Code} updated successfully", updated.Code);

        return new AirlineDto
        {
            Id = updated.Id,
            Code = updated.Code,
            Name = updated.Name,
            Country = updated.Country,
            LogoUrl = updated.LogoUrl,
            IsActive = updated.IsActive,
            CreatedAt = updated.CreatedAt,
            UpdatedAt = updated.UpdatedAt
        };
    }
}

/// <summary>
/// Use case for deleting airline
/// </summary>
public class DeleteAirlineUseCase
{
    private readonly IAirlineRepository _airlineRepository;
    private readonly ILogger<DeleteAirlineUseCase> _logger;

    public DeleteAirlineUseCase(IAirlineRepository airlineRepository, ILogger<DeleteAirlineUseCase> logger)
    {
        _airlineRepository = airlineRepository;
        _logger = logger;
    }

    public async Task<bool> ExecuteAsync(int airlineId)
    {
        var airline = await _airlineRepository.GetByIdAsync(airlineId);
        if (airline == null)
        {
            throw new KeyNotFoundException($"Airline with ID {airlineId} not found");
        }

        var result = await _airlineRepository.DeleteAsync(airlineId);
        if (result)
        {
            _logger.LogInformation("Airline {Code} deleted successfully", airline.Code);
        }

        return result;
    }
}
