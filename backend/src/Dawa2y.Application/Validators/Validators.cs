using FluentValidation;
using Dawa2y.Application.DTOs;
using Dawa2y.Domain.Enums;
using System.Text.RegularExpressions;

namespace Dawa2y.Application.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequestDto>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required.")
            .MinimumLength(3).WithMessage("Full name must be at least 3 characters.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email address is required.")
            .EmailAddress().WithMessage("A valid email address is required.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters.")
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches(@"[0-9]").WithMessage("Password must contain at least one digit.");

        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage("Egyptian phone number is required.")
            .Matches(@"^(?:\+20|0020|0)?1[0125]\d{8}$")
            .WithMessage("Phone must be a valid Egyptian mobile number (010, 011, 012, 015).");

        RuleFor(x => x.Address)
            .NotEmpty().WithMessage("Street address is required.")
            .MinimumLength(5).WithMessage("Please provide a detailed address for delivery.");
    }
}

public class LoginRequestValidator : AbstractValidator<LoginRequestDto>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.");
    }
}

public class CreateProductValidator : AbstractValidator<CreateProductDto>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.NameAr)
            .NotEmpty().WithMessage("Arabic product name is required.");

        RuleFor(x => x.NameEn)
            .NotEmpty().WithMessage("English product name is required.");

        RuleFor(x => x.Sku)
            .NotEmpty().WithMessage("SKU barcode is required.");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Price must be greater than 0 EGP.");

        RuleFor(x => x.InitialStock)
            .GreaterThanOrEqualTo(0).WithMessage("Initial stock cannot be negative.");
    }
}

public class CheckoutRequestValidator : AbstractValidator<CheckoutRequestDto>
{
    public CheckoutRequestValidator()
    {
        RuleFor(x => x.CustomerName)
            .NotEmpty().WithMessage("Customer name is required.")
            .MinimumLength(3).WithMessage("Customer name must be at least 3 characters.");

        RuleFor(x => x.CustomerEmail)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Valid email is required for invoice receipt.");

        RuleFor(x => x.CustomerPhone)
            .NotEmpty().WithMessage("Egyptian contact phone is required.")
            .Matches(@"^(?:\+20|0020|0)?1[0125]\d{8}$")
            .WithMessage("Valid Egyptian mobile number required for courier contact.");

        RuleFor(x => x.ShippingAddress)
            .NotEmpty().WithMessage("Delivery address is required.")
            .MinimumLength(6).WithMessage("Please provide a complete street/building address.");

        When(x => x.PaymentMethod == PaymentMethod.Visa, () =>
        {
            RuleFor(x => x.CardDetails)
                .NotNull().WithMessage("Visa card payment details are required when choosing online card payment.");

            When(x => x.CardDetails != null, () =>
            {
                RuleFor(x => x.CardDetails!.CardNumber)
                    .NotEmpty().WithMessage("Card number is required.")
                    .Must(BeValidLuhn).WithMessage("Invalid Visa/Mastercard number format.");

                RuleFor(x => x.CardDetails!.CardHolderName)
                    .NotEmpty().WithMessage("Cardholder name is required.");

                RuleFor(x => x.CardDetails!.ExpirationMonth)
                    .NotEmpty().Matches(@"^(0[1-9]|1[0-2])$")
                    .WithMessage("Expiration month must be between 01 and 12.");

                RuleFor(x => x.CardDetails!.ExpirationYear)
                    .NotEmpty().Matches(@"^20[2-9]\d$")
                    .WithMessage("Expiration year must be a valid future year.");

                RuleFor(x => x.CardDetails!.Cvv)
                    .NotEmpty().Matches(@"^\d{3,4}$")
                    .WithMessage("CVV must be 3 or 4 digits.");
            });
        });
    }

    private static bool BeValidLuhn(string? cardNumber)
    {
        if (string.IsNullOrWhiteSpace(cardNumber)) return false;
        var digitsOnly = Regex.Replace(cardNumber, @"[\s-]", "");
        if (digitsOnly.Length < 13 || digitsOnly.Length > 19 || !digitsOnly.All(char.IsDigit))
            return false;

        int sum = 0;
        bool alternate = false;
        for (int i = digitsOnly.Length - 1; i >= 0; i--)
        {
            int n = int.Parse(digitsOnly[i].ToString());
            if (alternate)
            {
                n *= 2;
                if (n > 9) n -= 9;
            }
            sum += n;
            alternate = !alternate;
        }
        return (sum % 10 == 0);
    }
}
