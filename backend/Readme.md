# Start with docker-compose (Recommended)
docker-compose up --build

# Or build and run separately
docker build -t tourist-safety-backend .
docker run --env-file .env -p 3000:3000 tourist-safety-backend

# Stop the container
docker-compose down