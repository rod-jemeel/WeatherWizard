"""
This module contains deployment-specific configuration.
It helps ensure compatibility with different deployment environments.
"""

import os
import logging
import importlib.util

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_openai_client():
    """
    Sets up the OpenAI client with proper configuration for the current environment.
    
    Returns:
        OpenAI client instance configured for the current environment
    """
    try:
        # Check OpenAI package version
        openai_spec = importlib.util.find_spec("openai")
        if openai_spec:
            openai_path = openai_spec.origin
            logger.info(f"Using OpenAI from: {openai_path}")
        
        from openai import OpenAI
        
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            logger.warning("OPENAI_API_KEY environment variable not set")
        
        # Initialize with only the required parameters to avoid compatibility issues
        # Do not add any additional parameters like proxies, base_url, etc.
        client = OpenAI(api_key=api_key)
        logger.info("OpenAI client initialized successfully")
        
        return client
    except Exception as e:
        logger.error(f"Error initializing OpenAI client: {str(e)}")
        raise
