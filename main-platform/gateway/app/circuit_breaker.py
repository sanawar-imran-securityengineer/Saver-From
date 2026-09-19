import time
from typing import Optional

class CircuitBreaker:
    """A minimal circuit breaker.
    
    - Opens after ``failure_threshold`` consecutive failures.
    - Remains open for ``reset_timeout`` seconds before allowing a trial request.
    - ``force_open``/``force_close`` are used by the maintenance endpoint.
    """
    def __init__(self, service_name: str, failure_threshold: int = 3, reset_timeout: int = 30):
        self.service_name = service_name
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.failure_count = 0
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
        self.last_failure_time: Optional[float] = None
        self._forced_open_reason: Optional[str] = None

    @property
    def is_open(self) -> bool:
        if self._forced_open_reason:
            return True
        if self.state == "OPEN":
            # check if timeout elapsed
            if self.last_failure_time and (time.time() - self.last_failure_time) > self.reset_timeout:
                # move to half‑open to allow a probe request
                self.state = "HALF_OPEN"
                return False
            return True
        return False

    def record_success(self) -> None:
        # Success resets the failure count and closes the circuit
        self.failure_count = 0
        self.state = "CLOSED"
        self.last_failure_time = None
        self._forced_open_reason = None

    def record_failure(self) -> None:
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"

    def force_open(self, reason: str = "maintenance") -> None:
        self._forced_open_reason = reason
        self.state = "OPEN"
        self.last_failure_time = time.time()

    def force_close(self) -> None:
        self._forced_open_reason = None
        self.record_success()
