from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from main import views

router = DefaultRouter()
# ПУБЛИЧНЫЕ API (для сайта)
router.register(r'cart', views.CartViewSet, basename='cart')
router.register(r'orders', views.OrderViewSet, basename='order')
router.register(r'callbacks', views.CallbackRequestViewSet, basename='callback')
router.register(r'carousel', views.CarouselSectionViewSet, basename='carousel')
router.register(r'documentation', views.DocumentationViewSet, basename='documentation')
router.register(r'table1', views.ProductViewSet, basename='table1')
router.register(r'table2', views.TableCatalog2ViewSet, basename='table2')
router.register(r'table3', views.PlywoodCatalogViewSet, basename='table3')
router.register(r'settings', views.SiteSettingsViewSet, basename='settings')

# АДМИНСКИЕ API (для React-админки)
router.register(r'admin/products', views.AdminProductViewSet, basename='admin-product')
router.register(r'admin/grades', views.AdminGradeViewSet, basename='admin-grade')
router.register(r'admin/surfaces', views.AdminSurfaceViewSet, basename='admin-surface')
router.register(r'admin/widths', views.AdminWidthViewSet, basename='admin-width')
router.register(r'admin/table1', views.AdminProductVariantViewSet, basename='admin-table1')
router.register(r'admin/table2', views.AdminTableCatalog2ViewSet, basename='admin-table2')
router.register(r'admin/table3', views.AdminPlywoodCatalogViewSet, basename='admin-table3')
router.register(r'admin/documentation', views.AdminDocumentationViewSet, basename='admin-documentation')
router.register(r'admin/carousel', views.AdminCarouselViewSet, basename='admin-carousel')
router.register(r'admin/orders', views.AdminOrderViewSet, basename='admin-order')
router.register(r'admin/callbacks', views.AdminCallbackViewSet, basename='admin-callback')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/admin/login/', views.AdminLoginView.as_view(), name='admin-login'),
    path('api/', include(router.urls)),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)