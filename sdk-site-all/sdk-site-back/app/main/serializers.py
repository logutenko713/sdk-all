"""from rest_framework import serializers
from .models import Price

class PriceUpsertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Price
        fields = ["product", "grade", "surface", "width", "price_rub"]

    def validate(self, attrs):
        if attrs.get("price_rub") is None:
            raise serializers.ValidationError("price_rub обязателен")
        return attrs"""


from rest_framework import serializers
from .models import (Product, ProductVariant, Cart, CartItem, Order, OrderItem, CallbackRequest, Session, Grade,
                     Surface, Width, OrderStatus, CarouselSection, Documentation, TableCatalog2, PlywoodCatalog)

class PlywoodCatalogSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    grade_name = serializers.CharField(source='grade.name', read_only=True)  # добавить
    surface_name = serializers.CharField(source='surface.name', read_only=True)  # добавить

    class Meta:
        model = PlywoodCatalog
        fields = ['id', 'name', 'description', 'image_url', 'grade', 'grade_name', 'surface', 'surface_name',
                  'thickness', 'sheets_per_pack', 'price', 'created_at', 'is_active']

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None

class TableCatalog2Serializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = TableCatalog2
        fields = ['id', 'name', 'description', 'image_url', 'measurement', 'price', 'created_at', 'is_active']

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None

class DocumentationSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = Documentation
        fields = ['id', 'name', 'image_url', 'pdf_url', 'created_at', 'is_active']

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None

    def get_pdf_url(self, obj):
        if obj.pdf_file:
            return obj.pdf_file.url
        return None

class CarouselSectionSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    class Meta:
        model = CarouselSection
        fields = ['id', 'image', 'created_at', 'is_active']

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None

class GradeSerializer(serializers.ModelSerializer): # Преобразование сорта в json и обратно
    class Meta:
        model = Grade
        fields = ['id', 'name']


class SurfaceSerializer(serializers.ModelSerializer): # Преобразование поверхности в json и обратно
    class Meta:
        model = Surface
        fields = ['id', 'name']


class WidthSerializer(serializers.ModelSerializer): # Преобразование ширины в json и обратно
    class Meta:
        model = Width
        fields = ['id', 'value']


class ProductListSerializer(serializers.ModelSerializer): #Краткая информация о товаре для главной страницы
    image = serializers.SerializerMethodField()
    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'is_active', 'image']

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None

class ProductVariantSerializer(serializers.ModelSerializer):
    volume_m3 = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = [
            'id', 'product', 'grade', 'surface', 'width', 'thickness',
            'length', 'price_per_m3', 'sheets_per_pack',
            'is_active', 'volume_m3'
        ]

    def get_volume_m3(self, obj):
        return obj.calculate_volume_m3()

class ProductDetailSerializer(serializers.ModelSerializer): #Подробная информация о товаре для каталога
    image = serializers.SerializerMethodField()
    variants = ProductVariantSerializer(many=True, read_only=True)
    grades = GradeSerializer(many=True, read_only=True)
    surfaces = SurfaceSerializer(many=True, read_only=True)
    widths = WidthSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'category', 'description',
            'is_active', 'discount_volume', 'variants',
            'grades', 'surfaces', 'widths', 'image'
        ]

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None

class CartItemSerializer(serializers.ModelSerializer): # Информация о товаре в корзине пользователя
    variant = ProductVariantSerializer(read_only=True) # Полная информация о варианте товара(чтение)
    variant_id = serializers.IntegerField(write_only=True) # ID для записи. write_only - поле только для приема
    product_id = serializers.IntegerField(source='variant.product.id', read_only=True)
    product_name = serializers.CharField(source='variant.product.name', read_only=True)
    total_price = serializers.SerializerMethodField() # Автоматически вычисляемые поля
    total_volume = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            'id', 'variant', 'variant_id', 'product_id', 'product_name',
            'quantity', 'price_at_moment', 'total_price', 'total_volume'
        ]
        read_only_fields = ['price_at_moment'] # Автоматически устанавливается цена

    def get_total_price(self, obj): # Расчет общей стоимисти общей позиции
        return obj.get_total_price()

    def get_total_volume(self, obj): # Расчет общего объема данной позиции в м^3
        return obj.get_total_volume()


class CartSerializer(serializers.ModelSerializer): # Полная информация о корзине пользователя
    items = CartItemSerializer(many=True, read_only=True) # Все товары в корзине. many - Список
    total_price = serializers.SerializerMethodField() # Cтоимость всей корзины
    total_volume = serializers.SerializerMethodField() # Весь объем корзины

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_price', 'total_volume', 'created_at', 'updated_at']

    def get_total_price(self, obj): # Расчет общей стоимости всей корзины
        return obj.get_total_price()

    def get_total_volume(self, obj): # Суммирует объем товаров для расчета скидки
        return obj.get_total_volume()


class AddToCartSerializer(serializers.Serializer):
    variant_id = serializers.IntegerField() # IntegerField - должно быть целое число
    quantity = serializers.IntegerField(min_value=1) # Кол-во товара


class UpdateCartItemSerializer(serializers.Serializer): # Валидация данных при изменении кол-ва товара в корзине
    quantity = serializers.IntegerField(min_value=1)


class OrderItemSerializer(serializers.ModelSerializer): # Информация о товаре в оформленном заказе
    variant = ProductVariantSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'variant', 'quantity', 'price']


class OrderSerializer(serializers.ModelSerializer): # полная информация о заказе
    items = OrderItemSerializer(many=True, read_only=True) # все товары в заказе
    status_name = serializers.CharField(source='status.name', read_only=True) # Теперь будет названние статуса вмест ID
    total_price = serializers.SerializerMethodField() # Общая стоимость заказа

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'client_name', 'client_surname',
            'client_patronymic', 'phone', 'email', 'comment',
            'status', 'status_name', 'items', 'total_price',
            'telegram_chat_id', 'created_at'
        ]
        read_only_fields = ['order_number', 'created_at'] # Генерируется автоматически

    def get_total_price(self, obj): # Расчет общей стоимости заказа, суммируем стоимость всех заказов
        return obj.get_total_price()


class CreateOrderSerializer(serializers.Serializer): #Валидация данных при создании заказа
    client_name = serializers.CharField(max_length=255)
    client_surname = serializers.CharField(max_length=255)
    client_patronymic = serializers.CharField(max_length=255, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20)
    email = serializers.EmailField(required=False, allow_blank=True)
    comment = serializers.CharField(required=False, allow_blank=True)


class CallbackRequestSerializer(serializers.ModelSerializer): # Информация о запросе обратного звонка
    class Meta:
        model = CallbackRequest
        fields = ['id', 'phone', 'created_at', 'is_processed']
        read_only_fields = ['created_at', 'is_processed']
