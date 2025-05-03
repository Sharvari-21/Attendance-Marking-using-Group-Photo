from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
import cv2
from deepface import DeepFace
import uuid
import shutil
import json
import time
from concurrent.futures import ThreadPoolExecutor

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
EMBEDDINGS_FOLDER = 'embeddings'
CONFIDENCE_THRESHOLD = 0.45  # Adjusted threshold for face matching
MAX_WORKERS = 4  # For parallel processing

# Create folders if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(EMBEDDINGS_FOLDER, exist_ok=True)

# Pre-load face detection model
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def detect_face(image_path):
    """
    Detects if there's exactly one face in the image with good conditions
    Returns: (success, message)
    """
    try:
        img = cv2.imread(image_path)
        if img is None:
            return False, "Failed to read image"
        
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Use pre-loaded haar cascade for faster face detection
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) == 0:
            return False, "No face detected"
        if len(faces) > 1:
            return False, "Multiple faces detected"
        
        # Check image brightness
        brightness = np.mean(gray)
        if brightness < 50:
            return False, "Poor lighting conditions"
            
        return True, "Face detected successfully"
    except Exception as e:
        return False, f"Error: {str(e)}"

def create_embedding(image_path):
    """
    Creates facial embedding using FaceNet
    """
    try:
        embedding = DeepFace.represent(img_path=image_path, model_name="Facenet", enforce_detection=False)
        return embedding
    except Exception as e:
        print(f"Error creating embedding: {str(e)}")
        return None

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
    
    # Create user folder if it doesn't exist
    user_folder = os.path.join(UPLOAD_FOLDER, f"{name}_{roll_no}")
    os.makedirs(user_folder, exist_ok=True)
    
    # Save the image
    image_path = os.path.join(user_folder, f"image_{image_index}.jpg")
    image.save(image_path)
    
    # Detect face
    is_valid, message = detect_face(image_path)
    if not is_valid:
        os.remove(image_path)  # Remove invalid image
        return jsonify({"success": False, "message": message}), 400
    
    # If this is the last image (index 4), create embeddings for all images
    if image_index == 4:
        user_embeddings = []
        
        for i in range(5):
            img_path = os.path.join(user_folder, f"image_{i}.jpg")
            embedding = create_embedding(img_path)
            if embedding:
                user_embeddings.append(embedding)
        
        # Save embeddings
        if len(user_embeddings) == 5:
            embedding_folder = os.path.join(EMBEDDINGS_FOLDER, f"{name}_{roll_no}")
            os.makedirs(embedding_folder, exist_ok=True)
            
            # Save student info
            student_info = {
                "name": name,
                "roll_no": roll_no,
                "class": student_class
            }
            
            with open(os.path.join(embedding_folder, "info.json"), "w") as f:
                json.dump(student_info, f)
            
            # Save each embedding
            for i, emb in enumerate(user_embeddings):
                embedding_path = os.path.join(embedding_folder, f"embedding_{i}.npy")
                np.save(embedding_path, np.array(emb))
            
            return jsonify({
                "success": True, 
                "message": "All images processed successfully and embeddings created"
            })
        else:
            return jsonify({
                "success": False, 
                "message": "Failed to create embeddings for all images"
            }), 500
    
    return jsonify({
        "success": True, 
        "message": f"Image {image_index+1} uploaded and validated successfully"
    })

def verify_face(args):
    """
    Worker function for parallel verification
    """
    group_image_path, student_img_path, student_info = args
    try:
        verification = DeepFace.verify(
            img1_path=group_image_path,
            img2_path=student_img_path,
            model_name="Facenet",
            distance_metric="cosine",
            detector_backend="opencv",
            enforce_detection=False
        )
        
        if verification.get('verified', False):
            return student_info
        return None
    except Exception:
        return None

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
        # Extract faces from the group photo first to validate face count
        detected_faces = DeepFace.extract_faces(
            img_path=group_image_path,
            enforce_detection=True,
            detector_backend="opencv"
        )
        
        face_count = len(detected_faces)
        print(f"Detected {face_count} faces in the group photo")
        
        if face_count == 0:
            if os.path.exists(group_image_path):
                os.remove(group_image_path)
            return jsonify({
                "success": False,
                "message": "No faces detected in the group photo"
            }), 400
        
        # Get all student embeddings
        all_students = []
        student_db = {}
        
        for student_folder in os.listdir(EMBEDDINGS_FOLDER):
            folder_path = os.path.join(EMBEDDINGS_FOLDER, student_folder)
            if os.path.isdir(folder_path):
                # Load student info
                try:
                    with open(os.path.join(folder_path, "info.json"), "r") as f:
                        student_info = json.load(f)
                    
                    student_id = f"{student_info['name']}_{student_info['roll_no']}"
                    student_db[student_id] = student_info
                    
                    # Store image paths for verification
                    student_img_folder = os.path.join(UPLOAD_FOLDER, student_id)
                    if os.path.exists(student_img_folder):
                        student_images = [
                            os.path.join(student_img_folder, f"image_{i}.jpg") 
                            for i in range(5) if os.path.exists(os.path.join(student_img_folder, f"image_{i}.jpg"))
                        ]
                        if student_images:  # Only add if we have at least one valid image
                            student_info["images"] = student_images
                            all_students.append(student_info)
                except Exception as e:
                    print(f"Error loading student info: {str(e)}")
                    continue
        
        # Approach 1: Using parallel verification with a fixed maximum output
        recognized_students = []
        verification_tasks = []
        
        # Create verification tasks
        for student_info in all_students:
            for img_path in student_info.get('images', []):
                if os.path.exists(img_path):
                    verification_tasks.append((group_image_path, img_path, student_info))
        
        # Process tasks in parallel
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            results = list(executor.map(verify_face, verification_tasks))
        
        # Process results
        student_matches = {}
        for result in results:
            if result:
                student_id = f"{result['name']}_{result['roll_no']}"
                # Count matches for each student
                if student_id in student_matches:
                    student_matches[student_id]["count"] += 1
                else:
                    student_matches[student_id] = {
                        "info": result,
                        "count": 1
                    }
        
        # Sort by match count (more matches = higher confidence)
        sorted_matches = sorted(student_matches.values(), key=lambda x: x["count"], reverse=True)
        
        # Limit to the actual number of faces detected
        max_results = min(face_count, len(sorted_matches))
        
        # Take only the top matches
        for i in range(max_results):
            if i < len(sorted_matches):
                student_info = sorted_matches[i]["info"]
                student_copy = {
                    'name': student_info.get('name'),
                    'roll_no': student_info.get('roll_no'),
                    'class': student_info.get('class')
                }
                recognized_students.append(student_copy)
        
        # Clean up
        if os.path.exists(group_image_path):
            os.remove(group_image_path)
        
        end_time = time.time()
        print(f"Recognition completed in {end_time - start_time:.2f} seconds")
        
        return jsonify({
            "success": True,
            "recognized_students": recognized_students,
            "faces_detected": face_count,
            "processing_time_seconds": round(end_time - start_time, 2)
        })
    
    except Exception as e:
        print(f"Recognition process error: {str(e)}")
        if os.path.exists(group_image_path):
            os.remove(group_image_path)
        return jsonify({
            "success": False,
            "message": f"Recognition error: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)