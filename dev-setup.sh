#!/bin/bash

# Tutor Stack Frontend Development Setup Script

echo "🚀 Setting up Tutor Stack Frontend for development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or later."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or later is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# API Configuration
VITE_API_BASE_URL=http://api.tutor-stack.local

# Google OAuth (optional)
VITE_GOOGLE_CLIENT_ID=

# Debug mode (optional)
VITE_DEBUG=false
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup complete! You can now start development:"
echo ""
echo "  Development server:"
echo "    npm run dev"
echo ""
echo "  Production build:"
echo "    npm run build"
echo ""
echo "  Docker development:"
echo "    docker-compose -f ../docker-compose.dev.yaml up"
echo ""
echo "  Access URLs:"
echo "    - Local: http://localhost:3000"
echo "    - Docker: http://app.tutor-stack.local"
echo "" 