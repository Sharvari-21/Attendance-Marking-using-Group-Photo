from pymongo import MongoClient
from bson import ObjectId
from config.settings import MONGODB_URI

client = MongoClient(MONGODB_URI)
db = client.get_database('FaceDetection2')

# Collections
students = db.students
face_images = db.face_images

class Student:
    """Student model for MongoDB"""
    
    @staticmethod
    def create(name, roll_no, student_class, image_urls=None):
        """Create a new student record"""
        student_data = {
            "name": name,
            "roll_no": roll_no,
            "class": student_class,
            "image_urls": image_urls or [],
            "created_at": ObjectId().generation_time
        }
        
        result = students.insert_one(student_data)
        return str(result.inserted_id)
    
    @staticmethod
    def get_all():
        """Get all students"""
        return list(students.find())
    
    @staticmethod
    def get_by_id(student_id):
        """Get student by ID"""
        return students.find_one({"_id": ObjectId(student_id)})
    
    @staticmethod
    def get_by_roll_no(roll_no):
        """Get student by roll number"""
        return students.find_one({"roll_no": roll_no})
    
    @staticmethod
    def update_image_urls(student_id, image_urls):
        """Update student's face image URLs"""
        return students.update_one(
            {"_id": ObjectId(student_id)},
            {"$set": {"image_urls": image_urls}}
        )
    
    @staticmethod
    def exists(name, roll_no):
        """Check if student exists"""
        return students.count_documents({"name": name, "roll_no": roll_no}) > 0
    
    