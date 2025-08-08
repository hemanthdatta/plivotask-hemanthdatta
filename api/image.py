import os
import json
import tempfile
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from skills.image import ImageAnalyzer

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this')
jwt = JWTManager(app)

def handler(request):
    """Vercel serverless function handler for image analysis"""
    with app.app_context():
        if request.method == 'POST':
            return analyze_image(request)
        
        return jsonify({'error': 'Method not allowed'}), 405

@jwt_required()
def analyze_image(request):
    """Analyze uploaded image"""
    try:
        # Check for image file
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        image_file = request.files['image']
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
            image_file.save(tmp_file.name)
            temp_path = tmp_file.name
        
        # Analyze the image
        analyzer = ImageAnalyzer()
        result = analyzer.analyze(temp_path)
        
        # Clean up temp file
        os.unlink(temp_path)
        
        return jsonify({
            'status': 'success',
            'result': result
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
