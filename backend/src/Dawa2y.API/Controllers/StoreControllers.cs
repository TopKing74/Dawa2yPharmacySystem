using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Dawa2y.Application.DTOs;
using Dawa2y.Application.Interfaces;
using Dawa2y.Application.Validators;
using Dawa2y.Domain.Enums;

namespace Dawa2y.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    private Guid? CurrentUserId =>
        Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    [HttpGet]
    public async Task<IActionResult> GetCart([FromQuery] string? guestSessionId, CancellationToken ct)
    {
        var cart = await _cartService.GetCartAsync(CurrentUserId, guestSessionId, ct);
        return Ok(cart);
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] AddToCartDto dto, CancellationToken ct)
    {
        var cart = await _cartService.AddItemAsync(CurrentUserId, dto, ct);
        return Ok(cart);
    }

    [HttpPut("items")]
    public async Task<IActionResult> UpdateItemQuantity([FromBody] UpdateCartItemDto dto, [FromQuery] string? guestSessionId, CancellationToken ct)
    {
        var cart = await _cartService.UpdateItemQuantityAsync(CurrentUserId, guestSessionId, dto, ct);
        return Ok(cart);
    }

    [HttpDelete("items/{cartItemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid cartItemId, [FromQuery] string? guestSessionId, CancellationToken ct)
    {
        var cart = await _cartService.RemoveItemAsync(CurrentUserId, guestSessionId, cartItemId, ct);
        return Ok(cart);
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart([FromQuery] string? guestSessionId, CancellationToken ct)
    {
        await _cartService.ClearCartAsync(CurrentUserId, guestSessionId, ct);
        return NoContent();
    }
}

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    private Guid? CurrentUserId =>
        Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequestDto request, CancellationToken ct)
    {
        var validator = new CheckoutRequestValidator();
        var validation = await validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            return BadRequest(new { success = false, errors = validation.Errors.Select(e => e.ErrorMessage) });
        }

        var order = await _orderService.CreateOrderAsync(CurrentUserId, request, ct);
        return Ok(order);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrderById(Guid id, CancellationToken ct)
    {
        var isAdmin = User.IsInRole(UserRole.Admin.ToString());
        var order = await _orderService.GetOrderByIdAsync(id, CurrentUserId, isAdmin, ct);
        if (order == null) return NotFound(new { message = "Order not found." });
        return Ok(order);
    }

    [HttpGet("track/{orderNumber}")]
    public async Task<IActionResult> TrackOrderByNumber(string orderNumber, CancellationToken ct)
    {
        var order = await _orderService.GetOrderByNumberAsync(orderNumber, ct);
        if (order == null) return NotFound(new { message = "Order not found with that number." });
        return Ok(order);
    }

    [Authorize]
    [HttpGet("my-orders")]
    public async Task<IActionResult> GetMyOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();
        var orders = await _orderService.GetUserOrdersAsync(CurrentUserId.Value, page, pageSize, ct);
        return Ok(orders);
    }
}

[ApiController]
[Route("api/[controller]")]
public class BranchesController : ControllerBase
{
    private readonly IBranchService _branchService;

    public BranchesController(IBranchService branchService)
    {
        _branchService = branchService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllBranches([FromQuery] EgyptianGovernorate? governorate, CancellationToken ct)
    {
        var branches = await _branchService.GetAllBranchesAsync(governorate, ct);
        return Ok(branches);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetBranchById(Guid id, CancellationToken ct)
    {
        var branch = await _branchService.GetBranchByIdAsync(id, ct);
        if (branch == null) return NotFound();
        return Ok(branch);
    }

    [HttpGet("nearest")]
    public async Task<IActionResult> GetNearestBranch([FromQuery] double lat, [FromQuery] double lng, CancellationToken ct)
    {
        var branch = await _branchService.GetNearestBranchAsync(lat, lng, ct);
        if (branch == null) return NotFound();
        return Ok(branch);
    }
}

