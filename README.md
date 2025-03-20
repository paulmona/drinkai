# Drink AI

A React application that suggests drink recipes based on your available ingredients. Built with TypeScript, Material-UI, and Google's Gemini AI.

## Features

- Generate drink suggestions based on your available ingredients
- Support for both alcoholic and non-alcoholic drinks
- Custom ingredient management
- Responsive design with Material-UI
- Persistent inventory storage
- Cached drink suggestions for better performance

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Docker (optional, for containerized deployment)
- Google Gemini API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/paulmona/drinkai.git
cd drinkai
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Docker Deployment

The application includes Docker configuration for easy deployment:

### Building the Docker Image

```bash
docker build -t drink-ai .
```

### Running with Docker Compose

```bash
docker-compose up -d
```

### Docker Configuration Details

- **Base Image**: Node.js 18 Alpine for build, Nginx Alpine for serving
- **Exposed Port**: 80 (HTTP)
- **Build Stages**:
  1. Build stage: Compiles the React application
  2. Production stage: Serves the built files using Nginx
- **Environment Variables**: Configured through `.env` file
- **Volume Mounts**: None required for production
- **Health Check**: Available at `/health`

### Docker Compose Configuration

```yaml
version: '3.8'
services:
  drink-ai:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

### Nginx Configuration

The application uses Nginx with the following configuration:
- Serves static files from `/usr/share/nginx/html`
- Handles client-side routing
- Gzip compression enabled
- Security headers configured

## Development

### Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App

### Project Structure

```
drink-ai/
├── public/          # Static files
├── src/
│   ├── components/  # React components
│   ├── data/       # Static data and types
│   └── utils/      # Utility functions
├── Dockerfile      # Docker build configuration
├── docker-compose.yml # Docker Compose configuration
└── nginx.conf      # Nginx server configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
