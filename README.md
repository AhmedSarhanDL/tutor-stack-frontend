# Tutor Stack Frontend

A modern React SPA for the Tutor Stack platform with authentication and dashboard functionality.

## Features

- 🔐 **Authentication**: Email/password and Google OAuth login
- 🎨 **Modern UI**: Clean, responsive design with smooth animations
- 🛡️ **Protected Routes**: Automatic redirect for unauthenticated users
- 📱 **Mobile Responsive**: Works perfectly on all device sizes
- 🔄 **Real-time Updates**: Automatic token refresh and error handling

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for client-side routing
- **Axios** for API communication
- **CSS3** with modern design patterns

## Quick Start

### Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - Local: http://localhost:3000
   - Docker: http://app.tutor-stack.local

### Production Build

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Preview production build**:
   ```bash
   npm run preview
   ```

## Docker Development

### Using Docker Compose (Recommended)

1. **Start all services**:
   ```bash
   docker-compose -f docker-compose.dev.yaml up
   ```

2. **Access the application**:
   - Frontend: http://app.tutor-stack.local
   - API: http://api.tutor-stack.local
   - Traefik Dashboard: http://localhost:8080

### Manual Docker Build

1. **Build the development image**:
   ```bash
   docker build -f Dockerfile.dev -t tutor-stack-frontend-dev .
   ```

2. **Run the container**:
   ```bash
   docker run -p 3000:3000 -v $(pwd):/app tutor-stack-frontend-dev
   ```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── LoginPage.tsx    # Authentication page
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── ProtectedRoute.tsx # Route protection
│   │   └── *.css           # Component styles
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── Dockerfile              # Production Docker image
├── Dockerfile.dev          # Development Docker image
├── nginx.conf              # Nginx configuration
└── package.json            # Dependencies and scripts
```

## Authentication Flow

1. **Login Page**: Users can sign in with email/password or Google OAuth
2. **Token Storage**: JWT tokens are stored in localStorage
3. **Protected Routes**: Unauthenticated users are redirected to login
4. **API Integration**: All API calls include the auth token automatically
5. **Error Handling**: 401 responses trigger automatic logout

## API Endpoints

The frontend communicates with the backend through these endpoints:

- **Login**: `POST /auth/jwt/login`
- **Register**: `POST /auth/register`
- **Google OAuth**: `GET /auth/google/authorize`
- **User Info**: `GET /auth/users/me`

## Environment Variables

Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_BASE_URL=http://api.tutor-stack.local

# Google OAuth (optional)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## Development Tips

### Hot Reloading
The development server supports hot reloading. Changes to your code will automatically refresh the browser.

### API Proxy
During development, API calls are proxied through Vite to avoid CORS issues. The proxy configuration is in `vite.config.ts`.

### Styling
- Use CSS modules or component-specific CSS files
- Follow the existing design patterns in the codebase
- Ensure mobile responsiveness

### Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend CORS configuration allows your frontend domain
2. **Authentication Issues**: Check that the JWT tokens are being sent correctly
3. **Build Errors**: Clear node_modules and reinstall dependencies

### Debug Mode
Enable debug logging by setting the environment variable:
```bash
VITE_DEBUG=true npm run dev
```

## Contributing

1. Follow the existing code style and patterns
2. Add appropriate TypeScript types
3. Test your changes thoroughly
4. Update documentation as needed

## License

This project is part of the Tutor Stack platform.
