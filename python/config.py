"""
File config.py
Centralized configuration management
"""

import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load .env file
load_dotenv()


class Settings(BaseSettings):
    """
    Application settings loaded từ environment variables
    """
    
    # Facebook Settings
    fb_page_access_token: str = os.getenv("FB_PAGE_ACCESS_TOKEN", "")
    fb_verify_token: str = os.getenv("FB_VERIFY_TOKEN", "")
    
    # DeepSeek Settings
    deepseek_api_key: str = os.getenv("DEEPSEEK_API_KEY", "")
    deepseek_base_url: str = "https://api.deepseek.com"
    deepseek_model: str = "deepseek-chat"
    
    # Server Settings
    port: int = int(os.getenv("PORT", "8000"))
    host: str = "0.0.0.0"
    reload: bool = True  # Set False cho production
    
    # Facebook API Settings
    fb_api_version: str = "v18.0"
    fb_graph_url: str = f"https://graph.facebook.com/v18.0"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"
    
    def validate_required_settings(self) -> tuple[bool, list[str]]:
        """
        Kiểm tra các settings bắt buộc
        
        Returns:
            (is_valid, missing_settings)
        """
        missing = []
        
        if not self.fb_page_access_token:
            missing.append("FB_PAGE_ACCESS_TOKEN")
        
        if not self.fb_verify_token:
            missing.append("FB_VERIFY_TOKEN")
        
        if not self.deepseek_api_key:
            missing.append("DEEPSEEK_API_KEY")
        
        return len(missing) == 0, missing


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """
    Get settings instance (for dependency injection)
    """
    return settings


if __name__ == "__main__":
    # Test config
    print("="*60)
    print("Configuration Test")
    print("="*60)
    
    is_valid, missing = settings.validate_required_settings()
    
    print(f"\nFB Page Token: {'✅ Set' if settings.fb_page_access_token else '❌ Missing'}")
    print(f"FB Verify Token: {'✅ Set' if settings.fb_verify_token else '❌ Missing'}")
    print(f"DeepSeek API Key: {'✅ Set' if settings.deepseek_api_key else '❌ Missing'}")
    print(f"\nPort: {settings.port}")
    print(f"DeepSeek Model: {settings.deepseek_model}")
    
    if not is_valid:
        print(f"\n❌ Missing settings: {', '.join(missing)}")
    else:
        print(f"\n✅ All required settings configured!")
