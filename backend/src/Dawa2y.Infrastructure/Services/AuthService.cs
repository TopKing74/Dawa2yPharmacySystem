using Microsoft.EntityFrameworkCore;
using Dawa2y.Application.DTOs;
using Dawa2y.Application.Interfaces;
using Dawa2y.Domain.Entities;
using Dawa2y.Domain.Enums;
using Dawa2y.Infrastructure.Persistence;

namespace Dawa2y.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly Dawa2yDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public AuthService(Dawa2yDbContext context, IPasswordHasher passwordHasher, ITokenService tokenService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public async Task<AuthResultDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail, cancellationToken);

        if (user == null || !user.IsActive || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return new AuthResultDto(false, string.Empty, "Invalid email or password.", null);
        }

        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        var token = _tokenService.GenerateJwtToken(user);
        var profile = MapToProfile(user);

        return new AuthResultDto(true, token, "Login successful.", profile);
    }

    public async Task<AuthResultDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var existing = await _context.Users
            .AnyAsync(u => u.Email.ToLower() == normalizedEmail, cancellationToken);

        if (existing)
        {
            return new AuthResultDto(false, string.Empty, "An account with this email already exists.", null);
        }

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = normalizedEmail,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            PhoneNumber = request.PhoneNumber.Trim(),
            Governorate = request.Governorate,
            Address = request.Address.Trim(),
            Role = UserRole.Customer,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        var token = _tokenService.GenerateJwtToken(user);
        var profile = MapToProfile(user);

        return new AuthResultDto(true, token, "Account created successfully.", profile);
    }

    public async Task<UserProfileDto?> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync([userId], cancellationToken);
        return user == null ? null : MapToProfile(user);
    }

    private static UserProfileDto MapToProfile(User user) => new(
        user.Id,
        user.FullName,
        user.Email,
        user.PhoneNumber,
        user.Role.ToString(),
        user.Governorate,
        user.Address);
}

