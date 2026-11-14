using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using Dawa2y.Application.DTOs;
using Dawa2y.Application.Validators;
using Dawa2y.Domain.Entities;
using Dawa2y.Domain.Enums;
using Dawa2y.Infrastructure.Services;
using Xunit;

namespace Dawa2y.Tests;

public class AuthAndSecurityTests
{
    private readonly PasswordHasher _passwordHasher = new();
    private readonly TokenService _tokenService;

    public AuthAndSecurityTests()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "Dawa2yPharmacySuperSecureSecretKey2026!EgyptNationwideHealthPortal!",
                ["Jwt:Issuer"] = "Dawa2yBackend",
                ["Jwt:Audience"] = "Dawa2yClients",
                ["Jwt:ExpiryHours"] = "12"
            })
            .Build();

        _tokenService = new TokenService(config);
    }

    [Fact]
    public void HashPassword_ShouldProduceDifferentHashForSameInput_AndVerifyCorrectly()
    {
        // Arrange
        const string rawPassword = "SecurePassword@2026";

        // Act
        var hash1 = _passwordHasher.HashPassword(rawPassword);
        var hash2 = _passwordHasher.HashPassword(rawPassword);

        // Assert
        Assert.NotEqual(hash1, hash2); // BCrypt random salts
        Assert.True(_passwordHasher.VerifyPassword(rawPassword, hash1));
        Assert.True(_passwordHasher.VerifyPassword(rawPassword, hash2));
        Assert.False(_passwordHasher.VerifyPassword("WrongPassword", hash1));
    }

    [Fact]
    public void GenerateJwtToken_ShouldContainExpectedClaimsAndRole()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Dr. Sameh Pharmacy Admin",
            Email = "admin@dawa2y.com",
            Role = UserRole.Admin,
            Governorate = EgyptianGovernorate.Cairo,
            PhoneNumber = "01001234567"
        };

        // Act
        var tokenString = _tokenService.GenerateJwtToken(user);

        // Assert
        Assert.NotNull(tokenString);
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(tokenString);

        Assert.Equal("Dawa2yBackend", jwtToken.Issuer);
        Assert.Contains("Dawa2yClients", jwtToken.Audiences);

        var roleClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role || c.Type == "role");
        Assert.NotNull(roleClaim);
        Assert.Equal("Admin", roleClaim.Value);

        var emailClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email || c.Type == "email");
        Assert.NotNull(emailClaim);
        Assert.Equal("admin@dawa2y.com", emailClaim.Value);
    }
}

public class PaymentGatewayTests
{
    private readonly VisaPaymentGatewayService _gateway = new();

    [Theory]
    [InlineData("4532015112830366", "Visa")] // Valid Visa
    [InlineData("5555555555554444", "Mastercard")] // Valid Mastercard
    public async Task ProcessCardPayment_ValidCard_ShouldSucceed(string cardNumber, string expectedBrand)
    {
        // Arrange
        var details = new CardPaymentDetailsDto(
            CardNumber: cardNumber,
            CardHolderName: "Karim Mahmoud",
            ExpirationMonth: "12",
            ExpirationYear: "2028",
            Cvv: "345"
        );

        // Act
        var result = await _gateway.ProcessCardPaymentAsync(185.50m, details, "DW-20261113-10001");

        // Assert
        Assert.True(result.Success);
        Assert.StartsWith("TXN-EG-", result.TransactionId);
        Assert.Equal(expectedBrand, result.CardBrand);
        Assert.Equal(cardNumber[^4..], result.LastFour);
    }

    [Fact]
    public async Task ProcessCardPayment_InvalidLuhn_ShouldDecline()
    {
        // Arrange - Invalid checksum
        var details = new CardPaymentDetailsDto(
            CardNumber: "4532015112830369",
            CardHolderName: "Test Cardholder",
            ExpirationMonth: "12",
            ExpirationYear: "2028",
            Cvv: "123"
        );

        // Act
        var result = await _gateway.ProcessCardPaymentAsync(100m, details, "DW-20261113-10002");

        // Assert
        Assert.False(result.Success);
        Assert.Contains("Luhn", result.Message);
    }

    [Fact]
    public async Task ProcessCardPayment_ExpiredCard_ShouldDecline()
    {
        // Arrange - Past year
        var details = new CardPaymentDetailsDto(
            CardNumber: "4532015112830366",
            CardHolderName: "Test Cardholder",
            ExpirationMonth: "01",
            ExpirationYear: "2023",
            Cvv: "123"
        );

        // Act
        var result = await _gateway.ProcessCardPaymentAsync(100m, details, "DW-20261113-10003");

        // Assert
        Assert.False(result.Success);
        Assert.Contains("expired", result.Message, StringComparison.OrdinalIgnoreCase);
    }
}

public class ValidationRulesTests
{
    private readonly RegisterRequestValidator _registerValidator = new();
    private readonly CheckoutRequestValidator _checkoutValidator = new();

    [Theory]
    [InlineData("01012345678", true)] // Vodafone Egypt
    [InlineData("01198765432", true)] // Etisalat Egypt
    [InlineData("01234567890", true)] // Orange Egypt
    [InlineData("01555555555", true)] // WE Egypt
    [InlineData("01312345678", false)] // Invalid prefix
    [InlineData("123456", false)] // Too short
    public void RegisterValidator_EgyptianPhoneValidation(string phone, bool isValid)
    {
        // Arrange
        var request = new RegisterRequestDto(
            FullName: "Adham Samaan",
            Email: "adham@example.com",
            Password: "SecurePassword1!",
            PhoneNumber: phone,
            Governorate: EgyptianGovernorate.Cairo,
            Address: "12 El Tahrir St, Cairo"
        );

        // Act
        var result = _registerValidator.Validate(request);

        // Assert
        var phoneErrors = result.Errors.Where(e => e.PropertyName == nameof(request.PhoneNumber));
        if (isValid)
        {
            Assert.Empty(phoneErrors);
        }
        else
        {
            Assert.NotEmpty(phoneErrors);
        }
    }

    [Fact]
    public void CheckoutValidator_CashOnDelivery_DoesNotRequireCardDetails()
    {
        // Arrange
        var request = new CheckoutRequestDto(
            CustomerName: "Mona Hassan",
            CustomerEmail: "mona@example.com",
            CustomerPhone: "01009876543",
            Governorate: EgyptianGovernorate.Alexandria,
            ShippingAddress: "Sidi Gaber, Corniche, Alex",
            PaymentMethod: PaymentMethod.CashOnDelivery,
            PreferredBranchId: null,
            Notes: "Call upon arrival",
            GuestSessionId: "session-123",
            CardDetails: null
        );

        // Act
        var result = _checkoutValidator.Validate(request);

        // Assert
        Assert.True(result.IsValid);
    }

    [Fact]
    public void CheckoutValidator_VisaPayment_WithoutCardDetails_ShouldFail()
    {
        // Arrange
        var request = new CheckoutRequestDto(
            CustomerName: "Mona Hassan",
            CustomerEmail: "mona@example.com",
            CustomerPhone: "01009876543",
            Governorate: EgyptianGovernorate.Alexandria,
            ShippingAddress: "Sidi Gaber, Corniche, Alex",
            PaymentMethod: PaymentMethod.Visa,
            PreferredBranchId: null,
            Notes: null,
            GuestSessionId: "session-123",
            CardDetails: null
        );

        // Act
        var result = _checkoutValidator.Validate(request);

        // Assert
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "CardDetails");
    }
}

