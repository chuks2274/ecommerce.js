# NYStore eCommerce Web App

## Overview
NYStore is a responsive eCommerce web application that allows users to browse products, manage their cart, checkout securely, and manage their profile.

## Key Benefits for Users
- **User-Friendly Interface:** Smooth navigation and responsive design for desktop and mobile.  
- **Secure Authentication:** Registration, login, and password management with secure storage.  
- **Personalized Cart Management:** Add, update, or remove products with real-time updates.  
- **Smooth Checkout Experience:** Clear summary, quantity adjustments, and confirmation alerts.  
- **Floating Notifications:** Real-time success/error messages guide user actions.  
- **Profile Control:** Update personal information or delete account.  
- **Reliable Product Loading:** Dynamic product fetching from backend API.

## Problem Solved
- Difficulty finding and browsing products online.  
- Confusing checkout processes.  
- Manual cart management and tracking.  
- Lack of secure account handling.  
- No real-time feedback for actions.

## Technologies Used
- HTML5, CSS, Bootstrap 5.3  
- JavaScript (ES Modules), Axios  
- LocalStorage for cart and user persistence  
- Jest for testing  
- Vercel for CI/CD deployment

## Pages & Features

### Home Page
- Hero section with CTA
- Auth-aware navbar with cart icon
- Dynamic cart badge

### Store Page
- Product grid with "Add to Cart"
- Floating messages for user actions
- Navbar updates based on authentication

### Checkout Page
- Displays cart items, quantity controls, and summary
- Place order functionality clears cart
- Auth-aware navigation

### Login Page
- Email/password login
- "Remember Me" option
- Navbar and cart update dynamically

### Register Page
- Name, email, password, address registration
- Auto-login after registration
- Inline feedback messages

### Profile Page
- View and update name, email, address
- Delete account functionality
- Navbar updates dynamically

### Reset Password Page
- Enter and confirm new password
- Inline feedback messages
- Redirects to login after success

### Core JavaScript (`script.js`, `auth.js`, `password.js`)
- Authentication (register, login, logout, profile update)
- Cart management and persistence
- Product listing and checkout
- Floating notifications and navbar updates
- Utilities: `navigateTo()`, `getCurrentUser()`, `showMessage()`

### Styles (`styles.css`)
- Responsive layout for all pages
- Navbar, buttons, cards, checkout, profile styling
- Floating message styling
- Custom scrollbars
- Mobile and tablet responsiveness

### Testing (Jest)
- Auth module tests
- Cart management tests
- Navigation tests
- Checkout rendering tests

### CI/CD Workflow
- GitHub Actions workflow for testing and deploying to Vercel
- Steps: checkout, Node.js setup, install ESLint & Vercel CLI, lint, deploy

## How to Install

1. **Clone the repository**  
```bash
git clone <repository-url>
cd <repository-folder>