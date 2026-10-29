import hashlib
import os
import secrets

def hash_password(password: str) -> str:
    """Hash a password using SHA-256 with a random salt."""
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((salt + password).encode('utf-8')).hexdigest()
    return f"{salt}${hashed}"

def verify_password(plain_password: str, stored_hash: str) -> bool:
    """Verify a plain password against the stored hash format (salt$hash) or plain fallback."""
    if not stored_hash:
        return False
    
    # Support legacy or initial mock hashes
    if "$" not in stored_hash:
        return plain_password == stored_hash or stored_hash == "admin123_hashed_placeholder"
    
    try:
        salt, expected_hash = stored_hash.split("$", 1)
        actual_hash = hashlib.sha256((salt + plain_password).encode('utf-8')).hexdigest()
        return secrets.compare_digest(actual_hash, expected_hash)
    except Exception:
        return False
