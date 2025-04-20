# services/local_storage_service.py
import os
import shutil
import requests
from config.settings import LOCAL_STORAGE_DIR

class LocalStorageService:
    """Service for managing local storage of face images"""
    
    @staticmethod
    def init_storage():
        """Initialize local storage directory"""
        if not os.path.exists(LOCAL_STORAGE_DIR):
            os.makedirs(LOCAL_STORAGE_DIR, exist_ok=True)
    
    @staticmethod
    def get_student_dir(student_id):
        """Get the directory path for a student"""
        student_dir = os.path.join(LOCAL_STORAGE_DIR, str(student_id))
        os.makedirs(student_dir, exist_ok=True)
        return student_dir
    
    @staticmethod
    def save_image_from_url(url, filepath):
        """Download and save an image from URL to local storage"""
        try:
            response = requests.get(url, stream=True)
            if response.status_code == 200:
                with open(filepath, 'wb') as out_file:
                    out_file.write(response.content)
                return True
            return False
        except Exception as e:
            print(f"Error saving image from URL: {str(e)}")
            return False
    
    @staticmethod
    def sync_student_images(student_id, image_urls):
        """Sync student images from Cloudinary to local storage"""
        student_dir = LocalStorageService.get_student_dir(student_id)
        
        # Create a flag file to track sync status
        sync_flag_path = os.path.join(student_dir, '.synced')
        
        # Download all images
        success = True
        for i, url in enumerate(image_urls):
            if url:
                image_path = os.path.join(student_dir, f"image_{i}.jpg")
                # Only download if file doesn't exist or we're forcing a refresh
                if not os.path.exists(image_path):
                    if not LocalStorageService.save_image_from_url(url, image_path):
                        success = False
        
        # Create sync flag if all successful
        if success:
            with open(sync_flag_path, 'w') as f:
                f.write('synced')
        
        return success
    
    @staticmethod
    def is_student_synced(student_id):
        """Check if student images are synced locally"""
        student_dir = os.path.join(LOCAL_STORAGE_DIR, str(student_id))
        sync_flag_path = os.path.join(student_dir, '.synced')
        return os.path.exists(sync_flag_path)
    
    @staticmethod
    def get_student_image_paths(student_id):
        """Get local file paths for student images"""
        student_dir = LocalStorageService.get_student_dir(student_id)
        image_paths = []
        
        # Look for image_0.jpg through image_4.jpg
        for i in range(5):
            path = os.path.join(student_dir, f"image_{i}.jpg")
            if os.path.exists(path):
                image_paths.append(path)
        
        return image_paths
    
    @staticmethod
    def clear_student_images(student_id):
        """Remove all local images for a student"""
        student_dir = os.path.join(LOCAL_STORAGE_DIR, str(student_id))
        if os.path.exists(student_dir):
            shutil.rmtree(student_dir)
    
    @staticmethod
    def clear_all_students():
        """Clear all local student images"""
        if os.path.exists(LOCAL_STORAGE_DIR):
            shutil.rmtree(LOCAL_STORAGE_DIR)
            os.makedirs(LOCAL_STORAGE_DIR, exist_ok=True)