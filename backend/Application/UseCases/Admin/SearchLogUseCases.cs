using FlightSearch.API.Application.DTOs.Admin;
using FlightSearch.API.Domain.Entities;
using FlightSearch.API.Domain.Interfaces;

namespace FlightSearch.API.Application.UseCases.Admin;

/// <summary>
/// Use case for getting list of search logs
/// </summary>
public class GetSearchLogsUseCase
{
    private readonly ISearchLogRepository _searchLogRepository;
    private readonly ILogger<GetSearchLogsUseCase> _logger;

    public GetSearchLogsUseCase(ISearchLogRepository searchLogRepository, ILogger<GetSearchLogsUseCase> logger)
    {
        _searchLogRepository = searchLogRepository;
        _logger = logger;
    }

    public async Task<SearchLogListResponseDto> ExecuteAsync(int page = 1, int pageSize = 10)
    {
        var logs = await _searchLogRepository.GetAllAsync(page, pageSize);
        var totalCount = await _searchLogRepository.GetTotalCountAsync();

        return new SearchLogListResponseDto
        {
            Logs = logs.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    private SearchLogDto MapToDto(SearchLog log)
    {
        return new SearchLogDto
        {
            Id = log.Id,
            UserId = log.UserId,
            Username = log.User?.Username,
            IpAddress = log.IpAddress,
            Origin = log.Origin,
            Destination = log.Destination,
            DepartureDate = log.DepartureDate,
            ReturnDate = log.ReturnDate,
            AdultCount = log.AdultCount,
            ChildCount = log.ChildCount,
            InfantCount = log.InfantCount,
            ResultCount = log.ResultCount,
            ResponseTimeMs = log.ResponseTimeMs,
            Success = log.Success,
            ErrorMessage = log.ErrorMessage,
            SearchDate = log.SearchDate
        };
    }
}

/// <summary>
/// Use case for creating search log
/// </summary>
public class CreateSearchLogUseCase
{
    private readonly ISearchLogRepository _searchLogRepository;
    private readonly ILogger<CreateSearchLogUseCase> _logger;

    public CreateSearchLogUseCase(ISearchLogRepository searchLogRepository, ILogger<CreateSearchLogUseCase> logger)
    {
        _searchLogRepository = searchLogRepository;
        _logger = logger;
    }

    public async Task ExecuteAsync(
        string origin,
        string destination,
        DateTime departureDate,
        DateTime? returnDate,
        int adultCount,
        int childCount,
        int infantCount,
        int resultCount,
        int responseTimeMs,
        bool success,
        string? errorMessage = null,
        int? userId = null,
        string? ipAddress = null)
    {
        try
        {
            var log = new SearchLog
            {
                UserId = userId,
                IpAddress = ipAddress,
                Origin = origin,
                Destination = destination,
                DepartureDate = departureDate,
                ReturnDate = returnDate,
                AdultCount = adultCount,
                ChildCount = childCount,
                InfantCount = infantCount,
                ResultCount = resultCount,
                ResponseTimeMs = responseTimeMs,
                Success = success,
                ErrorMessage = errorMessage,
                SearchDate = DateTime.UtcNow
            };

            await _searchLogRepository.CreateAsync(log);
        }
        catch (Exception ex)
        {
            // Don't throw - logging shouldn't break the search
            _logger.LogError(ex, "Error creating search log");
        }
    }
}

