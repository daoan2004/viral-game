# Base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies (for Tesseract OCR)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user for security
RUN useradd -m myuser
USER myuser

# Expose port (default 8080)
EXPOSE 8080

# Command to run production server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
