import os
import uuid
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from services.face_service import FaceService
from config.settings import UPLOAD_FOLDER

face_routes = Blueprint('face_routes', __name__)

def allowed_file(filename):
    """Check if file is allowed"""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_temp_file(file):
    """Save uploaded file to temporary location"""
    filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    return filepath

@face_routes.route('/api/upload-face', methods=['POST'])
def upload_face():
    """Handle face image upload for student registration"""
    if 'image' not in request.files:
        return jsonify({"success": False, "message": "No image provided"}), 400
    
    required_fields = ['name', 'roll_no', 'class', 'imageIndex']
    for field in required_fields:
        if field not in request.form:
            return jsonify({"success": False, "message": f"Missing required field: {field}"}), 400
    
    image = request.files['image']
    name = request.form['name']
    roll_no = request.form['roll_no']
    student_class = request.form['class']
    
    try:
        image_index = int(request.form['imageIndex'])  # 0-4 for the 5 images
        if image_index < 0 or image_index > 4:
            return jsonify({"success": False, "message": "Image index must be between 0 and 4"}), 400
    except ValueError:
        return jsonify({"success": False, "message": "Invalid image index"}), 400
    
    if not allowed_file(image.filename):
        return jsonify({"success": False, "message": "Invalid file type"}), 400
    
    # Save file temporarily
    image_path = save_temp_file(image)
    
    try:
        # Process the image
        success, message, student_id = FaceService.process_student_image(
            image_path, name, roll_no, student_class, image_index
        )
        
        # Clean up temporary file
        if os.path.exists(image_path):
            os.remove(image_path)
        
        if not success:
            return jsonify({"success": False, "message": message}), 400
            
        response_data = {
            "success": True,
            "message": message,
            "student_id": student_id
        }
        
        # If this is the last image, indicate completion
        if image_index == 4:
            response_data["registration_complete"] = True
            
        return jsonify(response_data)
        
    except Exception as e:
        # Clean up on error
        if os.path.exists(image_path):
            os.remove(image_path)
        return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500

@face_routes.route('/api/recognize-group', methods=['POST'])
def recognize_group():
    """Recognize students in a group photo"""
    if 'image' not in request.files:
        return jsonify({"success": False, "message": "No image provided"}), 400
        
    image = request.files['image']
    
    if not allowed_file(image.filename):
        return jsonify({"success": False, "message": "Invalid file type"}), 400
    
    # Save file temporarily
    image_path = save_temp_file(image)
    
    try:
        # Process the group image
        success, message, recognized_students = FaceService.recognize_faces_in_group(image_path)
        
        # Clean up temporary file
        if os.path.exists(image_path):
            os.remove(image_path)
        
        if not success:
            return jsonify({"success": False, "message": message}), 400
            
        return jsonify({
            "success": True,
            "message": message,
            "recognized_students": recognized_students
        })
        
    except Exception as e:
        # Clean up on error
        if os.path.exists(image_path):
            os.remove(image_path)
        return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500