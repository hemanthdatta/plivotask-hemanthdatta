import os
import json
import tempfile
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from skills.summarization import DocumentSummarizer

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
jwt = JWTManager(app)

def handler(request):
    """Vercel serverless function handler for document summarization"""
    with app.app_context():
        if request.method == 'POST':
            return summarize_content(request)
        
        return jsonify({'error': 'Method not allowed'}), 405

@jwt_required()
def summarize_content(request):
    """Summarize document or URL content"""
    try:
        data = request.get_json() if request.is_json else request.form
        
        summarizer = DocumentSummarizer()
        
        # Check if it's a URL or file upload
        if 'url' in data:
            url = data.get('url')
            result = summarizer.summarize_url(url)
        elif 'document' in request.files:
            document_file = request.files['document']
            
            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
                document_file.save(tmp_file.name)
                temp_path = tmp_file.name
            
            # Summarize the document
            result = summarizer.summarize_document(temp_path)
            
            # Clean up temp file
            os.unlink(temp_path)
        else:
            return jsonify({'error': 'No URL or document provided'}), 400
        
        return jsonify({
            'status': 'success',
            'result': result
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
