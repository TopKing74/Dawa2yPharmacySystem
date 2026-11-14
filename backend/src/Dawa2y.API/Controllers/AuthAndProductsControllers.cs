using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Dawa2y.Application.DTOs;
using Dawa2y.Application.Interfaces;
using Dawa2y.Application.Validators;

namespace Dawa2y.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request, CancellationToken ct)
    {
        var validator = new LoginRequestValidator();
        var validation = await validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            return BadRequest(new { success = false, errors = validation.Errors.Select(e => e.ErrorMessage) });
        }

        var result = await _authService.LoginAsync(request, ct);
        if (!result.Success)
        {
            return Unauthorized(new { success = false, message = result.Message });
        }

        return Ok(result);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request, CancellationToken ct)
    {
        var validator = new RegisterRequestValidator();
        var validation = await validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            return BadRequest(new { success = false, errors = validation.Errors.Select(e => e.ErrorMessage) });
        }

        var result = await _authService.RegisterAsync(request, ct);
        if (!result.Success)
        {
            return BadRequest(new { success = false, message = result.Message });
        }

        return Ok(result);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile(CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }

        var profile = await _authService.GetProfileAsync(userId, ct);
        if (profile == null) return NotFound();

        return Ok(profile);
    }
}

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IDashboardService _dashboardService;

    public ProductsController(IProductService productService, IDashboardService dashboardService)
    {
        _productService = productService;
        _dashboardService = dashboardService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] ProductFilterDto filter, CancellationToken ct)
    {
        // Log visitor hit to keep traffic statistics accurate (~5000 visits/day)
        await _dashboardService.LogVisitorHitAsync(ct);

        var result = await _productService.GetProductsAsync(filter, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetProductById(Guid id, CancellationToken ct)
    {
        var product = await _productService.GetProductByIdAsync(id, ct);
        if (product == null) return NotFound(new { success = false, message = "Product not found." });
        return Ok(product);
    }

    [HttpGet("featured")]
    public async Task<IActionResult> GetFeaturedProducts(CancellationToken ct)
    {
        var products = await _productService.GetFeaturedProductsAsync(ct);
        return Ok(products);
    }
}

