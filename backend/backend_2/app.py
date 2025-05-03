from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
import cv2
from deepface import DeepFace
import uuid
import shutil
import json
import pickle
import time
from mtcnn import MTCNN
from scipy.spatial.distance import cosine

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
FACE_INFO_FOLDER = 'face_info'

# Create folders if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(FACE_INFO_FOLDER, exist_ok=True)

def detect_face(image_path):
    """
    Detects if there's exactly one face in the image with good conditions
    Returns: (success, message, face_area)
    """
    try:
        img = cv2.imread(image_path)
        if img is None:
            return False, "Failed to read image", None
        
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Use haar cascade for quick face detection
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) == 0:
            return False, "No face detected", None
        if len(faces) > 1:
            return False, "Multiple faces detected", None
        
        # Check image brightness
        brightness = np.mean(gray)
        if brightness < 50:
            return False, "Poor lighting conditions", None
            
        # Store face area
        x, y, w, h = faces[0]
        
        face_area = {
            'x': int(x),
            'y': int(y),
            'w': int(w),
            'h': int(h),
            'left_eye': None,
            'right_eye': None
        }
            
        return True, "Face detected successfully", face_area
    except Exception as e:
        return False, f"Error: {str(e)}", None

def extract_face_features(image_path):
    """
    Extract facial features for recognition - ensures consistent format
    """
    try:
        # Use DeepFace to get representation
        embedding_obj = DeepFace.represent(
            img_path=image_path, 
            model_name="Facenet",
            enforce_detection=False
        )
        
        # Make sure we're extracting just the vector
        if isinstance(embedding_obj, list) and len(embedding_obj) > 0:
            # If it's a list (multiple faces), take the first one
            embedding = embedding_obj[0]["embedding"]
        else:
            # If it's a single object
            embedding = embedding_obj["embedding"]
            
        # Convert to numpy array to ensure consistent format and flatten
        embedding_array = np.array(embedding).flatten()
        
        # Verify shape before returning
        if embedding_array.size != 128:  # Facenet typically uses 128-dimensional embeddings
            print(f"Warning: Unexpected embedding dimension: {embedding_array.shape}, size: {embedding_array.size}")
            
        return embedding_array
    except Exception as e:
        print(f"Error extracting features: {str(e)}")
        return None

def regenerate_features(student_id):
    """
    Regenerate features for a student using their stored images
    Returns: True if successful, False otherwise
    """
    try:
        user_folder = os.path.join(UPLOAD_FOLDER, student_id)
        face_info_folder = os.path.join(FACE_INFO_FOLDER, student_id)
        
        if not os.path.exists(user_folder) or not os.path.exists(face_info_folder):
            print(f"Student folders not found for {student_id}")
            return False
            
        # Process each image
        success_count = 0
        for i in range(5):  # 5 images per student
            img_path = os.path.join(user_folder, f"image_{i}.jpg")
            if not os.path.exists(img_path):
                continue
                
            # Extract new features
            features = extract_face_features(img_path)
            if features is not None and features.size == 128:
                # Save the regenerated features
                feature_path = os.path.join(face_info_folder, f"features_{i}.pkl")
                with open(feature_path, "wb") as f:
                    pickle.dump(features, f)
                success_count += 1
                
        print(f"Regenerated {success_count} feature vectors for {student_id}")
        return success_count > 0
    except Exception as e:
        print(f"Error regenerating features for {student_id}: {str(e)}")
        return False

# Add a route to regenerate features for all students
@app.route('/api/regenerate-all-features', methods=['POST'])
def regenerate_all_features():
    try:
        successful_students = []
        failed_students = []
        
        for student_folder in os.listdir(FACE_INFO_FOLDER):
            folder_path = os.path.join(FACE_INFO_FOLDER, student_folder)
            if os.path.isdir(folder_path):
                if regenerate_features(student_folder):
                    successful_students.append(student_folder)
                else:
                    failed_students.append(student_folder)
        
        return jsonify({
            "success": True,
            "message": f"Regenerated features for {len(successful_students)} students, {len(failed_students)} failed",
            "successful_students": successful_students,
            "failed_students": failed_students
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error regenerating features: {str(e)}"
        }), 500

@app.route('/api/upload-face', methods=['POST'])
def upload_face():
    if 'image' not in request.files:
        return jsonify({"success": False, "message": "No image provided"}), 400
    
    if 'name' not in request.form or 'roll_no' not in request.form or 'class' not in request.form:
        return jsonify({"success": False, "message": "Missing student information"}), 400
    
    image = request.files['image']
    name = request.form['name']
    roll_no = request.form['roll_no']
    student_class = request.form['class']
    image_index = int(request.form['imageIndex'])  # 0-4 for the 5 images
    
    # Create student ID
    student_id = f"{name}_{roll_no}"
    
    # Create user folder if it doesn't exist
    user_folder = os.path.join(UPLOAD_FOLDER, student_id)
    os.makedirs(user_folder, exist_ok=True)
    
    # Save the image
    image_path = os.path.join(user_folder, f"image_{image_index}.jpg")
    image.save(image_path)
    
    # Detect face and get face area
    is_valid, message, face_area = detect_face(image_path)
    if not is_valid:
        os.remove(image_path)  # Remove invalid image
        return jsonify({"success": False, "message": message}), 400
    
    # Create student face info folder
    face_info_folder = os.path.join(FACE_INFO_FOLDER, student_id)
    os.makedirs(face_info_folder, exist_ok=True)
    
    # Save face area information
    if face_area:
        with open(os.path.join(face_info_folder, f"face_area_{image_index}.json"), "w") as f:
            json.dump(face_area, f)
    
    # Extract features/representation
    features = extract_face_features(image_path)
    if features is not None and features.size == 128:
        # Save features - make sure we're saving a 1D array of size 128
        with open(os.path.join(face_info_folder, f"features_{image_index}.pkl"), "wb") as f:
            pickle.dump(features, f)
    else:
        return jsonify({"success": False, "message": "Failed to extract valid facial features"}), 400
    
    # If this is the last image (index 4), save student info
    if image_index == 4:
        # Create student info
        student_info = {
            "name": name,
            "roll_no": roll_no,
            "class": student_class,
            "images": [f"image_{i}.jpg" for i in range(5)],
            "face_areas": [f"face_area_{i}.json" for i in range(5)],
            "features": [f"features_{i}.pkl" for i in range(5)]
        }
        
        # Save student info
        with open(os.path.join(face_info_folder, "info.json"), "w") as f:
            json.dump(student_info, f)
        
        return jsonify({
            "success": True, 
            "message": "All images processed successfully and face information stored"
        })
    
    return jsonify({
        "success": True, 
        "message": f"Image {image_index+1} uploaded and validated successfully"
    })

@app.route('/api/recognize-group', methods=['POST'])
def recognize_group():
    start_time = time.time()
    
    if 'image' not in request.files:
        return jsonify({"success": False, "message": "No image provided"}), 400
    
    image = request.files['image']
    
    # Save the group image temporarily
    group_image_path = os.path.join(UPLOAD_FOLDER, f"group_{uuid.uuid4()}.jpg")
    image.save(group_image_path)
    
    try:
        # Load all students information first
        all_students = []
        
        for student_folder in os.listdir(FACE_INFO_FOLDER):
            folder_path = os.path.join(FACE_INFO_FOLDER, student_folder)
            if os.path.isdir(folder_path):
                info_path = os.path.join(folder_path, "info.json")
                if os.path.exists(info_path):
                    try:
                        with open(info_path, "r") as f:
                            student_info = json.load(f)
                        
                        # Add student ID and folder path
                        student_info['id'] = student_folder
                        student_info['folder'] = folder_path
                        student_info['upload_folder'] = os.path.join(UPLOAD_FOLDER, student_folder)
                        
                        # Load pre-extracted facial features
                        student_info['features'] = []
                        needs_regeneration = False
                        
                        for i in range(5):  # 5 images per student
                            feature_path = os.path.join(folder_path, f"features_{i}.pkl")
                            if os.path.exists(feature_path):
                                try:
                                    with open(feature_path, "rb") as f:
                                        features = pickle.load(f)
                                        
                                        # Check if features are valid
                                        if features is not None:
                                            features = np.array(features).flatten()
                                            
                                            # If the feature vector has incorrect dimensions
                                            if features.size != 128:
                                                needs_regeneration = True
                                                break
                                                
                                            student_info['features'].append(features)
                                        else:
                                            needs_regeneration = True
                                            break
                                except Exception:
                                    needs_regeneration = True
                                    break
                            else:
                                needs_regeneration = True
                                break
                        
                        # If features need regeneration, do it now
                        if needs_regeneration or len(student_info['features']) < 5:
                            print(f"Regenerating features for {student_folder}")
                            if regenerate_features(student_folder):
                                # Reload the regenerated features
                                student_info['features'] = []
                                for i in range(5):
                                    feature_path = os.path.join(folder_path, f"features_{i}.pkl")
                                    if os.path.exists(feature_path):
                                        with open(feature_path, "rb") as f:
                                            features = pickle.load(f)
                                            if features is not None and isinstance(features, np.ndarray) and features.size == 128:
                                                student_info['features'].append(features)
                        
                        # Only add student if we have valid features
                        if len(student_info['features']) > 0:
                            all_students.append(student_info)
                        else:
                            print(f"Skipping student {student_folder} - no valid feature vectors found")
                    except Exception as e:
                        print(f"Error loading student info: {str(e)}")
        
        print(f"Loaded {len(all_students)} students with valid feature vectors")
        
        # Detect faces in the group photo using MTCNN
        img = cv2.imread(group_image_path)
        if img is None:
            return jsonify({"success": False, "message": "Failed to read group image"}), 400

        # Convert to RGB as MTCNN works with RGB format
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Initialize MTCNN detector
        detector = MTCNN()

        # Detect faces
        detected_faces = detector.detect_faces(rgb_img)
        actual_face_count = len(detected_faces)
        print(f"MTCNN detected {actual_face_count} faces in the group photo")
        
        # Process each detected face
        recognized_students = []
        
        # Extract facial features from each detected face in the group photo
        group_face_features = []
        
        for face in detected_faces:
            try:
                # Get face coordinates
                x, y, width, height = face['box']
                
                # Add margin to face crop (10% on each side)
                margin_x = int(width * 0.1)
                margin_y = int(height * 0.1)
                
                # Ensure coordinates are within image boundaries
                x_start = max(0, x - margin_x)
                y_start = max(0, y - margin_y)
                x_end = min(img.shape[1], x + width + margin_x)
                y_end = min(img.shape[0], y + height + margin_y)
                
                # Crop face from image
                face_img = img[y_start:y_end, x_start:x_end]
                
                # Save face temporarily for feature extraction
                face_path = os.path.join(UPLOAD_FOLDER, f"face_{uuid.uuid4()}.jpg")
                cv2.imwrite(face_path, face_img)
                
                # Extract features using DeepFace
                face_embedding = extract_face_features(face_path)
                if face_embedding is not None and face_embedding.size == 128:
                    group_face_features.append({
                        'features': face_embedding,
                        'face_path': face_path,
                        'face_area': {'x': x, 'y': y, 'w': width, 'h': height}
                    })
                    print(f"Successfully extracted features for face at ({x}, {y})")
                else:
                    print(f"Warning: Invalid or missing face embedding for face at ({x}, {y})")
                
            except Exception as crop_err:
                print(f"Error processing face: {str(crop_err)}")
        
        print(f"Extracted features from {len(group_face_features)} faces in the group photo")
        
        # Match each face in the group photo with student database
        # using the pre-extracted features
        for face_data in group_face_features:
            face_features = face_data['features']
            if face_features is None or face_features.size != 128:
                continue
                
            best_match = None
            best_distance = 0.4  # Threshold for matching (lower is better)
            best_student = None
            
            # Compare with each student's features
            for student in all_students:
                # Skip already recognized students
                if any(s.get('roll_no') == student.get('roll_no') for s in recognized_students):
                    continue
                    
                # Compare with each of the student's features
                student_best_similarity = 0
                
                for features in student.get('features', []):
                    if features is None or features.size != 128:
                        continue
                    
                    try:
                        # Compute cosine similarity (higher is better)
                        similarity = 1 - cosine(face_features, features)
                        
                        # Keep track of the best similarity for this student
                        if similarity > student_best_similarity:
                            student_best_similarity = similarity
                    except Exception as comp_err:
                        print(f"Comparison error: {str(comp_err)}")
                
                # Convert to distance (lower is better) for threshold comparison
                distance = 1 - student_best_similarity
                
                # If this student is a better match than previous best
                if student_best_similarity > 0 and distance < best_distance:
                    best_distance = distance
                    best_student = student
                    print(f"New best match: {student.get('name')} with similarity {student_best_similarity:.4f} (distance {distance:.4f})")
            
            # If we found a good match
            if best_student:
                print(f"Recognized: {best_student.get('name')} with distance {best_distance:.4f}")
                recognized_students.append({
                    'name': best_student.get('name'),
                    'roll_no': best_student.get('roll_no'),
                    'class': best_student.get('class')
                })
        
        # If we haven't recognized enough faces using vector comparison, 
        # fallback to DeepFace.verify for remaining students
        if len(recognized_students) < actual_face_count:
            print(f"Only recognized {len(recognized_students)} out of {actual_face_count}. Trying verification...")
            
            # For each unrecognized student, try verification with their images
            for student in all_students:
                # Skip already recognized students
                if any(s.get('roll_no') == student.get('roll_no') for s in recognized_students):
                    continue
                    
                student_id = student.get('id')
                user_folder = student.get('upload_folder')
                
                # Try each of the student's images (we'll try image_2.jpg first as it's usually best)
                images_to_try = ["image_2.jpg", "image_0.jpg", "image_1.jpg", "image_3.jpg", "image_4.jpg"]
                verified = False
                
                for img_name in images_to_try:
                    if verified:
                        break
                        
                    img_path = os.path.join(user_folder, img_name)
                    if not os.path.exists(img_path):
                        continue
                    
                    try:
                        # Try each face in the group photo
                        for face_data in group_face_features:
                            if verified:
                                break
                                
                            face_path = face_data['face_path']
                            
                            verification = DeepFace.verify(
                                img1_path=face_path,
                                img2_path=img_path,
                                model_name="Facenet",
                                distance_metric="cosine",
                                detector_backend="skip",  # Skip detection since we already have face crops
                                enforce_detection=False
                            )
                            
                            if verification.get('verified', False):
                                print(f"Verification success for {student['name']} with {img_name}")
                                recognized_students.append({
                                    'name': student.get('name'),
                                    'roll_no': student.get('roll_no'),
                                    'class': student.get('class')
                                })
                                verified = True
                                break
                                
                    except Exception as verify_err:
                        print(f"Verification error for {student['name']}: {str(verify_err)}")
        
        # Clean up temporary files
        if os.path.exists(group_image_path):
            os.remove(group_image_path)
            
        for face_data in group_face_features:
            if 'face_path' in face_data and os.path.exists(face_data['face_path']):
                os.remove(face_data['face_path'])
        
        # Sort recognized students by name
        recognized_students.sort(key=lambda x: x.get('name', ''))
        
        end_time = time.time()
        processing_time = end_time - start_time
        
        return jsonify({
            "success": True,
            "recognized_students": recognized_students,
            "faces_detected": actual_face_count,
            "processing_time_seconds": processing_time
        })
    
    except Exception as e:
        print(f"Recognition process error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Clean up temporary files
        if os.path.exists(group_image_path):
            os.remove(group_image_path)
        
        # Clean up any face images
        for filename in os.listdir(UPLOAD_FOLDER):
            if filename.startswith("face_") and filename.endswith(".jpg"):
                os.remove(os.path.join(UPLOAD_FOLDER, filename))
                
        return jsonify({
            "success": False,
            "message": f"Recognition error: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=3000)