# Base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# 1. Install Dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2. Setup User & Permissions (CRITICAL STEP)
# Tạo user non-root
RUN useradd -m myuser

# Tạo folder data EXPLICITLY
RUN mkdir -p /app/data

# Copy code
COPY . .

# Chuyển quyền sở hữu toàn bộ /app cho myuser
# Điều này đảm bảo myuser có thể ghi vào /app/data
RUN chown -R myuser:myuser /app

# Khai báo Volume (Optional nhưng tốt cho documentation)
VOLUME ["/app/data"]

# 3. Switch User
USER myuser

# Expose port
EXPOSE 8080

# Run
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
