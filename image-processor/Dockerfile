FROM ubuntu:22.04

# Install vips and dependencies
RUN apt-get update && apt-get install -y \
    libvips-tools \
    libvips-dev \
    curl \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install MinIO client
RUN curl -O https://dl.min.io/client/mc/release/linux-amd64/mc && \
    chmod +x mc && \
    mv mc /usr/local/bin/

# Copy processing script
COPY process-images.sh /process-images.sh
RUN chmod +x /process-images.sh

# Set working directory
WORKDIR /app

# Run the processing script
CMD ["/process-images.sh"]
