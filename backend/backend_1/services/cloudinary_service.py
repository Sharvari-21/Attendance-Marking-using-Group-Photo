import cloudinary
import cloudinary.uploader
import cloudinary.api
from config.settings import CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

# Configure Cloudinary
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)

class CloudinaryService:
    """Service for Cloudinary operations"""
    
    @staticmethod
    def upload_image(image_path, folder, public_id=None):
        """
        Upload an image to Cloudinary
        
        Args:
            image_path: Local path to image
            folder: Cloudinary folder to store image
            public_id: Custom public ID for the image
            
        Returns:
            dict: Cloudinary response
        """
        upload_params = {
            'folder': folder,
            'overwrite': True,
            'resource_type': 'image'
        }
        
        if public_id:
            upload_params['public_id'] = public_id
            
        try:
            result = cloudinary.uploader.upload(image_path, **upload_params)
            return result
        except Exception as e:
            print(f"Cloudinary upload error: {str(e)}")
            return None
    
    @staticmethod
    def delete_image(public_id):
        """Delete an image from Cloudinary"""
        try:
            result = cloudinary.uploader.destroy(public_id)
            return result
        except Exception as e:
            print(f"Cloudinary delete error: {str(e)}")
            return None