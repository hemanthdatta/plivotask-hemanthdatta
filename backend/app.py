import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from dotenv import load_dotenv
from datetime import timedelta
import bcrypt
from werkzeug.utils import secure_filename
import json

# Import skill modules
from skills.conversation import ConversationAnalyzer
from skills.image import ImageAnalyzer
from skills.summarization import DocumentSummarizer

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

# Create upload directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

CORS(app)
jwt = JWTManager(app)

# Simple in-memory user storage (in production, use a database)
users_db = {}

# Initialize skill handlers
conversation_analyzer = ConversationAnalyzer()
image_analyzer = ImageAnalyzer()
document_summarizer = DocumentSummarizer()

# Allowed file extensions
ALLOWED_AUDIO = {'wav', 'mp3', 'm4a', 'ogg', 'flac'}
ALLOWED_IMAGES = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
ALLOWED_DOCS = {'pdf', 'doc', 'docx', 'txt'}

def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'message': 'AI Playground Backend API',
        'status': 'running',
        'endpoints': [
            '/api/health',
            '/api/register',
            '/api/login',
            '/api/skills/conversation',
            '/api/skills/image',
            '/api/skills/summarize',
            '/api/user/profile'
        ]
    }), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'AI Playground API is running'}), 200

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        
        if not username or not password or not email:
            return jsonify({'error': 'Username, email, and password are required'}), 400
        
        if username in users_db:
            return jsonify({'error': 'Username already exists'}), 409
        
        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Store user
        users_db[username] = {
            'password': hashed_password,
            'email': email
        }
        
        # Create access token
        access_token = create_access_token(identity=username)
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'username': username
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        # Check if user exists
        if username not in users_db:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Verify password
        stored_password = users_db[username]['password']
        if not bcrypt.checkpw(password.encode('utf-8'), stored_password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Create access token
        access_token = create_access_token(identity=username)
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'username': username
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/skills/conversation', methods=['POST'])
@jwt_required()
def analyze_conversation():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        
        # Save uploaded file temporarily
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp_file:
            audio_file.save(tmp_file.name)
            temp_path = tmp_file.name
        
        # Analyze the audio
        analyzer = ConversationAnalyzer()
        result = analyzer.analyze(temp_path)
        
        # Clean up temp file
        import os
        os.unlink(temp_path)
        
        # Format response for frontend compatibility
        if 'error' not in result:
            formatted_result = {
                'transcription': result.get('transcript', ''),
                'speaker_diarization': [],
                'memory_context': result.get('memory_context', [])
            }
            
            # Convert speaker segments to frontend format
            speakers = {}
            for segment in result.get('speaker_segments', []):
                speaker = segment['speaker']
                if speaker not in speakers:
                    speakers[speaker] = {
                        'speaker': speaker,
                        'segments': []
                    }
                speakers[speaker]['segments'].append({
                    'start_time': segment['start_time'],
                    'end_time': segment['end_time'],
                    'text': segment['text']
                })
            
            formatted_result['speaker_diarization'] = list(speakers.values())
            formatted_result['audio_duration'] = result.get('audio_duration', 0)
            formatted_result['num_speakers'] = result.get('num_speakers', 1)
            
            print(f"Sending to frontend: {len(formatted_result['speaker_diarization'])} speakers")
            for speaker in formatted_result['speaker_diarization']:
                print(f"- {speaker['speaker']}: {len(speaker['segments'])} segments")
            
            return jsonify({
                'status': 'success',
                'result': formatted_result
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': result.get('error', 'Unknown error')
            }), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/skills/image', methods=['POST'])
@jwt_required()
def analyze_image():
    try:
        current_user = get_jwt_identity()
        
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename, ALLOWED_IMAGES):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{current_user}_{filename}")
            file.save(filepath)
            
            # Analyze image
            result = image_analyzer.analyze(filepath)
            
            # Clean up uploaded file
            os.remove(filepath)
            
            return jsonify({
                'status': 'success',
                'result': result
            }), 200
        else:
            return jsonify({'error': 'Invalid file format. Supported: PNG, JPG, JPEG, GIF, BMP, WEBP'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/skills/summarize', methods=['POST'])
@jwt_required()
def summarize_content():
    try:
        current_user = get_jwt_identity()
        
        # Check if it's a URL submission
        if request.is_json:
            data = request.get_json()
            url = data.get('url')
            if url:
                result = document_summarizer.summarize_url(url)
                return jsonify({
                    'status': 'success',
                    'result': result
                }), 200
            else:
                return jsonify({'error': 'URL is required'}), 400
        
        # Check for file upload
        if 'document' not in request.files:
            return jsonify({'error': 'No document file or URL provided'}), 400
        
        file = request.files['document']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename, ALLOWED_DOCS):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{current_user}_{filename}")
            file.save(filepath)
            
            # Summarize document
            result = document_summarizer.summarize_document(filepath)
            
            # Clean up uploaded file
            os.remove(filepath)
            
            return jsonify({
                'status': 'success',
                'result': result
            }), 200
        else:
            return jsonify({'error': 'Invalid file format. Supported: PDF, DOC, DOCX, TXT'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_user = get_jwt_identity()
        if current_user in users_db:
            return jsonify({
                'username': current_user,
                'email': users_db[current_user]['email']
            }), 200
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
