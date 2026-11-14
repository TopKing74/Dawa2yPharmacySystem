namespace Dawa2y.Domain.Enums;

public enum UserRole
{
    Admin = 1,
    Pharmacist = 2,
    Customer = 3
}

public enum OrderStatus
{
    Pending = 1,
    Confirmed = 2,
    Processing = 3,
    OutForDelivery = 4,
    Delivered = 5,
    Cancelled = 6
}

public enum PaymentMethod
{
    Visa = 1,
    CashOnDelivery = 2
}

public enum PaymentStatus
{
    Pending = 1,
    Paid = 2,
    Failed = 3,
    Refunded = 4
}

public enum ProductCategory
{
    Medicines = 1,
    VitaminsAndSupplements = 2,
    BabyCare = 3,
    SkinCare = 4,
    ChronicDiseases = 5,
    FirstAid = 6,
    PersonalCare = 7
}

public enum EgyptianGovernorate
{
    Cairo = 1,
    Giza = 2,
    Alexandria = 3,
    Qalyubia = 4,
    Sharqia = 5,
    Dakahlia = 6,
    Gharbia = 7,
    KafrElSheikh = 8,
    Menofia = 9,
    Beheira = 10,
    Ismailia = 11,
    Suez = 12,
    PortSaid = 13,
    Damietta = 14,
    Fayoum = 15,
    BeniSuef = 16,
    Minya = 17,
    Assiut = 18,
    Sohag = 19,
    Qena = 20,
    Luxor = 21,
    Aswan = 22,
    RedSea = 23,
    NewValley = 24,
    Matrouh = 25,
    NorthSinai = 26,
    SouthSinai = 27
}

