/* =====================================================================
   GLOBAL IMPORTS
===================================================================== */
import { setupAuth } from './password.js';
import {
    getCurrentUser,
    logout as authLogout,
    navigateTo
} from './auth.js';

/* =====================================================================
   INITIALIZATION
===================================================================== */

/**
 * Initialize authentication-related page behavior
 */
setupAuth();

/**
 * Base URL for Fake Store API
 * @constant {string}
 */
const API_BASE = 'https://fakestoreapi.com';

/* =====================================================================
   TEXT UTILITIES
===================================================================== */

/**
 * Truncate text to a maximum length without cutting words
 * @param {string} text - Original text
 * @param {number} maxLength - Max character length
 * @returns {string}
 */
function truncateText(text = '', maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

/* =====================================================================
   CART STORAGE HELPERS
===================================================================== */

/**
 * Returns the storage key for the current user's cart
 * @returns {string}
 */
function getCartKey() {
    const user = getCurrentUser();
    return user ? `fs_cart_${user.email}` : 'fs_cart_guest';
}

/**
 * Retrieve cart from localStorage
 * @returns {Array<Object>}
 */
function getCart() {
    return JSON.parse(localStorage.getItem(getCartKey()) || '[]');
}

/**
 * Persist cart to localStorage and refresh UI
 * @param {Array<Object>} cart
 */
function saveCart(cart) {
    localStorage.setItem(getCartKey(), JSON.stringify(cart));
    updateCartUI();
    renderCheckout();
}

/**
 * Add a product to the cart
 * @param {Object} product
 */
function addToCart(product) {
    const user = getCurrentUser();
    if (!user) {
        showFloatingMessage('Please login first!', 'danger');
        return;
    }

    const cart = getCart();
    if (cart.some(item => item.id === product.id)) {
        showFloatingMessage('Product already in cart!', 'danger');
        return;
    }

    cart.push({ ...product, qty: 1 });
    saveCart(cart);
    showFloatingMessage('Product added to cart!', 'success');
}

/**
 * Update item quantity in cart
 * @param {number} id - Product ID
 * @param {number} change - Quantity delta (+1 / -1)
 */
function updateQuantity(id, change) {
    let cart = getCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.qty += change;
    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
    }

    saveCart(cart);
}

/**
 * Remove an item from the cart
 * @param {number} id
 */
function removeItem(id) {
    saveCart(getCart().filter(item => item.id !== id));
}

/* =====================================================================
   CART TOTALS & NAVIGATION UI
===================================================================== */

function cartCount() {
    return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function cartTotalAmount() {
    return getCart()
        .reduce((sum, item) => sum + item.price * item.qty, 0)
        .toFixed(2);
}

function updateCartUI() {
    const cartCountEl = document.getElementById('cart-count');
    if (!cartCountEl) return;

    const count = cartCount();
    cartCountEl.innerText = count;
    cartCountEl.classList.toggle('d-none', count === 0);
}

function updateNav() {
    const btnLoginState = document.getElementById('btn-login-state');
    const btnLogout = document.getElementById('btn-logout');
    const welcomeEl = document.getElementById('nav-welcome');
    const user = getCurrentUser();

    if (user) {
        btnLoginState?.classList.add('d-none');
        btnLogout?.classList.remove('d-none');
        btnLogout && (btnLogout.innerText = 'Logout');

        welcomeEl?.classList.remove('d-none');
        welcomeEl && (welcomeEl.innerText = `Welcome, ${user.name || user.email}`);

        document.getElementById('nav-checkout')?.classList.remove('d-none');
        document.getElementById('nav-cart')?.classList.remove('d-none');
    } else {
        btnLoginState?.classList.remove('d-none');
        btnLogout?.classList.add('d-none');
        welcomeEl?.classList.add('d-none');

        document.getElementById('nav-checkout')?.classList.add('d-none');
        document.getElementById('nav-cart')?.classList.add('d-none');
    }

    updateCartUI();
}

/* =====================================================================
   FLOATING MESSAGES
===================================================================== */

function showFloatingMessage(message, type = 'success', duration = 2000) {
    const el = document.getElementById('floating-message');
    if (!el) return;

    el.className = 'd-none';
    el.textContent = message;

    el.classList.remove('d-none');
    el.classList.add(`message-${type}`, 'show');

    setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => el.classList.add('d-none'), 300);
    }, duration);
}

/* =====================================================================
   STORE PAGE (PRODUCT LISTING)
===================================================================== */

async function loadStoreProducts() {
    const productListEl = document.getElementById('product-list');
    if (!productListEl) return;

    productListEl.innerHTML = 'Loading products...';

    try {
        const { data: products } = await axios.get(`${API_BASE}/products`);
        productListEl.innerHTML = '';

        const row = document.createElement('div');
        row.className = 'row g-4';

        products.forEach(product => {
            const shortDescription = truncateText(product.description, 100);

            const col = document.createElement('div');
            col.className = 'col-12 col-md-6 col-lg-3';
            col.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <img src="${product.image}" class="card-img-top"
                         style="height:200px; object-fit:contain">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.title}</h5>

                        <p class="card-text mb-2 text-truncate-4"
                           title="${product.description}">
                           ${shortDescription}
                        </p>

                        <p class="fw-bold mt-auto">$${product.price.toFixed(2)}</p>
                        <button class="btn btn-primary w-100 btn-add"
                                data-id="${product.id}">
                            Add to Cart
                        </button>
                    </div>
                </div>
            `;
            row.appendChild(col);
        });

        productListEl.appendChild(row);

        const user = getCurrentUser();
        productListEl.querySelectorAll('.btn-add').forEach(btn => {
            btn.disabled = !user;

            btn.addEventListener('click', async () => {
                const id = Number(btn.dataset.id);
                const { data } = await axios.get(`${API_BASE}/products/${id}`);
                addToCart(data);
            });
        });

    } catch (error) {
        console.error(error);
        productListEl.innerHTML =
            `<div class="alert alert-danger">Failed to load products.</div>`;
    }
}

/* =====================================================================
   CHECKOUT PAGE
===================================================================== */

/**
 * Render checkout UI and bind interactions
 */
function renderCheckout() {
    const checkoutEl = document.getElementById('checkout-container');
    if (!checkoutEl) return;

    const user = getCurrentUser();
    if (!user) return navigateTo('login.html');

    const cart = getCart();
    if (cart.length === 0) {
        checkoutEl.innerHTML = `<div class="fs-4 text-center">Your cart is empty.</div>`;
        return;
    }

    checkoutEl.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'row g-4';

    cart.forEach(item => {
        const shortDescription = truncateText(item.description, 100);

        const col = document.createElement('div');
        col.className = 'col-12 col-md-6 col-lg-3';
        col.innerHTML = `
            <div class="card h-100 shadow-sm">
                <img src="${item.image}" class="card-img-top"
                     style="height:200px; object-fit:contain">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${item.title}</h5>

                    <p class="card-text text-truncate-4"
                       title="${item.description}">
                       ${shortDescription}
                    </p>

                    <p class="fw-bold mt-auto">
                        $${(item.price * item.qty).toFixed(2)}
                    </p>

                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <div>
                            <button class="btn btn-outline-secondary btn-sm qty-decrease"
                                    data-id="${item.id}">−</button>
                            <span class="fw-bold">${item.qty}</span>
                            <button class="btn btn-outline-secondary btn-sm qty-increase"
                                    data-id="${item.id}">+</button>
                        </div>
                        <button class="btn btn-danger btn-sm remove-btn ms-2"
                                data-id="${item.id}">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
        row.appendChild(col);
    });

    checkoutEl.appendChild(row);

    // Quantity + remove handlers
    checkoutEl.querySelectorAll('.qty-increase, .qty-decrease, .remove-btn')
        .forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.dataset.id);
                if (btn.classList.contains('qty-increase')) updateQuantity(id, 1);
                if (btn.classList.contains('qty-decrease')) updateQuantity(id, -1);
                if (btn.classList.contains('remove-btn')) removeItem(id);
                renderCheckout();
            });
        });

    // Cart summary & place order
    const summary = document.createElement('div');
    summary.className = 'checkout-summary p-4 border rounded bg-light mx-auto mt-4';
    summary.style.maxWidth = '400px';
    summary.innerHTML = `
        <h5>Cart Summary</h5>
        <p><strong>Total Items:</strong> ${cartCount()}</p>
        <p><strong>Total Amount:</strong> $${cartTotalAmount()}</p>
        <button id="place-order-btn" class="btn btn-success w-100">
            <span id="placeOrderText">Place Order</span>
            <span id="placeOrderSpinner"
                  class="spinner-border spinner-border-sm d-none ms-2"></span>
        </button>
    `;
    checkoutEl.appendChild(summary);

    document.getElementById('place-order-btn')?.addEventListener('click', async () => {
        const text = document.getElementById('placeOrderText');
        const spinner = document.getElementById('placeOrderSpinner');

        text.textContent = 'Placing...';
        spinner.classList.remove('d-none');

        await new Promise(r => setTimeout(r, 1200));
        localStorage.removeItem(getCartKey());
        updateCartUI();
        renderCheckout();
        showFloatingMessage('Order placed successfully!');
        setTimeout(() => navigateTo('store.html'), 1500);
    });
}


/* =====================================================================
   GLOBAL EVENT LISTENERS
===================================================================== */
document.getElementById('btn-login-state')
    ?.addEventListener('click', () => navigateTo('login.html'));

document.getElementById('btn-logout')
    ?.addEventListener('click', authLogout);

document.getElementById('cart-btn')
    ?.addEventListener('click', () => navigateTo('checkout.html'));

/* =====================================================================
   PAGE LOAD
===================================================================== */
window.addEventListener('DOMContentLoaded', () => {
    updateNav();
    loadStoreProducts();
    renderCheckout();
});

/* =====================================================================
   EXPORTS (Testing / Reuse)
===================================================================== */
export {
    navigateTo,
    getCartKey,
    getCart,
    saveCart,
    addToCart,
    updateQuantity,
    removeItem,
    cartCount,
    cartTotalAmount,
    updateCartUI,
    updateNav,
    showFloatingMessage,
    loadStoreProducts,
    renderCheckout
};
