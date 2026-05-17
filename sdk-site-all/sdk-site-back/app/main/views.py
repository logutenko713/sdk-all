"""from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Price
from .serializers import PriceUpsertSerializer

@api_view(["POST"])
def upsert_price(request):
    ser = PriceUpsertSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    data = ser.validated_data

    obj, created = Price.objects.update_or_create(
        product=data["product"],
        grade=data.get("grade"),
        surface=data.get("surface"),
        width=data.get("width"),
        defaults={"price_rub": data["price_rub"]},
    )

    return Response(
        {"id": obj.id, "created": created, "price_rub": str(obj.price_rub)},
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
    )"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Prefetch
from django.utils.crypto import get_random_string
from datetime import datetime
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from django.conf import settings
from django.core.mail import send_mail
from rest_framework import viewsets, permissions
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token

from .models import (
    Product, ProductVariant, Cart, CartItem, Grade, Surface, Width,
    Order, OrderItem, CallbackRequest, Session, OrderStatus, CarouselSection, Documentation, TableCatalog2, PlywoodCatalog, SiteSettings
)

from .serializers import (
    ProductListSerializer, ProductDetailSerializer, ProductVariantSerializer, GradeSerializer, SurfaceSerializer,
    CartSerializer, AddToCartSerializer, UpdateCartItemSerializer, WidthSerializer,
    OrderSerializer, CreateOrderSerializer, CallbackRequestSerializer, CarouselSectionSerializer,
    DocumentationSerializer, TableCatalog2Serializer, PlywoodCatalogSerializer, SiteSettingsSerializer
)


def get_or_create_session(request):
    """
    Эта функция проверяет есть ли у пользователя сессия
    Фронтенд должен отправлять ключ сессии в заголовке X-Session-Key
    Если ключа нет - создаем новую сессию
    """
    session_key = request.headers.get('X-Session-Key')

    if not session_key: # Ключа нет - генерируем новый ключ (32 символа)
        session_key = get_random_string(32)

    session, _ = Session.objects.get_or_create(session_key=session_key) # Получаем сессию
    return session


class AdminLoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        # Проверяем, что пользователь имеет права администратора
        if not user.is_staff:
            return Response({'error': 'Доступ запрещен'}, status=403)

        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'is_staff': user.is_staff
        })

# АДМИНСКИЕ VIEWSET'S (FULL CRUD)
class AdminProductViewSet(viewsets.ModelViewSet):
    """Управление товарами (CRUD)"""
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminProductVariantViewSet(viewsets.ModelViewSet):
    """Управление вариантами товаров (CRUD)"""
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminGradeViewSet(viewsets.ModelViewSet):
    """Управление сортами (CRUD)"""
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminSurfaceViewSet(viewsets.ModelViewSet):
    """Управление поверхностями (CRUD)"""
    queryset = Surface.objects.all()
    serializer_class = SurfaceSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminWidthViewSet(viewsets.ModelViewSet):
    """Управление ширинами (CRUD)"""
    queryset = Width.objects.all()
    serializer_class = WidthSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminTableCatalog2ViewSet(viewsets.ModelViewSet):
    """Управление таблицей каталога 2 (CRUD)"""
    queryset = TableCatalog2.objects.all()
    serializer_class = TableCatalog2Serializer
    permission_classes = [permissions.IsAdminUser]

class AdminPlywoodCatalogViewSet(viewsets.ModelViewSet):
    """Управление таблицей каталога 3 (CRUD)"""
    queryset = PlywoodCatalog.objects.all()
    serializer_class = PlywoodCatalogSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminDocumentationViewSet(viewsets.ModelViewSet):
    """Управление документацией (CRUD)"""
    queryset = Documentation.objects.all()
    serializer_class = DocumentationSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminCarouselViewSet(viewsets.ModelViewSet):
    """Управление каруселью (CRUD)"""
    queryset = CarouselSection.objects.all()
    serializer_class = CarouselSectionSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminOrderViewSet(viewsets.ModelViewSet):
    """Управление заказами (CRUD + обновление статуса)"""
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Обновить статус заказа"""
        order = self.get_object()
        new_status_id = request.data.get('status_id')
        if new_status_id:
            order.status_id = new_status_id
            order.save()
            return Response({'message': 'Статус обновлён'})
        return Response({'error': 'status_id required'}, status=400)

class AdminCallbackViewSet(viewsets.ModelViewSet):
    """Управление заявками на звонок (CRUD)"""
    queryset = CallbackRequest.objects.all()
    serializer_class = CallbackRequestSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['post'])
    def mark_processed(self, request, pk=None):
        """Отметить заявку как обработанную"""
        callback = self.get_object()
        callback.is_processed = True
        callback.save()
        return Response({'message': 'Заявка отмечена как обработанная'})

class PlywoodCatalogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PlywoodCatalog.objects.filter(is_active = True)
    serializer_class = PlywoodCatalogSerializer
    permission_classes = [permissions.AllowAny]

class TableCatalog2ViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TableCatalog2.objects.filter(is_active=True)
    serializer_class = TableCatalog2Serializer
    permission_classes = [permissions.AllowAny]

class DocumentationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Documentation.objects.filter(is_active=True)
    serializer_class = DocumentationSerializer
    permission_classes = [permissions.AllowAny]  # Доступно всем пользователям

class CarouselSectionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CarouselSection.objects.filter(is_active=True).order_by('created_at')
    serializer_class = CarouselSectionSerializer

class ProductViewSet(viewsets.ReadOnlyModelViewSet): # API для работы с товарами
    #ViewSet только для чтения (ReadOnly) - можно только получать данные
    #Создание/изменение/удаление товаров только через админку

    queryset = Product.objects.filter(is_active=True).prefetch_related(
        Prefetch(
            'variants',
            queryset=ProductVariant.objects.filter(is_active=True)  # убрали select_related
        ),
        'grades',
        'surfaces',
        'widths',
    )

    def get_serializer_class(self):
        """
        Выбираем какой сериализатор использовать:
        - Для списка товаров - краткая информация (ProductListSerializer)
        - Для детального просмотра - полная информация (ProductDetailSerializer)
        """
        # Всегда отдаём подробные данные, чтобы фронт мог построить карточки
        return ProductDetailSerializer

    @action(detail=True, methods=['get'])
    def variants(self, request, pk=None):
        """
        Кастомный endpoint для получения вариантов товара
        URL: /api/products/{id}/variants/

        Параметры фильтрации (опционально):
        - grade_id: фильтр по сорту
        - surface_id: фильтр по поверхности
        - width_id: фильтр по ширине
        """
        product = self.get_object() # Получаем товар по ID

        # Получаем все активные варианты этого товара
        # select_related - оптимизация, подгружаем связанные объекты сразу
        variants = ProductVariant.objects.filter(product=product, is_active=True)

        #   Фильтрация по параметрам из URL
        grade_id = request.query_params.get('grade_id')
        surface_id = request.query_params.get('surface_id')
        width_id = request.query_params.get('width_id')

        # Применяем фильтры если они переданы
        if grade_id:
            variants = variants.filter(grade_id=grade_id)
        if surface_id:
            variants = variants.filter(surface_id=surface_id)
        if width_id:
            variants = variants.filter(width_id=width_id)

        # Преобразуем в JSON и отправляем
        serializer = ProductVariantSerializer(variants, many=True)
        return Response(serializer.data)


class CartViewSet(viewsets.ViewSet): # API для работы с корзиной

    def get_cart(self, request):
        """
        Вспомогательный метод для получения корзины текущего пользователя
        """
        session = get_or_create_session(request)

        cart, _ = Cart.objects.get_or_create(session=session) # Получаем или создаем корзину для этой сессии
        return cart

    def retrieve(self, request): #Получить содержимое корзины пользователя
        cart = self.get_cart(request) # Получаем корзину
        serializer = CartSerializer(cart) # Преобразуем в JSON

        # Отправляем ответ с корзиной и ключом сессии
        return Response({
            'cart': serializer.data,
            'session_key': cart.session.session_key
        })

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """
        Ожидаемые данные в теле запроса:
        {
            "variant_id": 123,
            "quantity": 2
        }
        """
        # Валидируем входные данные
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)  # Если невалидно - ошибка 400

        # Получаем корзину пользователя
        cart = self.get_cart(request)

        # Извлекаем данные
        variant_id = serializer.validated_data['variant_id']
        quantity = serializer.validated_data['quantity']

        # Проверяем что вариант товара существует и активен если не найден - ошибка 404
        variant = get_object_or_404(ProductVariant, id=variant_id, is_active=True)

        # Пытаемся получить существующий товар в корзине или создать новый
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            variant=variant,
            defaults={
                'quantity': quantity,  # Если создаем новый - ставим указанное количество
                'price_at_moment': variant.price_per_m3  # Сохраняем текущую цену
            }
        )

        # Если товар уже был в корзине - увеличиваем количество
        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        # Отправляем обновленную корзину и ключ сессии
        cart_serializer = CartSerializer(cart)
        return Response({
            'cart': cart_serializer.data,
            'session_key': cart.session.session_key
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['patch'], url_path='items/(?P<item_id>[^/.]+)')
    def update_item(self, request, item_id=None):
        """
        PATCH /api/cart/items/{item_id}/
        Изменить количество товара в корзине

        Ожидаемые данные:
        {
            "quantity": 5
        }
        """
        # Получаем корзину
        cart = self.get_cart(request)

        # Находим товар в корзине или выдаем 404
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)

        # Валидируем новое количество
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Обновляем количество
        cart_item.quantity = serializer.validated_data['quantity']
        cart_item.save()

        # Отправляем обновленную корзину
        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data)

    @action(detail=False, methods=['delete'], url_path='items/(?P<item_id>[^/.]+)')
    def remove_item(self, request, item_id=None):
        """
        DELETE /api/cart/items/{item_id}/
        Удалить товар из корзины
        """
        # Получаем корзину
        cart = self.get_cart(request)

        # Находим товар в корзине или выдаем 404
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)

        # Удаляем товар
        cart_item.delete()

        # Отправляем обновленную корзину
        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data)

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """
        DELETE /api/cart/clear/
        Очистить всю корзину
        """
        # Получаем корзину
        cart = self.get_cart(request)

        # Удаляем все товары из корзины
        cart.items.all().delete()

        # Отправляем пустую корзину
        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data)


class OrderViewSet(viewsets.ModelViewSet): # API для работы с заказами
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def create(self, request):
        # Получаем или создаём сессию
        session = get_or_create_session(request)
        
        # Получаем или создаём корзину для этой сессии
        cart, _ = Cart.objects.get_or_create(session=session)
        
        # Получаем или создаём статус "Новый"
        status_obj, _ = OrderStatus.objects.get_or_create(name='Новый')
        
        # Создаём заказ
        order = Order.objects.create(
            order_number=f"ORD-{datetime.now().strftime('%Y%m%d')}-{get_random_string(6, '0123456789')}",
            cart=cart,
            client_name=request.data.get('client_name', ''),
            client_surname=request.data.get('client_surname', ''),
            client_patronymic=request.data.get('client_patronymic', ''),
            phone=request.data.get('phone', ''),
            email=request.data.get('email', ''),
            comment=request.data.get('comment', ''),
            status=status_obj
        )
        
        return Response({'status': 'ok', 'order_id': order.id}, status=201)

        

    def _notify_telegram(self, order: Order, cart_items):
        token = settings.TELEGRAM_BOT_TOKEN
        chat_id = settings.TELEGRAM_CHAT_ID
        if not token or not chat_id:
            return

        lines = [
            "🧾 *Новый заказ*",
            f"№ `{order.order_number}`",
            f"Клиент: *{order.client_surname} {order.client_name} {order.client_patronymic or ''}*".strip(),
            f"Телефон: `{order.phone}`",
        ]

        if order.email:
            lines.append(f"Email: `{order.email}`")
        if order.comment:
            lines.append(f"Комментарий: {order.comment}")

        lines.append("Позиции:")
        total = 0

        for item in cart_items:
            variant = item.variant
            product = variant.product

            width = variant.width.value if variant.width else '-'
            grade = variant.grade.name if variant.grade else '-'
            surface = variant.surface.name if variant.surface else '-'

            dimensions = f"{variant.thickness}x{width}x{variant.length}"
            price = item.price_at_moment
            line_total = price * item.quantity
            total += line_total

            lines.append(
                f"• {product.name} | {dimensions} | {surface} | сорт {grade} | {price} x {item.quantity} = {line_total}"
            )

        lines.append(f"Итого: *{total}*")

        message = "\n".join(lines)

        try:
            url = f"https://api.telegram.org/bot{token}/sendMessage"
            data = urlencode({
                "chat_id": chat_id,
                "text": message,
                "parse_mode": "Markdown"
            }).encode("utf-8")
            req = Request(url, data=data)
            with urlopen(req, timeout=10) as resp:
                resp.read()
        except Exception as exc:
            # Не блокируем создание заказа из-за проблем с Telegram
            print(f"Telegram notify error: {exc}")

    def _notify_email(self, order: Order, cart_items):
        to_email = settings.EMAIL_ADMIN
        if not to_email or not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
            return

        lines = [
            f"Новый заказ №{order.order_number}",
            f"Клиент: {order.client_surname} {order.client_name} {order.client_patronymic or ''}".strip(),
            f"Телефон: {order.phone}",
        ]

        if order.email:
            lines.append(f"Email: {order.email}")
        if order.comment:
            lines.append(f"Комментарий: {order.comment}")

        lines.append("Позиции:")
        total = 0

        for item in cart_items:
            variant = item.variant
            product = variant.product

            width = variant.width.value if variant.width else '-'
            grade = variant.grade.name if variant.grade else '-'
            surface = variant.surface.name if variant.surface else '-'

            dimensions = f"{variant.thickness}x{width}x{variant.length}"
            price = item.price_at_moment
            line_total = price * item.quantity
            total += line_total

            lines.append(
                f"- {product.name} | {dimensions} | {surface} | сорт {grade} | {price} x {item.quantity} = {line_total}"
            )

        lines.append(f"Итого: {total}")

        subject = f"Новый заказ №{order.order_number}"
        message = "\n".join(lines)

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to_email],
                fail_silently=False,
            )
        except Exception as exc:
            print(f"Email notify error: {exc}")

    @action(detail=True, methods=['get'])
    def telegram_link(self, request, pk=None):
        """
        Получить ссылку для перехода в Telegram бота с данными заказа

        Эта ссылка отправляется на фронтенд после создания заказа
        При переходе по ней открывается Telegram бот с информацией о заказе
        """
        # Получаем заказ по ID
        order = self.get_object()

        # Формируем ссылку на бота с параметром заказа
        # ВАЖНО: Замените "ваш_бот_username" на настоящее имя вашего бота
        bot_username = "ваш_бот_username"

        # Формат ссылки: https://t.me/bot_username?start=order_123
        # Параметр start=order_123 передается боту при запуске
        telegram_url = f"https://t.me/{bot_username}?start=order_{order.id}"

        return Response({
            'telegram_url': telegram_url,
            'order_id': order.id,
            'order_number': order.order_number
        })


class CallbackRequestViewSet(viewsets.ModelViewSet):
    """
    Для заявок на обратный звонок
    Разрешены только GET (список) и POST (создание)
    """
    queryset = CallbackRequest.objects.all()
    serializer_class = CallbackRequestSerializer
    http_method_names = ['get', 'post']  # Только чтение и создание

    def create(self, request):
        """
        Создать запрос на обратный звонок
        Ожидаемые данные:
                {
                    "phone": "+79001234567"
                }
                """
        # Валидируем данные
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Сохраняем заявку в базу
        serializer.save()

        # Отправляем подтверждение пользователю
        return Response(
            {'message': 'Заявка принята. Мы свяжемся с вами в ближайшее время.'},
            status=status.HTTP_201_CREATED
        )
    
class SiteSettingsViewSet(viewsets.ModelViewSet):
    queryset = SiteSettings.objects.all()
    serializer_class = SiteSettingsSerializer
    permission_classes = [permissions.AllowAny]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']