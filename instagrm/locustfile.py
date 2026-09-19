"""
Locust Load Testing Script for Instagram Video Downloader API.
Simulates 500+ concurrent users with high throughput.

Run with:
locust --headless -u 500 -r 50 -t 60s --host http://localhost:8000
"""

from locust import HttpUser, task, between
import random

SAMPLE_URLS = [
    "https://www.instagram.com/reel/C7192xyz1/",
    "https://www.instagram.com/p/C7192xyz2/",
    "https://www.instagram.com/reel/C7192xyz3/",
    "https://www.instagram.com/reel/C7192xyz4/",
    "https://www.instagram.com/p/C7192xyz5/",
]


class InstagramDownloaderUser(HttpUser):
    wait_time = between(0.1, 1.0)  # High-frequency traffic simulation

    @task(5)
    def test_single_download(self):
        """Simulate high volume single video requests."""
        url = random.choice(SAMPLE_URLS)
        self.client.get(
            f"/api/v1/download?url={url}&quality=best&format=mp4",
            name="/api/v1/download"
        )

    @task(3)
    def test_cached_fast_download(self):
        """Simulate ultra-fast cached hits."""
        url = SAMPLE_URLS[0]
        self.client.get(
            f"/api/v1/download-fast?url={url}",
            name="/api/v1/download-fast"
        )

    @task(2)
    def test_video_info(self):
        """Simulate metadata retrieval."""
        url = random.choice(SAMPLE_URLS)
        self.client.get(
            f"/api/v1/info?url={url}",
            name="/api/v1/info"
        )

    @task(1)
    def test_batch_download(self):
        """Simulate concurrent batch downloads."""
        urls = random.sample(SAMPLE_URLS, k=3)
        self.client.post(
            "/api/v1/batch-download",
            json={
                "urls": urls,
                "max_concurrent": 5,
                "quality": "best",
                "format": "mp4",
                "timeout": 20
            },
            name="/api/v1/batch-download"
        )

    @task(1)
    def test_health_and_stats(self):
        """Simulate monitoring probes."""
        self.client.get("/api/v1/health", name="/api/v1/health")
        self.client.get("/api/v1/stats", name="/api/v1/stats")
