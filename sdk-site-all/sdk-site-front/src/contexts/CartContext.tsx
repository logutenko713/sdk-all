import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { CartItem, Product, ProductVariant } from '@types';
import { apiService } from '../services/api';

type CartAction =
    | { type: 'ADD_ITEM'; payload: CartItem }
    | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
    | { type: 'REMOVE_ITEM'; payload: string }
    | { type: 'CLEAR_CART' }
    | { type: 'SET_ITEMS'; payload: CartItem[] }
    | { type: 'OPEN_CART' }
    | { type: 'CLOSE_CART' };

interface CartState {
    items: CartItem[];
    isOpen: boolean;
}

interface CartContextType {
    state: CartState;
    addItem: (product: Product, variant: ProductVariant, quantity: number) => void;
    updateQuantity: (id: string, quantity: number) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    getTotalPrice: () => number;
    getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialState: CartState = {
    items: [],
    isOpen: false
};

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM':
            const existingItem = state.items.find(item => item.id === action.payload.id);
            if (existingItem) {
                return {
                    ...state,
                    items: state.items.map(item =>
                        item.id === action.payload.id
                            ? { ...item, quantity: item.quantity + action.payload.quantity }
                            : item
                    )
                };
            } else {
                return {
                    ...state,
                    items: [...state.items, action.payload]
                };
            }
        case 'UPDATE_QUANTITY':
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === action.payload.id
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                )
            };
        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload)
            };
        case 'CLEAR_CART':
            return {
                ...state,
                items: []
            };
        case 'SET_ITEMS':
            return {
                ...state,
                items: action.payload
            };
        case 'OPEN_CART':
            return { ...state, isOpen: true };
        case 'CLOSE_CART':
            return { ...state, isOpen: false };
        default:
            return state;
    }
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    const syncItems = (items: CartItem[]) => {
        dispatch({ type: 'SET_ITEMS', payload: items });
    };

    const addItem = (product: Product, variant: ProductVariant, quantity: number) => {
        const cartItem: CartItem = {
            id: `${product.id}-${variant.id}`,
            productId: product.id,
            variantId: variant.id,
            name: product.name,
            price: variant.price,
            quantity: quantity,
            dimensions: variant.dimensions,
            woodType: variant.woodType,
            grade: variant.grade,
            image: product.image,
            maxStock: variant.stock
        };

        dispatch({ type: 'ADD_ITEM', payload: cartItem });

        apiService.addToCart(variant.id, quantity)
            .then(syncItems)
            .catch((err) => {
                console.error('Ошибка добавления в корзину (сервер):', err);
            });
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(id);
            return;
        }
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });

        apiService.updateCartItem(id, quantity)
            .then(syncItems)
            .catch((err) => {
                console.error('Ошибка обновления корзины (сервер):', err);
            });
    };

    const removeItem = (id: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: id });

        apiService.removeCartItem(id)
            .then(syncItems)
            .catch((err) => {
                console.error('Ошибка удаления из корзины (сервер):', err);
            });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });

        apiService.clearCart()
            .then(syncItems)
            .catch((err) => {
                console.error('Ошибка очистки корзины (сервер):', err);
            });
    };

    const openCart = () => {
        dispatch({ type: 'OPEN_CART' });
    };

    const closeCart = () => {
        dispatch({ type: 'CLOSE_CART' });
    };

    const getTotalPrice = (): number => {
        return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getTotalItems = (): number => {
        return state.items.reduce((total, item) => total + item.quantity, 0);
    };

    const value: CartContextType = {
        state,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        openCart,
        closeCart,
        getTotalPrice,
        getTotalItems
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};