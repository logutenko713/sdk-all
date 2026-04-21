from django.contrib import admin
from django.utils.safestring import mark_safe
from .models import (
    Product, Grade, Surface, Width, ProductVariant,
    Cart, CartItem, Order, OrderItem, CallbackRequest,
    Session, OrderStatus, CarouselSection, Documentation, TableCatalog2
)

@admin.register(TableCatalog2)
class TableCatalog2Admin(admin.ModelAdmin):
    list_display = ['name', 'measurement', 'price', 'image_preview', 'is_active', 'created_at']
    list_filter = ['name', 'price', 'is_active', 'created_at']
    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" width="50" height="50" style="object-fit: cover;" />')
        return "Нет фото"
    image_preview.short_description = 'Превью'

@admin.register(Documentation)
class DocumentationAdmin(admin.ModelAdmin):
    list_display = ['name', 'image_preview', 'pdf_link', 'is_active', 'created_at']
    list_editable = ['is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name']

    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" width="50" height="50" style="object-fit: cover;" />')
        return "Нет фото"

    image_preview.short_description = 'Превью'

    def pdf_link(self, obj):
        if obj.pdf_file:
            return mark_safe(f'<a href="{obj.pdf_file.url}" target="_blank">📄 Скачать PDF</a>')
        return "Нет PDF"

    pdf_link.short_description = 'PDF файл'

@admin.register(CarouselSection)
class CarouselSectionAdmin(admin.ModelAdmin):
    list_display = ['image_preview', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" width="80" height="80" style="object-fit: cover;" />')
        return "Нет фото"
    image_preview.short_description = 'Фото'

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'is_active', 'image_preview', 'created_at']
    list_filter = ['is_active', 'category']
    search_fields = ['name', 'category']
    fields = ['name', 'category', 'description', 'is_active', 'discount_volume', 'image', 'image_preview']
    readonly_fields = ['image_preview']

    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" width="80" height="80" style="object-fit: cover;" />')
        return "Нет фото"

    image_preview.short_description = 'Фото'

@admin.register(ProductVariant)  # Настройка для варианта товара (добавляет конкретные разеры и цены)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ['product', 'grade', 'surface', 'width', 'thickness', 'length', 'price_per_m3', 'is_active']
    list_filter = ['is_active', 'product', 'grade']
    search_fields = ['product__name']


@admin.register(Cart) # Настройка для корзины
class CartAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'created_at', 'updated_at']
    readonly_fields = ['created_at', 'updated_at'] # Автоматически создаются даты


@admin.register(CartItem) # Товары в корзине
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['cart', 'variant', 'quantity', 'price_at_moment']


@admin.register(Order) # Настройка для заказов
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'client_surname', 'client_name', 'phone', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order_number', 'client_name', 'client_surname', 'phone'] #Поля для поиска
    readonly_fields = ['order_number', 'created_at', 'updated_at'] # поля для чтения


@admin.register(OrderItem) # Настройка для товаров в заказе
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'variant', 'quantity', 'price']


@admin.register(CallbackRequest) # Настройка для заявки для звонков
class CallbackRequestAdmin(admin.ModelAdmin):
    list_display = ['phone', 'created_at', 'is_processed']
    list_filter = ['is_processed', 'created_at']
    search_fields = ['phone']


admin.site.register(Grade)
admin.site.register(Surface)
admin.site.register(Width)
admin.site.register(Session)
admin.site.register(OrderStatus)
