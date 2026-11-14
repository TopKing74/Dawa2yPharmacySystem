using Dawa2y.Domain.Enums;

namespace Dawa2y.Application.DTOs;

public record LoginRequestDto(string Email, string Password);

public record RegisterRequestDto(
    string FullName,
    string Email,
    string Password,
    string PhoneNumber,
    EgyptianGovernorate Governorate,
    string Address);

public record AuthResultDto(
    bool Success,
    string Token,
    string Message,
    UserProfileDto? User);

public record UserProfileDto(
    Guid Id,
    string FullName,
    string Email,
    string PhoneNumber,
    string Role,
    EgyptianGovernorate Governorate,
    string Address);

