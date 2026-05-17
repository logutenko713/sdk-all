from django.db import models
from django.db.models import CharField
from django.utils import timezone
from django.core.validators import FileExtensionValidator
from decimal import Decimal

class TableCatalog2(models.Model):
    image = models.ImageField(upload_to="Photo/catalog/cards", verbose_name="Изображение товара")
    name = models.CharField(max_length=100, verbose_name="Продукция")
    description = models.TextField(verbose_name="Описание", blank=True, null=True)  # Подробное описание товара
    measurement = models.CharField(max_length=100, verbose_name="Измерение")
    price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Цена за ед.")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    is_active = models.BooleanField(default=True, verbose_name="Активен")

    class Meta:
        verbose_name = "Таблица для каталога(2)"
        verbose_name_plural = "Таблицы для каталога(2)"

    def __str__(self):
        return self.name

# Документация
class Documentation(models.Model):
    image = models.ImageField(upload_to="Photo/documentation/image", verbose_name="Фото документации")
    name = models.CharField(max_length=100, verbose_name="Название документа")
    pdf_file = models.FileField(
        verbose_name="PDF файл",
        upload_to="Photo/documentation/pdf",
        validators=[FileExtensionValidator(['pdf'])],
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    is_active = models.BooleanField(default=True,
                                    verbose_name="Активен")  # Флаг активности - показывать ли товар на сайте


    class Meta:
        verbose_name = "Документация"
        verbose_name_plural = "Документация"

    def __str__(self):
        return self.name


# Карусель слайдов на главной странице
class CarouselSection(models.Model):
    image = models.ImageField(verbose_name="Фото слайда", upload_to="Photo/slides", blank = True, null=True)
    # Дата создания товара в системе
    created_at = models.DateTimeField(auto_now_add=True, verbose_name = "Дата создания")
    is_active = models.BooleanField(default=True, verbose_name="Активен") # Флаг активности - показывать ли товар на сайте

    class Meta:
        verbose_name = "Карусель"
        verbose_name_plural = "Карусель"

# Товар
class Product (models.Model):
    name = models.CharField(max_length=100, verbose_name="Название") # Название товара (например, "Доска обрезная")
    category = models.CharField(max_length=100, verbose_name="Категория", blank=True, null = True) # Категория товара (например,
    # "Пиломатериалы")
    description = models.TextField(verbose_name="Описание", blank=True, null = True)# Подробное описание товара
    is_active = models.BooleanField(default=True, verbose_name="Активен") # Флаг активности - показывать ли товар на сайте
    # Объем от которого начинает действовать скидка (в кубометрах)
    discount_volume = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name="Объем от скидки ("
                                                                                                  "м³)", blank=True, null = True)
    # Изображение товара
    image = models.ImageField(verbose_name="Изображение товара", upload_to="Photo/cards", blank = True, null=True)
    # Дата создания товара в системе
    created_at = models.DateTimeField(auto_now_add=True, verbose_name = "Дата создания")

    # Дата последнего обновления товара
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"

    def __str__(self):
        return self.name


class Grade (models.Model): #Сорт товара (I, II, III сорт и т.д.)
    name = models.CharField(max_length=100, verbose_name="Название сорта")
    # CASCADE - если удалим товар, удалятся и все его сорта
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True, related_name="grades")  # Обратная связь: product.grades.all()

    class Meta:
        verbose_name = "Сорт"
        verbose_name_plural = "Сорта"

    def __str__(self):
        return self.name


class Surface (models.Model): #тип обрабоки поверхности
    name = models.CharField(max_length=100, verbose_name="Тип поверхности")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True, related_name="surfaces")  # Обратная связь: product.surfaces.all()

    class Meta:
        verbose_name = "Поверхность"
        verbose_name_plural = "Поверхности"

    def __str__(self):
        return self.name


class Width (models.Model): #ширина в мм
    value = models.PositiveIntegerField(verbose_name="Ширина (мм)")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True, related_name="widths")  # Обратная связь: product.widths.all()

    class Meta:
        verbose_name = "Ширина"
        verbose_name_plural = "Ширины"

    def __str__(self):
        return f"{self.value} мм"


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants", verbose_name="Товар")
    
    # ⬇️ ИЗМЕНЕНИЯ: теперь это простые текстовые поля
    grade = models.CharField(max_length=100, blank=True, null=True, verbose_name="Сорт")
    surface = models.CharField(max_length=100, blank=True, null=True, verbose_name="Тип поверхности")
    width = models.CharField(max_length=50, blank=True, null=True, verbose_name="Ширина (мм)")
    
    thickness = models.DecimalField(max_digits=6, decimal_places=1, verbose_name="Толщина (мм)", blank=True, null=True)
    length = models.DecimalField(max_digits=6, decimal_places=1, verbose_name="Длина (м)", blank=True, null=True)
    price_per_m3 = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Цена за м³", blank=True, null=True)
    sheets_per_pack = models.PositiveIntegerField(verbose_name="Количество листов в упаковке (шт)", default=1, blank=True, null=True)
    is_active = models.BooleanField(default=True, verbose_name="Активен")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Таблица для каталога(1)"
        verbose_name_plural = "Таблицы для каталога(1)"
        constraints = [
            models.UniqueConstraint(
                fields=["product", "grade", "surface", "width", "thickness", "length"],
                name="unique_product_variant"
            )
        ]
        indexes = [
            models.Index(fields=["product", "is_active"]),
        ]

    def __str__(self):
        return self.product.name

    def calculate_volume_m3(self):
        try:
            width_m = Decimal(self.width) / Decimal('1000') if self.width else Decimal('0')
        except (ValueError, TypeError):
            width_m = Decimal('0')
        thickness_m = Decimal(self.thickness) / Decimal('1000') if self.thickness else Decimal('0')
        length_m = Decimal(self.length) if self.length else Decimal('0')
        return (width_m * thickness_m * length_m).quantize(Decimal('0.0001'))
class PlywoodCatalog(models.Model):
    image = models.ImageField(upload_to="Photo/catalog/plywood", verbose_name="Изображение товара")
    name = models.CharField(max_length=100, verbose_name="Продукция")
    grade = models.ForeignKey(Grade, on_delete=models.PROTECT, null=True, blank=True, verbose_name="Сорт")  # Сорт
    surface = models.ForeignKey(Surface, on_delete=models.PROTECT, null=True, blank=True, verbose_name="Тип "
                                                                                                       "поверхности")  # Тип поверхности этого варианта
    thickness = models.DecimalField(max_digits=6, decimal_places=1, null = True, blank = True,
                                    verbose_name="Толщина (мм)")  # Толщина в миллиметрах
    sheets_per_pack = models.PositiveIntegerField(verbose_name="Количество листов в упаковке (шт)",default=1,
                                                  null = True, blank = True)
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Цена товара")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    is_active = models.BooleanField(default=True, verbose_name="Активен")
    description = models.TextField(verbose_name="Описание", blank=True, null=True)  # Подробное описание товара

    class Meta:
        verbose_name = "Таблица для каталога(3)"
        verbose_name_plural = "Таблицы для каталога(3)"

    def __str__(self):
        return f"{self.name} -- {self.price}"

class Session(models.Model):
    # Уникальный ключ сессии (генерируется автоматически)
    # Этот ключ передается с фронтенда в заголовке X-Session-Key
    session_key = models.CharField(max_length=255, unique=True)

    # Когда была создана сессия
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Сессия"
        verbose_name_plural = "Сессии"


    def __str__(self):
        return self.session_key


class Cart(models.Model):
    # Связь с сессией пользователя (один к одному)
    # OneToOneField - у одной сессии может быть только одна корзина
    session = models.OneToOneField(Session,on_delete=models.CASCADE, related_name="cart")  # Обратная связь: session.cart

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Корзина"
        verbose_name_plural = "Корзины"

    def __str__(self):
        return f"Корзина {self.session.session_key}"

    def get_total_price(self):
        # для расчета общей стоимости всех товаров в корзине
        return sum(item.get_total_price() for item in self.items.all())

    def get_total_volume(self):
        # для расчета общего объема всех товаров в корзине (в м³)Нужен для расчета скидок при большом объеме
        return sum(item.get_total_volume() for item in self.items.all())


class CartItem(models.Model):
    # Связь с корзиной - в какой корзине находится этот товар
    cart = models.ForeignKey(Cart,on_delete=models.CASCADE,related_name="items")  # Обратная связь: cart.items.all()
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE) # Связь с вариантом товара - какой конкретно вариант добавлен
    quantity = models.PositiveIntegerField(default=1, verbose_name="Количество") # Количество единиц этого товара в корзине
    # Цена на момент добавления в корзину
    price_at_moment = models.DecimalField(max_digits=12,decimal_places=2,verbose_name="Цена на момент добавления")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Товар в корзине"
        verbose_name_plural = "Товары в корзине"

        # в одной корзине. Вместо дублей увеличивается quantity
        unique_together = ('cart', 'variant')

    def __str__(self):
        return f"{self.variant} x {self.quantity}"

    def get_total_price(self):
        #Расчет стоимости этой позиции в корзине
        return self.price_at_moment * self.quantity

    def get_total_volume(self):
        #Расчет объема этой позиции в м³
        return self.variant.calculate_volume_m3() * self.quantity


class OrderStatus(models.Model):
    # Название статуса (например, "Новый", "Подтвержден", "Отменен")
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        verbose_name = "Статус заказа"
        verbose_name_plural = "Статусы заказа"

    def __str__(self):
        return self.name


class Order(models.Model):
    # генерируется yникальный номер заказа
    order_number = models.CharField(max_length=50, unique=True, verbose_name="Номер заказа")

    # Связь с корзиной, из которой был создан заказ
    cart = models.ForeignKey(Cart, on_delete=models.PROTECT, related_name="orders")

    #     Информация о клиенте
    client_name = models.CharField(max_length=255, verbose_name="ФИО клиента")
    client_surname = models.CharField(max_length=255, verbose_name="Фамилия клиента")
    client_patronymic = models.CharField(max_length=255, verbose_name="Отчество клиента", blank=True)
    phone = models.CharField(max_length=20, verbose_name="Телефон")
    email = models.EmailField(verbose_name="Email", blank=True)
    comment = models.TextField(verbose_name="Комментарий", blank=True)

    #     Статус и метаданные
    status = models.ForeignKey(OrderStatus, on_delete=models.PROTECT) # Текущий статус заказа

    # ID чата в Telegram (сохраняется когда клиент переходит в бота)
    telegram_chat_id = models.CharField(max_length=100, verbose_name="Telegram Chat ID", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True) # Дата создания заказа
    updated_at = models.DateTimeField(auto_now=True)# Дата последнего обновления

    class Meta:
        verbose_name = "Заказ"
        verbose_name_plural = "Заказы"
        ordering = ['-created_at']  # Сортировка: новые заказы первыми

    def __str__(self):
        return f"Заказ №{self.order_number}"

    def get_total_price(self):
        return sum(item.price * item.quantity for item in self.items.all())


class OrderItem(models.Model):
    # Связь с заказом - в каком заказе этот товар
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")  # Обратная связь: order.items.all()

    # Связь с вариантом товара
    variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(verbose_name="Количество") # Количество единиц в заказе


    price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Цена на момент заказа") # Цена на момент оформления заказа

    class Meta:
        verbose_name = "Товар в заказе"
        verbose_name_plural = "Товары в заказе"

    def __str__(self):
        return f"{self.variant} x {self.quantity}"


class CallbackRequest(models.Model):
    phone = models.CharField(max_length=20, verbose_name="Телефон")
    created_at = models.DateTimeField(auto_now_add=True)
    is_processed = models.BooleanField(default=False, verbose_name="Обработан")  # Обработана ли заявка (менеджер позвонил или нет)

    class Meta:
        verbose_name = "Запрос на звонок"
        verbose_name_plural = "Запросы на звонок"
        ordering = ['-created_at']  # Новые заявки первыми

    def __str__(self):
        return f"Звонок: {self.phone} ({self.created_at.strftime('%d.%m.%Y %H:%M')})"
# Create your models here.

class SiteSettings(models.Model):
    phone = models.CharField(max_length=50, default='+7 (888) 888-88-88', verbose_name="Телефон")
    email = models.EmailField(default='adress_email.ru', verbose_name="Email")
    address = models.CharField(max_length=255, default='г. Томск, ул. Кузовлевский тракт, 2Б ст31', verbose_name="Адрес")
    work_hours = models.CharField(max_length=255, default='Пн-Пт: 9:00-18:00, Сб: 10:00-16:00', verbose_name="Режим работы")
    footer_text = models.CharField(max_length=255, default='© 2026 ООО «СДК». Все права защищены.', verbose_name="Текст в футере")
    contact_text = models.TextField(default='Нужна консультация? Оставьте свой номер — мы перезвоним и ответим на все вопросы.', verbose_name="Текст в блоке консультации")
    
    class Meta:
        verbose_name = "Настройки сайта"
        verbose_name_plural = "Настройки сайта"
    
    def __str__(self):
        return "Настройки сайта"
