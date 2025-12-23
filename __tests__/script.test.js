/**
 * @jest-environment jsdom
 */

// ================================
// SAFE NAVIGATION MOCK (jsdom-safe)
// ================================
beforeAll(() => {
    window.mockHref = '';
});

// ================================
// IMPORT MODULES
// ================================
import * as AuthModule from '../js/auth.js';
import * as ScriptModule from '../js/script.js';

// ================================
// RESET STATE BEFORE EACH TEST
// ================================
beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `<span id="cart-count"></span>`;
    window.mockHref = '';
});

// ================================
// AUTH MODULE TESTS
// ================================
describe('Auth Module', () => {
    test('getCurrentUser returns null if no active user', () => {
        expect(AuthModule.getCurrentUser()).toBeNull();
    });

    test('logout removes activeUser and navigates to login.html', () => {
        localStorage.setItem(
            'activeUser',
            JSON.stringify({ name: 'test', email: 'test@test.com' })
        );

        AuthModule.logout();

        expect(AuthModule.getCurrentUser()).toBeNull();
        expect(window.mockHref).toBe('login.html');
    });

    test('logout does not fail if no active user', () => {
        expect(() => AuthModule.logout()).not.toThrow();
        expect(AuthModule.getCurrentUser()).toBeNull();
        expect(window.mockHref).toBe('login.html');
    });
});

// ================================
// CART MODULE TESTS
// ================================
describe('Cart Module', () => {
    const { getCartKey, saveCart, cartCount, updateCartUI } = ScriptModule;

    test('getCartKey returns correct guest key', () => {
        expect(getCartKey()).toBe('fs_cart_guest');
    });

    test('saveCart stores cart in localStorage correctly', () => {
        const cart = [{ id: 1, qty: 2 }];
        saveCart(cart);

        const storedCart = JSON.parse(localStorage.getItem(getCartKey()));
        expect(storedCart).toEqual(cart);
    });

    test('cartCount returns 0 for empty cart', () => {
        expect(cartCount()).toBe(0);
    });

    test('cartCount returns correct total quantity', () => {
        const cart = [
            { id: 1, qty: 2 },
            { id: 2, qty: 3 }
        ];
        saveCart(cart);

        expect(cartCount()).toBe(5);
    });

    test('updateCartUI updates cart count element if it exists', () => {
        const cartCountEl = document.getElementById('cart-count');
        const cart = [{ id: 1, qty: 2 }];

        saveCart(cart);
        updateCartUI();

        // jsdom keeps numbers as numbers
        expect(Number(cartCountEl.innerText)).toBe(2);
    });

    test('updateCartUI does not fail if cart-count element missing', () => {
        document.body.innerHTML = ``;
        expect(() => updateCartUI()).not.toThrow();
    });

    test('saveCart handles empty array', () => {
        saveCart([]);
        expect(JSON.parse(localStorage.getItem(getCartKey()))).toEqual([]);
    });

    test('cartCount handles empty cart in localStorage', () => {
        localStorage.removeItem(getCartKey());
        expect(cartCount()).toBe(0);
    });
});

// ================================
// NAVIGATION TEST
// ================================
describe('Navigation', () => {
    const { navigateTo } = ScriptModule;

    test('navigateTo sets mockHref instead of real navigation', () => {
        navigateTo('checkout.html');
        expect(window.mockHref).toBe('checkout.html');
    });
});

// ================================
// CHECKOUT / RENDER FUNCTIONS
// ================================
describe('Checkout / Render Functions', () => {
    const { renderCheckout } = ScriptModule;

    test('renderCheckout runs without throwing', () => {
        expect(() => renderCheckout()).not.toThrow();
    });

    test('renderCheckout triggers navigation if user not logged in', () => {
        // renderCheckout only navigates if checkout container exists
        document.body.innerHTML = `<div id="checkout-container"></div>`;
        renderCheckout();

        expect(window.mockHref).toBe('login.html');
    });
});