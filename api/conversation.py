import os
import json
import tempfile
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from skills.conversation import ConversationAnalyzer

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this')
jwt = JWTManager(app)

def handler(request):
    """Vercel serverless function handler for conversation analysis"""
    with app.app_context():
        if request.method == 'POST':
            return analyze_conversation(request)
        
        return jsonify({'error': 'Method not allowed'}), 405

@jwt_required()
def analyze_conversation(request):
    """Analyze conversation audio"""
    try:
        # Check for audio file
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp_file:
            audio_file.save(tmp_file.name)
            temp_path = tmp_file.name
        
        # Analyze the audio
        analyzer = ConversationAnalyzer()
        result = analyzer.analyze(temp_path)
        
        # Clean up temp file
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
