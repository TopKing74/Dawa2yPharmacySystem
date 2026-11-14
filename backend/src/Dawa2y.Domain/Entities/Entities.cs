using Dawa2y.Domain.Common;
using Dawa2y.Domain.Enums;

namespace Dawa2y.Domain.Entities;

public class User : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Customer;
    public EgyptianGovernorate Governorate { get; set; } = EgyptianGovernorate.Cairo;
    public string Address { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }

    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public Cart? Cart { get; set; }
}

public class Product : BaseEntity
{
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string DescriptionAr { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public ProductCategory Category { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool RequiresPrescription { get; set; } = false;
    public string Dosage { get; set; } = string.Empty;
    public string ActiveIngredient { get; set; } = string.Empty;
    public string Manufacturer { get; set; } = string.Empty;
    public int TotalStock { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    public ICollection<BranchInventory> BranchInventories { get; set; } = new List<BranchInventory>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}

public class Branch : BaseEntity
{
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public EgyptianGovernorate Governorate { get; set; }
    public string AddressAr { get; set; } = string.Empty;
    public string AddressEn { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string WorkingHours { get; set; } = "24/7";
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public bool IsMainBranch { get; set; } = false;

    public ICollection<BranchInventory> Inventories { get; set; } = new List<BranchInventory>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}

public class BranchInventory : BaseEntity
{
    public Guid BranchId { get; set; }
    public Branch Branch { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int Quantity { get; set; }
    public int ReorderThreshold { get; set; } = 10;
    public DateTime LastRestockedAt { get; set; } = DateTime.UtcNow;
}

public class Cart : BaseEntity
{
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    public string? GuestSessionId { get; set; }

    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}

public class CartItem : BaseEntity
{
    public Guid CartId { get; set; }
    public Cart Cart { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public Guid? FulfillmentBranchId { get; set; }
    public Branch? FulfillmentBranch { get; set; }

    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public EgyptianGovernorate Governorate { get; set; }
    public string ShippingAddress { get; set; } = string.Empty;
    public string? Notes { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

    public decimal Subtotal { get; set; }
    public decimal DeliveryFee { get; set; } = 25.00m; // Standard 25 EGP flat Egyptian delivery
    public decimal TotalAmount { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public Payment? Payment { get; set; }
}

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public string ProductNameAr { get; set; } = string.Empty;
    public string ProductNameEn { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
}

public class Payment : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public PaymentMethod Method { get; set; }
    public PaymentStatus Status { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "EGP";
    public string TransactionId { get; set; } = string.Empty;
    public string? CardLastFour { get; set; }
    public string? CardBrand { get; set; }
    public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
    public string? GatewayResponse { get; set; }
}

public class DailyInsight : BaseEntity
{
    public DateTime Date { get; set; }
    public int UniqueVisitors { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public int ItemsSold { get; set; }
}

