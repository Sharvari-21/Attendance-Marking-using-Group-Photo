import cv2
import numpy as np

def check_image_quality(image_path):
    """
    Check if image meets quality standards (brightness, blur)
    
    Args:
        image_path: Path to the image
        
    Returns:
        tuple: (passed, message)
    """
    try:
        img = cv2.imread(image_path)
        if img is None:
            return False, "Failed to read image"
            
        # Convert to grayscale for analysis
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Check brightness
        brightness = np.mean(gray)
        if brightness < 50:
            return False, "Poor lighting conditions (too dark)"
        if brightness > 240:
            return False, "Poor lighting conditions (too bright/overexposed)"
            
        # Check blurriness (Laplacian variance - lower means more blur)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if laplacian_var < 30:
            return False, "Image is too blurry"
            
        # Check image dimensions
        height, width = img.shape[:2]
        if width < 200 or height < 200:
            return False, "Image resolution too low"
            
        return True, "Image quality is good"
        
    except Exception as e:
        return False, f"Error checking image quality: {str(e)}"