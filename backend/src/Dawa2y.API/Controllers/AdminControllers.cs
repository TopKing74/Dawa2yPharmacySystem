using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Dawa2y.Application.DTOs;
using Dawa2y.Application.Interfaces;
using Dawa2y.Application.Validators;
using Dawa2y.Domain.Enums;

namespace Dawa2y.API.Controllers.Admin;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles = "Admin")]
public class AdminDashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public AdminDashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview(CancellationToken ct)
    {
        var overview = await _dashboardService.GetDashboardOverviewAsync(ct);
        return Ok(overview);
    }
}

[ApiController]
[Route("api/admin/products")]
[Authorize(Roles = "Admin")]
public class AdminProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public AdminProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] ProductFilterDto filter, CancellationToken ct)
    {
        var result = await _productService.GetProductsAsync(filter, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var product = await _productService.GetProductByIdAsync(id, ct);
        if (product == null) return NotFound(new { message = "Product not found." });
        return Ok(product);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductDto dto, CancellationToken ct)
    {
        var validator = new CreateProductValidator();
        var validation = await validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
        {
            return BadRequest(new { success = false, errors = validation.Errors.Select(e => e.ErrorMessage) });
        }

        var product = await _productService.CreateProductAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductDto dto, CancellationToken ct)
    {
        var product = await _productService.UpdateProductAsync(id, dto, ct);
        return Ok(product);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var deleted = await _productService.DeleteProductAsync(id, ct);
        if (!deleted) return NotFound(new { message = "Product not found." });
        return Ok(new { success = true, message = "Product removed from active catalog." });
    }
}

[ApiController]
[Route("api/admin/inventory")]
[Authorize(Roles = "Admin,Pharmacist")]
public class AdminInventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public AdminInventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetBranchInventories([FromQuery] Guid? branchId, [FromQuery] bool lowStockOnly = false, CancellationToken ct = default)
    {
        var inventories = await _inventoryService.GetBranchInventoriesAsync(branchId, lowStockOnly, ct);
        return Ok(inventories);
    }

    [HttpPost("adjust")]
    public async Task<IActionResult> AdjustStock([FromBody] AdjustStockDto dto, CancellationToken ct)
    {
        var updated = await _inventoryService.AdjustBranchStockAsync(dto, ct);
        return Ok(updated);
    }
}

[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = "Admin,Pharmacist")]
public class AdminOrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public AdminOrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] OrderStatus? status = null, CancellationToken ct = default)
    {
        var orders = await _orderService.GetAllOrdersAsync(page, pageSize, status, ct);
        return Ok(orders);
    }

    [HttpPatch("{id:guid}/status")]
    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] OrderStatusUpdateDto dto, CancellationToken ct)
    {
        var updated = await _orderService.UpdateOrderStatusAsync(id, dto, ct);
        return Ok(updated);
    }
}

