using FlightSearch.API.Application.DTOs.Admin;
using FlightSearch.API.Domain.Entities;
using FlightSearch.API.Domain.Interfaces;

namespace FlightSearch.API.Application.UseCases.Admin;

/// <summary>
/// Use case for getting settings
/// </summary>
public class GetSettingsUseCase
{
    private readonly ISettingRepository _settingRepository;
    private readonly ILogger<GetSettingsUseCase> _logger;

    public GetSettingsUseCase(ISettingRepository settingRepository, ILogger<GetSettingsUseCase> logger)
    {
        _settingRepository = settingRepository;
        _logger = logger;
    }

    public async Task<List<SettingDto>> ExecuteAsync()
    {
        var settings = await _settingRepository.GetAllAsync();
        return settings.Select(MapToDto).ToList();
    }

    public async Task<SettingDto?> GetByKeyAsync(string key)
    {
        var setting = await _settingRepository.GetByKeyAsync(key);
        return setting != null ? MapToDto(setting) : null;
    }

    private SettingDto MapToDto(Setting setting)
    {
        return new SettingDto
        {
            Id = setting.Id,
            Key = setting.Key,
            Value = setting.Value,
            Description = setting.Description,
            Category = setting.Category,
            UpdatedAt = setting.UpdatedAt
        };
    }
}

/// <summary>
/// Use case for updating settings
/// </summary>
public class UpdateSettingUseCase
{
    private readonly ISettingRepository _settingRepository;
    private readonly ILogger<UpdateSettingUseCase> _logger;

    public UpdateSettingUseCase(ISettingRepository settingRepository, ILogger<UpdateSettingUseCase> logger)
    {
        _settingRepository = settingRepository;
        _logger = logger;
    }

    public async Task<(bool Success, SettingDto? Setting, string? Error)> ExecuteAsync(string key, UpdateSettingDto request)
    {
        try
        {
            var setting = await _settingRepository.GetByKeyAsync(key);
            if (setting == null)
            {
                return (false, null, "Setting not found");
            }

            setting.Value = request.Value;
            await _settingRepository.UpdateAsync(setting);

            _logger.LogInformation("Setting {Key} updated to {Value}", key, request.Value);

            return (true, MapToDto(setting), null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating setting {Key}", key);
            return (false, null, "Error updating settings");
        }
    }

    private SettingDto MapToDto(Setting setting)
    {
        return new SettingDto
        {
            Id = setting.Id,
            Key = setting.Key,
            Value = setting.Value,
            Description = setting.Description,
            Category = setting.Category,
            UpdatedAt = setting.UpdatedAt
        };
    }
}

/// <summary>
/// Use case for creating new setting
/// </summary>
public class CreateSettingUseCase
{
    private readonly ISettingRepository _settingRepository;
    private readonly ILogger<CreateSettingUseCase> _logger;

    public CreateSettingUseCase(ISettingRepository settingRepository, ILogger<CreateSettingUseCase> logger)
    {
        _settingRepository = settingRepository;
        _logger = logger;
    }

    public async Task<(bool Success, SettingDto? Setting, string? Error)> ExecuteAsync(CreateSettingDto request)
    {
        try
        {
            // Check if key exists
            var existing = await _settingRepository.GetByKeyAsync(request.Key);
            if (existing != null)
            {
                return (false, null, "Setting key already exists");
            }

            var setting = new Setting
            {
                Key = request.Key,
                Value = request.Value,
                Description = request.Description,
                Category = request.Category,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _settingRepository.CreateAsync(setting);

            _logger.LogInformation("Setting {Key} created", request.Key);

            return (true, MapToDto(setting), null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating setting {Key}", request.Key);
            return (false, null, "Error creating settings");
        }
    }

    private SettingDto MapToDto(Setting setting)
    {
        return new SettingDto
        {
            Id = setting.Id,
            Key = setting.Key,
            Value = setting.Value,
            Description = setting.Description,
            Category = setting.Category,
            UpdatedAt = setting.UpdatedAt
        };
    }
}

