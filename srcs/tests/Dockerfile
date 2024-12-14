FROM python:3.9-slim

RUN apt-get update && apt-get install -y curl && apt-get clean

WORKDIR /app

RUN mkdir -p /app/media

COPY test_backend.py /app/test_backend.py
COPY wait-for.sh /app/wait-for.sh
COPY media/luffy.png /app/media/
RUN chmod +x /app/wait-for.sh

RUN pip install --no-cache-dir requests

CMD ["/app/wait-for.sh", "http://backend:8000", "python", "/app/test_backend.py"]
