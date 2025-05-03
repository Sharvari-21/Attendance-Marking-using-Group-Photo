import os
import cv2
import numpy as np
import requests
import uuid
from deepface import DeepFace
from models.student import Student
from services.cloudinary_service import CloudinaryService
from utils.image_utils import check_image_quality
from config.settings import (
    FACE_MODEL, 
    FACE_DETECTOR, 
    FACE_DISTANCE_METRIC,
    FACE_DISTANCE_THRESHOLD
)

class FaceService:
    """Service for face detection and recognition operations"""
    
    @staticmethod
    def detect_face(image_path):
        """
        Detects if there's exactly one face in the image with good conditions
        
        Args:
            image_path: Path to image file
            
        Returns:
            tuple: (success, message)
        """
        try:
            # Check image quality first (brightness, blur, etc.)
            quality_check, quality_message = check_image_quality(image_path)
            if not quality_check:
                return False, quality_message
            
            # Use haar cascade for quick face detection
            img = cv2.imread(image_path)
            if img is None:
                return False, "Failed to read image"
                
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            faces = face_cascade.detectMultiScale(gray, 1.3, 5)
            
            if len(faces) == 0:
                return False, "No face detected"
            if len(faces) > 1:
                return False, "Multiple faces detected"
                
            return True, "Face detected successfully"
        except Exception as e:
            return False, f"Error: {str(e)}"
    
    @staticmethod
    def process_student_image(image_path, name, roll_no, student_class, image_index):
        """
        Process and store student face image
        
        Args:
            image_path: Path to uploaded image
            name: Student name
            roll_no: Student roll number
            student_class: Student class
            image_index: Index of the image (0-4)
            
        Returns:
            tuple: (success, message, student_id)
        """
        # Check if face is valid
        is_valid, message = FaceService.detect_face(image_path)
        if not is_valid:
            return False, message, None
        
        # Upload to Cloudinary
        student_folder = f"students/{name}_{roll_no}"
        public_id = f"{student_folder}/image_{image_index}"
        
        upload_result = CloudinaryService.upload_image(
            image_path=image_path,
            folder=student_folder,
            public_id=f"image_{image_index}"
        )
        
        if not upload_result:
            return False, "Failed to upload image", None
        
        # Get or create student record
        student = Student.get_by_roll_no(roll_no)
        
        if student:
            student_id = str(student["_id"])
            # Update image URLs array
            image_urls = student.get("image_urls", [])
            
            # If index already exists, replace it
            while len(image_urls) <= image_index:
                image_urls.append(None)
                
            image_urls[image_index] = upload_result["secure_url"]
            Student.update_image_urls(student_id, image_urls)
        else:
            # Create new student with first image
            image_urls = [None] * 5  # Create array with 5 None elements
            image_urls[image_index] = upload_result["secure_url"]
            student_id = Student.create(name, roll_no, student_class, image_urls)
        
        return True, f"Image {image_index+1} processed successfully", student_id
    
    @staticmethod
    def recognize_faces_in_group(group_image_path):
        """
        Recognize students in a group photo
        
        Args:
            group_image_path: Path to group image
            
        Returns:
            tuple: (success, message, recognized_students)
        """
        try:
            # Check image quality first
            quality_check, quality_message = check_image_quality(group_image_path)
            if not quality_check:
                return False, quality_message, []
            
            # Extract faces from the group photo
            detected_faces = DeepFace.extract_faces(
                img_path=group_image_path,
                enforce_detection=True,
                detector_backend=FACE_DETECTOR
            )
            
            if not detected_faces or len(detected_faces) == 0:
                return False, "No faces detected in the group photo", []
                
            print(f"Detected {len(detected_faces)} faces in the group photo")
            
            # Get all students from database
            all_students = Student.get_all()
            recognized_students = []
            
            # For each student in the database
            for student in all_students:
                # Skip students with incomplete image data
                image_urls = student.get("image_urls", [])
                if not image_urls or len(image_urls) == 0 or None in image_urls:
                    continue
                    
                student_id = str(student["_id"])
                student_name = student["name"]
                
                # Create a temp folder for this verification
                temp_student_folder = os.path.join("temp_uploads", f"temp_{student_id}")
                os.makedirs(temp_student_folder, exist_ok=True)
                
                # Download and save at least one reference image
                reference_img_path = None
                

                # Inside your loop over image_urls
                for i, url in enumerate(image_urls):
                    if url:
                        try:
                            response = requests.get(url, stream=True)
                            if response.status_code == 200:
                                temp_img_path = os.path.join(temp_student_folder, f"ref_{i}.jpg")
                                with open(temp_img_path, 'wb') as out_file:
                                    out_file.write(response.content)
                                reference_img_path = temp_img_path
                                break  # Stop after first valid image
                        except Exception as e:
                            print(f"Error downloading reference image: {str(e)}")

                
                # If we couldn't get a reference image, skip this student
                if not reference_img_path:
                    continue
                
                # Try to verify student against any of the detected faces
                student_found = False
                try:
                    # For efficiency, we first check if any of the detected faces matches this student
                    # Instead of creating multiple temp files, we could convert the faces to a format
                    # that DeepFace.verify can accept directly in memory
                    verification = DeepFace.verify(
                        img1_path=group_image_path,
                        img2_path=reference_img_path,
                        model_name=FACE_MODEL,
                        distance_metric=FACE_DISTANCE_METRIC,
                        enforce_detection=False  # Already detected
                    )
                    
                    if verification.get('verified', False):
                        student_found = True
                except Exception as e:
                    print(f"Verification error for {student_name}: {str(e)}")
                
                # If student found, add to recognized list if not already there
                if student_found:
                    if not any(s.get('roll_no') == student['roll_no'] for s in recognized_students):
                        recognized_students.append({
                            'name': student['name'],
                            'roll_no': student['roll_no'],
                            'class': student['class']
                        })
                
                # Clean up temp files
                try:
                    if os.path.exists(temp_student_folder):
                        import shutil
                        shutil.rmtree(temp_student_folder)
                except Exception as e:
                    print(f"Error cleaning up temp files: {str(e)}")
            
            # Check if number of recognized students exceeds number of detected faces
            if len(recognized_students) > len(detected_faces):
                return False, "Recognition error: more students recognized than faces detected", []
            
            return True, f"Successfully recognized {len(recognized_students)} students", recognized_students
            
        except Exception as e:
            return False, f"Recognition error: {str(e)}", []