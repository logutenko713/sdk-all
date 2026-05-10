import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

from main.models import Product, ProductVariant, Width

# Получаем товар "Доска" (если нет — создаём)
product, created = Product.objects.get_or_create(
    name='Доска обрезная',
    defaults={
        'category': 'Пиломатериалы',
        'is_active': True
    }
)

print(f'Товар: {product.name} ({"создан" if created else "уже есть"})')

# Удаляем старые варианты этого товара (чтобы не было дублей)
ProductVariant.objects.filter(product=product).delete()
print('Старые варианты удалены')

# Данные для вариантов: (ширина, толщина, длина, цена)
variants_data = [
    (100, 25, 4, 150),
    (100, 25, 6, 225),
    (120, 25, 4, 180),
    (120, 25, 6, 270),
    (150, 25, 4, 225),
    (150, 25, 6, 340),
    (180, 25, 4, 270),
    (180, 25, 6, 405),
    (200, 25, 4, 300),
    (200, 25, 6, 450),
]

count = 0
for width_val, thickness_val, length_val, price in variants_data:
    # Получаем или создаём ширину
    width, _ = Width.objects.get_or_create(value=width_val)
    
    # Создаём вариант
    variant = ProductVariant.objects.create(
        product=product,
        width=width,
        thickness=thickness_val,
        length=length_val,
        price_per_m3=price,
        is_active=True
    )
    count += 1
    print(f'Добавлен: {width_val}×{thickness_val}×{length_val} м — {price} ₽/м³')

print(f'\n✅ Готово! Добавлено {count} вариантов для товара "{product.name}"')