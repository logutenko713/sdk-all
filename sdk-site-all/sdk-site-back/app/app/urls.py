from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from main import views

router = DefaultRouter()
router.register(r'products', views.ProductViewSet, basename='product') # viewset для товаров
router.register(r'cart', views.CartViewSet, basename='cart') # viewset для корзины
router.register(r'orders', views.OrderViewSet, basename='order') # viewset для заказов
router.register(r'callbacks', views.CallbackRequestViewSet, basename='callback') # viewset для запросов
router.register(r'carousel', views.CarouselSectionViewSet, basename='carousel')
router.register(r'documentation', views.DocumentationViewSet, basename='documentation')
router.register(r'table2', views.TableCatalog2ViewSet, basename='table2')
router.register(r'table3', views.PlywoodCatalogViewSet, basename='table3')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)