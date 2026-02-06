# Base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# 1. Install Dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2. Copy code (Running as ROOT by default to fix Windows Volume Permissions)
COPY . .

# Create data dir just in case
RUN mkdir -p /app/data

# Expose port (default 8080)
EXPOSE 8080

# Command to run production server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
