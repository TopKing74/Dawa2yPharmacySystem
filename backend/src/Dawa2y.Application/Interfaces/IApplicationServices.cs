using Dawa2y.Application.DTOs;
using Dawa2y.Domain.Entities;
using Dawa2y.Domain.Enums;

namespace Dawa2y.Application.Interfaces;

public interface ITokenService
{
    string GenerateJwtToken(User user);
}

public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}

public interface IAuthService
{
    Task<AuthResultDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default);
    Task<AuthResultDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default);
    Task<UserProfileDto?> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default);
}

public interface IProductService
{
    Task<PagedResult<ProductDto>> GetProductsAsync(ProductFilterDto filter, CancellationToken cancellationToken = default);
    Task<ProductDto?> GetProductByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ProductDto> CreateProductAsync(CreateProductDto dto, CancellationToken cancellationToken = default);
    Task<ProductDto> UpdateProductAsync(Guid id, UpdateProductDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteProductAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductDto>> GetFeaturedProductsAsync(CancellationToken cancellationToken = default);
}

public interface ICartService
{
    Task<CartDto> GetCartAsync(Guid? userId, string? guestSessionId, CancellationToken cancellationToken = default);
    Task<CartDto> AddItemAsync(Guid? userId, AddToCartDto dto, CancellationToken cancellationToken = default);
    Task<CartDto> UpdateItemQuantityAsync(Guid? userId, string? guestSessionId, UpdateCartItemDto dto, CancellationToken cancellationToken = default);
    Task<CartDto> RemoveItemAsync(Guid? userId, string? guestSessionId, Guid cartItemId, CancellationToken cancellationToken = default);
    Task ClearCartAsync(Guid? userId, string? guestSessionId, CancellationToken cancellationToken = default);
}

public interface IOrderService
{
    Task<OrderDto> CreateOrderAsync(Guid? userId, CheckoutRequestDto request, CancellationToken cancellationToken = default);
    Task<OrderDto?> GetOrderByIdAsync(Guid orderId, Guid? requestingUserId, bool isAdmin = false, CancellationToken cancellationToken = default);
    Task<OrderDto?> GetOrderByNumberAsync(string orderNumber, CancellationToken cancellationToken = default);
    Task<PagedResult<OrderDto>> GetUserOrdersAsync(Guid userId, int page = 1, int pageSize = 10, CancellationToken cancellationToken = default);
    Task<PagedResult<OrderDto>> GetAllOrdersAsync(int page = 1, int pageSize = 20, OrderStatus? status = null, CancellationToken cancellationToken = default);
    Task<OrderDto> UpdateOrderStatusAsync(Guid orderId, OrderStatusUpdateDto dto, CancellationToken cancellationToken = default);
}

public interface IPaymentService
{
    Task<(bool Success, string TransactionId, string Message, string? CardBrand, string? LastFour)> ProcessCardPaymentAsync(
        decimal amount,
        CardPaymentDetailsDto cardDetails,
        string orderNumber,
        CancellationToken cancellationToken = default);
}

public interface IInventoryService
{
    Task<IReadOnlyList<BranchInventoryDto>> GetBranchInventoriesAsync(Guid? branchId = null, bool lowStockOnly = false, CancellationToken cancellationToken = default);
    Task<BranchInventoryDto> AdjustBranchStockAsync(AdjustStockDto dto, CancellationToken cancellationToken = default);
    Task<int> GetProductStockInBranchAsync(Guid productId, Guid branchId, CancellationToken cancellationToken = default);
}

public interface IBranchService
{
    Task<IReadOnlyList<BranchDto>> GetAllBranchesAsync(EgyptianGovernorate? governorate = null, CancellationToken cancellationToken = default);
    Task<BranchDto?> GetBranchByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<BranchDto?> GetNearestBranchAsync(double latitude, double longitude, CancellationToken cancellationToken = default);
}

public interface IDashboardService
{
    Task<DashboardOverviewDto> GetDashboardOverviewAsync(CancellationToken cancellationToken = default);
    Task LogVisitorHitAsync(CancellationToken cancellationToken = default);
}

