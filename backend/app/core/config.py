from __future__ import annotations
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "BOOK MY INTERVIEW"
    app_env: str = "local"
    
    # Database
    database_url: str = "sqlite:///./bookmyinterview.db"
    async_database_url: str | None = None  # Defaults to postgresql+asyncpg version
    db_pool_size: int = 10
    db_max_overflow: int = 20
    db_pool_timeout: int = 30
    db_echo: bool = False
    
    # Security
    jwt_secret_key: str = "change-this-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7
    encryption_key: str = "dev-only-change-this-32-byte-key!!"
    
    # Cache / Queue
    redis_url: str = "redis://localhost:6379/0"
    redis_socket_timeout: float = 5.0
    redis_socket_connect_timeout: float = 5.0
    redis_health_check_interval: float = 30.0
    cache_default_ttl_seconds: int = 300
    
    # Celery
    celery_broker_url: str | None = None  # Defaults to redis_url
    celery_result_backend: str | None = None  # Defaults to redis_url
    celery_task_always_eager: bool = False
    celery_worker_prefetch_multiplier: int = 1
    
    # Observability
    log_level: str = "INFO"
    log_format: str = "json"  # json | console
    metrics_enabled: bool = True
    request_id_header: str = "x-request-id"
    
    # Providers
    llm_provider: str = "mock"
    vector_provider: str = "mock"
    object_storage_provider: str = "mock"  # s3/gcs/minio/mock
    object_storage_bucket: str = "bookmyinterview"
    
    # Feature flags
    audit_log_enabled: bool = True
    rate_limit_enabled: bool = True
    rate_limit_requests_per_minute: int = 120
    default_region: str = "global"
    cors_allow_origins: str = "http://localhost:5173,http://localhost:3000"
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

@lru_cache
def get_settings() -> Settings:
    return Settings()
