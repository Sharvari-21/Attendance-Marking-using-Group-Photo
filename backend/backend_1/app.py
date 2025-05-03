from flask import Flask
from flask_cors import CORS
from controllers.face_controller import face_routes
from config.settings import init_app_config

def create_app():
    app = Flask(__name__)
    
    # Initialize configurations
    init_app_config(app)
    
    # Enable CORS
    CORS(app)
    
    # Register routes
    app.register_blueprint(face_routes)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=3000)