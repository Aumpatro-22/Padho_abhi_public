"""
Encryption utilities for sensitive data like API keys.
Uses Fernet symmetric encryption from the cryptography library.
"""
import os
import base64
from cryptography.fernet import Fernet
from django.conf import settings


def get_encryption_key():
    """
    Get or generate the encryption key.
    In production, this should be set as an environment variable.
    """
    key = os.environ.get('ENCRYPTION_KEY')
    if key:
        return key.encode() if isinstance(key, str) else key
    
    # Fallback: derive from Django's SECRET_KEY (not ideal but works)
    # This ensures consistency across restarts
    secret = settings.SECRET_KEY.encode()
    # Create a 32-byte key from SECRET_KEY using simple derivation
    import hashlib
    derived = hashlib.sha256(secret).digest()
    return base64.urlsafe_b64encode(derived)


def get_fernet():
    """Get a Fernet instance for encryption/decryption."""
    return Fernet(get_encryption_key())


def encrypt_value(value: str) -> str:
    """
    Encrypt a string value and return the encrypted string.
    Returns empty string if value is None or empty.
    """
    if not value:
        return ''
    
    try:
        f = get_fernet()
        encrypted = f.encrypt(value.encode())
        return encrypted.decode()
    except Exception:
        # If encryption fails, return empty to avoid storing plaintext
        return ''


def decrypt_value(encrypted_value: str) -> str:
    """
    Decrypt an encrypted string and return the original value.
    Returns empty string if decryption fails or value is empty.
    """
    if not encrypted_value:
        return ''
    
    try:
        f = get_fernet()
        decrypted = f.decrypt(encrypted_value.encode())
        return decrypted.decode()
    except Exception:
        # If decryption fails (wrong key, corrupted data), return empty
        return ''


def is_encrypted(value: str) -> bool:
    """
    Check if a value appears to be encrypted (Fernet format).
    Fernet tokens are base64-encoded and start with 'gAAAAA'.
    """
    if not value:
        return False
    return value.startswith('gAAAAA') and len(value) > 50
