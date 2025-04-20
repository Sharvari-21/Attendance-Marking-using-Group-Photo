from flask import Flask
from flask_cors import CORS
from controllers.face_controller import face_routes
from config.settings import init_app_config
from services.face_service import FaceService

def create_app():
    app = Flask(__name__)
    
    # Initialize configurations
    init_app_config(app)
    
    # Enable CORS
    CORS(app)
    
    # Register routes
    app.register_blueprint(face_routes)
    
    # Sync existing students to local storage on startup
    with app.app_context():
        try:
            print("Syncing student face data to local storage...")
            synced_count = FaceService.sync_all_students()
            print(f"Successfully synced {synced_count} students")
        except Exception as e:
            print(f"Warning: Failed to sync students on startup: {str(e)}")
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=3000)
