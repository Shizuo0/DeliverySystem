# Delivery System Frontend

Frontend React application for the Delivery System, built with Vite.

## Technologies

- React 18
- Vite
- React Router DOM
- Axios
- Context API for state management

## Project Structure

```
src/
├── components/        # Reusable components
│   └── ProtectedRoute.jsx
├── context/          # Global state management
│   └── AuthContext.jsx
├── pages/            # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Profile.jsx
│   ├── Restaurants.jsx
│   └── Orders.jsx
├── services/         # API services
│   └── api.js
├── App.jsx           # Main app component with routing
└── main.jsx          # Entry point
```

## Available Pages

- **Home** (`/`): Landing page with navigation links
- **Login** (`/login`): User authentication
- **Register** (`/register`): New user registration
- **Restaurants** (`/restaurants`): List of available restaurants
- **Orders** (`/orders`): User's order history (protected)
- **Profile** (`/profile`): User profile information (protected)

## Environment Variables

Create a `.env` file in the frontend directory:

```
VITE_API_URL=http://localhost:3000/api
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Features

### Authentication
- Login and registration with JWT tokens
- Protected routes for authenticated users
- Auto-redirect to login for unauthorized access
- Token stored in localStorage

### Global State Management
- AuthContext provides user state across the application
- Centralized login/logout functionality
- Automatic token injection in API requests

### API Integration
- Axios instance configured with interceptors
- Automatic token attachment to requests
- Error handling and unauthorized redirect
- Base URL configuration from environment variables

## Models Integration

The frontend is structured based on the backend models:
- **Cliente** (Client): User registration and profile
- **Restaurante** (Restaurant): Restaurant listing
- **Pedido** (Order): Order management
- **EnderecoCliente** (Client Address): Delivery addresses
- **ItemCardapio** (Menu Item): Restaurant menu items
- **Avaliacao** (Review): Restaurant and delivery reviews

## Next Steps

1. Implement restaurant detail page with menu
2. Add shopping cart functionality
3. Implement order placement flow
4. Add address management
5. Implement review system
6. Add entregador (delivery person) tracking

