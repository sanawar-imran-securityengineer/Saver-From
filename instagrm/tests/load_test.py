"""
Load test suite matching locustfile.py for high-concurrency simulation.
"""
from locust import HttpUser, task, between
import random

SAMPLE_URLS = [
    "https://www.instagram.com/reel/C3b45xYzA12/",
    "https://www.instagram.com/reel/C8901abcD34/",
    "https://www.instagram.com/p/C9912xyzE56/",
    "https://www.instagram.com/tv/C1234rstU78/",
]


class InstagramDownloaderUser(HttpUser):
    wait_time = between(0.1, 0.5)

    @task(10)
    def test_single_download(self):
        url = random.choice(SAMPLE_URLS)
        self.client.get(
            f"/api/v1/download?url={url}&quality=best&format=mp4",
            name="/api/v1/download"
        )

    @task(5)
    def test_fast_download(self):
        url = random.choice(SAMPLE_URLS)
        self.client.get(
            f"/api/v1/download-fast?url={url}",
            name="/api/v1/download-fast"
        )

    @task(2)
    def test_health_and_stats(self):
        self.client.get("/api/v1/health", name="/api/v1/health")
        self.client.get("/api/v1/stats", name="/api/v1/stats")
