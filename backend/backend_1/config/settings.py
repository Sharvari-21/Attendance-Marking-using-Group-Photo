import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB Configuration
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/FaceDetection2')

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')

# App configuration
UPLOAD_FOLDER = 'temp_uploads'
FACE_MODEL = 'Facenet'
FACE_DETECTOR = 'opencv'
FACE_DISTANCE_METRIC = 'cosine'
FACE_DISTANCE_THRESHOLD = 0.5  # Threshold for considering a match

def init_app_config(app):
    """Initialize app configuration"""
    # Create temp upload directory if it doesn't exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    # App configurations
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload
    