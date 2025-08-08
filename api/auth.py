import os
import json
import bcrypt
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token
from datetime import timedelta

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this')
jwt = JWTManager(app)

# In-memory user storage (for demo purposes)
users = {}

def handler(request):
    """Vercel serverless function handler"""
    with app.app_context():
        if request.method == 'POST':
            data = request.get_json()
            
            if request.path.endswith('/register'):
                return register_user(data)
            elif request.path.endswith('/login'):
                return login_user(data)
        
        return jsonify({'error': 'Method not allowed'}), 405

def register_user(data):
    """Register a new user"""
    try:
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        if username in users:
            return jsonify({'error': 'User already exists'}), 400
        
        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        users[username] = {
            'password': hashed_password,
            'created_at': str(datetime.utcnow())
        }
        
        return jsonify({'message': 'User registered successfully'}), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def login_user(data):
    """Login user and return JWT token"""
    try:
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        if username not in users:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Check password
        if bcrypt.checkpw(password.encode('utf-8'), users[username]['password']):
            access_token = create_access_token(
                identity=username,
                expires_delta=timedelta(hours=24)
            )
            return jsonify({'access_token': access_token}), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
