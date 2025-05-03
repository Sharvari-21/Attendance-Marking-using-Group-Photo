from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
import cv2
from deepface import DeepFace
import uuid
import shutil
import json

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
EMBEDDINGS_FOLDER = 'embeddings'

# Create folders if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(EMBEDDINGS_FOLDER, exist_ok=True)

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
        
        # Use haar cascade for quick face detection
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
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
        embedding = DeepFace.represent(img_path=image_path, model_name="Facenet")
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

@app.route('/api/recognize-group', methods=['POST'])
def recognize_group():
    if 'image' not in request.files:
        return jsonify({"success": False, "message": "No image provided"}), 400
    
    image = request.files['image']
    
    # Save the group image temporarily
    group_image_path = os.path.join(UPLOAD_FOLDER, f"group_{uuid.uuid4()}.jpg")
    image.save(group_image_path)
    
    try:
        # Create a directory structure that DeepFace.find() expects
        representations_folder = os.path.join(UPLOAD_FOLDER, "representations")
        os.makedirs(representations_folder, exist_ok=True)
        
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
                    
                    # Store image paths for DeepFace verification
                    student_img_folder = os.path.join(UPLOAD_FOLDER, student_id)
                    if os.path.exists(student_img_folder):
                        student_info["images"] = [
                            os.path.join(student_img_folder, f"image_{i}.jpg") 
                            for i in range(5)
                        ]
                        all_students.append(student_info)
                except Exception as e:
                    print(f"Error loading student info: {str(e)}")
                    continue
        
        # Extract faces from the group photo
        try:
            # Method 1: Using DeepFace directly for verification
            recognized_students = []
            detection_results = DeepFace.extract_faces(img_path=group_image_path, 
                                                      enforce_detection=True,
                                                      detector_backend="opencv")
            
            print(f"Detected {len(detection_results)} faces in the group photo")
            
            # If faces detected, do verification against each student
            if len(detection_results) > 0:
                for student_info in all_students:
                    # Try to verify against each student image
                    for img_path in student_info.get('images', []):
                        if not os.path.exists(img_path):
                            continue
                            
                        try:
                            # Try verification - we only need one successful match
                            verification = DeepFace.verify(img1_path=group_image_path, 
                                                          img2_path=img_path,
                                                          model_name="Facenet", 
                                                          distance_metric="cosine",
                                                          detector_backend="opencv")
                            
                            print(f"Verification result for {student_info['name']}: {verification}")
                            
                            # If verified successfully, add to recognized list
                            if verification.get('verified', False):
                                student_id = f"{student_info['name']}_{student_info['roll_no']}"
                                student_data = student_db.get(student_id, {})
                                
                                # Don't add duplicates
                                if student_data and not any(s.get('name') == student_data.get('name') and 
                                                          s.get('roll_no') == student_data.get('roll_no') 
                                                          for s in recognized_students):
                                    # Create a copy without embedding data
                                    student_copy = {
                                        'name': student_data.get('name'),
                                        'roll_no': student_data.get('roll_no'),
                                        'class': student_data.get('class')
                                    }
                                    recognized_students.append(student_copy)
                                    break  # Found a match for this student, move to next
                        except Exception as verify_err:
                            print(f"Verification error for {img_path}: {str(verify_err)}")
                            continue
            
            # Method 2: Use DeepFace.find() as a fallback if no results from verification
            if len(recognized_students) == 0:
                print("Using DeepFace.find() as fallback")
                # Create a database structure DeepFace.find() can use
                temp_db_path = os.path.join(UPLOAD_FOLDER, "temp_db")
                os.makedirs(temp_db_path, exist_ok=True)
                
                # Copy student faces to the temp_db
                for student_info in all_students:
                    student_id = f"{student_info['name']}_{student_info['roll_no']}"
                    student_folder = os.path.join(temp_db_path, student_id)
                    os.makedirs(student_folder, exist_ok=True)
                    
                    # Copy images to temp folder
                    for i, img_path in enumerate(student_info.get('images', [])):
                        if os.path.exists(img_path):
                            dest_path = os.path.join(student_folder, f"img_{i}.jpg")
                            shutil.copy(img_path, dest_path)
                
                # Use find to search for matches
                try:
                    results = DeepFace.find(img_path=group_image_path, 
                                           db_path=temp_db_path,
                                           model_name="Facenet",
                                           distance_metric="cosine",
                                           enforce_detection=False,
                                           silent=True)
                    
                    if isinstance(results, list) and len(results) > 0:
                        for result in results:
                            if not result.empty:
                                for index, row in result.iterrows():
                                    identity = row['identity']
                                    distance = row['distance']
                                    
                                    # Lower distance means better match
                                    if distance < 0.5:  # Threshold for face match
                                        try:
                                            folder_name = os.path.basename(os.path.dirname(identity))
                                            student_id = folder_name
                                            student_data = student_db.get(student_id, {})
                                            
                                            # Don't add duplicates
                                            if student_data and not any(s.get('name') == student_data.get('name') and 
                                                                      s.get('roll_no') == student_data.get('roll_no') 
                                                                      for s in recognized_students):
                                                # Create a copy without embedding data
                                                student_copy = {
                                                    'name': student_data.get('name'),
                                                    'roll_no': student_data.get('roll_no'),
                                                    'class': student_data.get('class')
                                                }
                                                recognized_students.append(student_copy)
                                        except Exception as ex:
                                            print(f"Error processing identity: {str(ex)}")
                except Exception as find_err:
                    print(f"DeepFace.find() error: {str(find_err)}")
                
                # Clean up
                if os.path.exists(temp_db_path):
                    shutil.rmtree(temp_db_path)
            
            # Clean up
            if os.path.exists(group_image_path):
                os.remove(group_image_path)
            
            return jsonify({
                "success": True,
                "recognized_students": recognized_students
            })
        
        except Exception as e:
            print(f"Recognition process error: {str(e)}")
            if os.path.exists(group_image_path):
                os.remove(group_image_path)
            return jsonify({
                "success": False,
                "message": f"Recognition error: {str(e)}"
            }), 500
        
    except Exception as e:
        print(f"Server error: {str(e)}")
        if os.path.exists(group_image_path):
            os.remove(group_image_path)
        return jsonify({
            "success": False,
            "message": f"Server error: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)