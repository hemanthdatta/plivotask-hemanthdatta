import os
import numpy as np
import google.generativeai as genai
from pydub import AudioSegment
import librosa
import soundfile as sf
from sklearn.cluster import KMeans
import tempfile
import requests
import json
from datetime import datetime

class ConversationAnalyzer:
    def __init__(self):
        # Initialize Gemini for analysis and diarization
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
        
        # LemonFox API configuration
        self.lemonfox_api_key = os.getenv('LEMONFOX_API_KEY', '3XtP1TlR8bOf7ExgtcuYCfU9VOxKIrHt')
        self.lemonfox_url = "https://api.lemonfox.ai/v1/audio/transcriptions"
        
        # Memory storage for last 5 conversations
        self.memory_file = 'conversation_memory.json'
        self.conversation_memory = self.load_memory()
    
    def convert_audio_to_wav(self, audio_path):
        """Convert any audio format to WAV for processing"""
        try:
            audio = AudioSegment.from_file(audio_path)
            wav_path = audio_path.replace(audio_path.split('.')[-1], 'wav')
            audio = audio.set_channels(1)  # Convert to mono
            audio = audio.set_frame_rate(16000)  # Set sample rate to 16kHz
            audio.export(wav_path, format="wav")
            return wav_path
        except Exception as e:
            print(f"Error converting audio: {e}")
            return audio_path
    
    def diarize_speakers(self, audio_path, transcription_data, max_speakers=2):
        """Use Gemini to perform speaker diarization based on transcript"""
        try:
            transcript = transcription_data.get('transcript', '')
            print(f"Starting diarization for transcript: {transcript[:100]}...")
            
            if not transcript or len(transcript.strip()) == 0:
                print("Empty transcript, creating single speaker segment")
                return self.create_single_speaker_segments(transcription_data)
            
            # Use past conversations as context if available
            context = ""
            if self.conversation_memory:
                context = "Previous conversation patterns:\n"
                for memory in self.conversation_memory[-3:]:
                    context += f"- {memory.get('summary', '')}\n"
            
            # Create prompt for Gemini to identify speakers
            prompt = f"""
You are a speaker diarization expert. Analyze this transcript and identify different speakers.

{context}

Transcript to analyze:
{transcript}

Instructions:
1. Identify up to {max_speakers} different speakers based on conversation flow, topic changes, and response patterns
2. If only one speaker is detected, label everything as "Speaker 1"
3. Break the conversation into logical segments by speaker
4. Each segment should contain complete thoughts or sentences

Respond with ONLY this JSON format (no markdown, no extra text):
{{
  "segments": [
    {{"speaker": "Speaker 1", "text": "first speaker's words"}},
    {{"speaker": "Speaker 2", "text": "second speaker's words"}}
  ]
}}
"""
            
            response = self.gemini_model.generate_content(prompt)
            
            # Parse the response
            try:
                response_text = response.text.strip()
                print(f"Raw Gemini response: {response_text}")
                
                # Clean up the response text
                if '```json' in response_text:
                    response_text = response_text.split('```json')[1].split('```')[0].strip()
                elif '```' in response_text:
                    response_text = response_text.split('```')[1].split('```')[0].strip()
                
                # Remove any leading/trailing whitespace and newlines
                response_text = response_text.strip()
                
                # Try to find JSON in the response
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                
                if start_idx != -1 and end_idx > start_idx:
                    json_text = response_text[start_idx:end_idx]
                    result = json.loads(json_text)
                else:
                    result = json.loads(response_text)
                
                segments = result.get('segments', [])
                
                if not segments:
                    print("No segments found in Gemini response")
                    return self.create_single_speaker_segments(transcription_data)
                
                # Add timestamps based on word count
                y, sr = librosa.load(audio_path, sr=16000)
                total_duration = len(y) / sr
                total_words = len(transcript.split())
                
                current_time = 0
                formatted_segments = []
                
                for segment in segments:
                    segment_text = segment.get('text', '')
                    segment_words = len(segment_text.split())
                    segment_duration = (segment_words / total_words) * total_duration if total_words > 0 else total_duration / len(segments)
                    
                    formatted_segments.append({
                        'speaker': segment.get('speaker', 'Speaker 1'),
                        'start_time': current_time,
                        'end_time': current_time + segment_duration,
                        'text': segment_text
                    })
                    
                    current_time += segment_duration
                
                print(f"Generated {len(formatted_segments)} speaker segments")
                return formatted_segments
                
            except (json.JSONDecodeError, KeyError, IndexError) as e:
                print(f"Failed to parse Gemini response: {e}")
                print(f"Response text: {response_text}")
                return self.create_single_speaker_segments(transcription_data)
            
        except Exception as e:
            print(f"Error in Gemini diarization: {e}")
            return self.create_single_speaker_segments(transcription_data)
    
    def create_single_speaker_segments(self, transcription_data):
        """Create a single speaker segment when diarization fails"""
        transcript = transcription_data.get('transcript', '')
        if not transcript:
            return []
        
        # Get audio duration from word timestamps if available
        word_timestamps = transcription_data.get('word_timestamps', [])
        if word_timestamps:
            duration = word_timestamps[-1]['end_time']
        else:
            # Estimate duration based on word count (average 2 words per second)
            duration = len(transcript.split()) / 2
        
        return [{
            'speaker': 'Speaker 1',
            'start_time': 0,
            'end_time': duration,
            'text': transcript
        }]
    
    def load_memory(self):
        """Load conversation memory from file"""
        try:
            if os.path.exists(self.memory_file):
                with open(self.memory_file, 'r') as f:
                    memory = json.load(f)
                    # Keep only last 5 conversations
                    return memory[-5:] if len(memory) > 5 else memory
        except Exception as e:
            print(f"Error loading memory: {e}")
        return []
    
    def save_to_memory(self, conversation_data):
        """Save conversation to memory"""
        try:
            # Create a summary of the conversation
            summary = {
                'timestamp': datetime.now().isoformat(),
                'transcript': conversation_data.get('transcript', '')[:500],  # First 500 chars
                'speakers': conversation_data.get('num_speakers', 1),
                'duration': conversation_data.get('audio_duration', 0),
                'summary': self.generate_summary(conversation_data.get('transcript', ''))
            }
            
            # Add to memory
            self.conversation_memory.append(summary)
            
            # Keep only last 5
            if len(self.conversation_memory) > 5:
                self.conversation_memory = self.conversation_memory[-5:]
            
            # Save to file
            with open(self.memory_file, 'w') as f:
                json.dump(self.conversation_memory, f, indent=2)
                
        except Exception as e:
            print(f"Error saving to memory: {e}")
    
    def generate_summary(self, transcript):
        """Generate a brief summary of the conversation"""
        try:
            if not transcript:
                return "Empty conversation"
            
            prompt = f"""Summarize this conversation in one sentence (max 100 characters):
            {transcript[:1000]}
            """
            
            response = self.gemini_model.generate_content(prompt)
            return response.text[:100] if response.text else "Conversation analyzed"
        except:
            return "Conversation analyzed"
    
    def perform_speaker_diarization(self, audio_path):
        """Custom speaker diarization using audio features and clustering"""
        try:
            # Load audio
            y, sr = librosa.load(audio_path, sr=16000)
            
            # Extract MFCC features for speaker characteristics
            mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13, hop_length=512)
            
            # Segment audio into chunks
            chunk_length = int(sr * 2)  # 2-second chunks
            chunks = []
            chunk_features = []
            
            for i in range(0, len(y), chunk_length):
                chunk = y[i:i+chunk_length]
                if len(chunk) < chunk_length * 0.5:  # Skip very short chunks
                    continue
                
                # Extract features for this chunk
                chunk_mfcc = librosa.feature.mfcc(y=chunk, sr=sr, n_mfcc=13)
                chunk_feature = np.mean(chunk_mfcc, axis=1)
                chunk_features.append(chunk_feature)
                chunks.append({
                    'start': i / sr,
                    'end': min((i + chunk_length) / sr, len(y) / sr),
                    'audio': chunk
                })
            
            if len(chunk_features) < 2:
                # Not enough data for diarization
                return [{
                    'speaker': 'Speaker 1',
                    'segments': [(0, len(y) / sr)]
                }]
            
            # Perform clustering (K-means with k=2 for two speakers)
            features_array = np.array(chunk_features)
            n_speakers = min(2, len(features_array))  # Max 2 speakers as per requirement
            kmeans = KMeans(n_clusters=n_speakers, random_state=42)
            labels = kmeans.fit_predict(features_array)
            
            # Group segments by speaker
            speaker_segments = {f'Speaker {i+1}': [] for i in range(n_speakers)}
            
            for idx, label in enumerate(labels):
                speaker = f'Speaker {label + 1}'
                segment = chunks[idx]
                speaker_segments[speaker].append((segment['start'], segment['end']))
            
            # Merge consecutive segments from the same speaker
            diarization_result = []
            for speaker, segments in speaker_segments.items():
                if segments:
                    merged_segments = []
                    segments.sort(key=lambda x: x[0])
                    
                    current_start, current_end = segments[0]
                    for start, end in segments[1:]:
                        if start - current_end < 1.0:  # Merge if gap < 1 second
                            current_end = end
                        else:
                            merged_segments.append((current_start, current_end))
                            current_start, current_end = start, end
                    merged_segments.append((current_start, current_end))
                    
                    diarization_result.append({
                        'speaker': speaker,
                        'segments': merged_segments
                    })
            
            return diarization_result
            
        except Exception as e:
            print(f"Error in speaker diarization: {e}")
            return []
    
    def transcribe_audio(self, audio_path):
        """Transcribe audio using LemonFox AI API"""
        try:
            # Upload the audio file to LemonFox API
            headers = {
                "Authorization": f"Bearer {self.lemonfox_api_key}"
            }
            
            with open(audio_path, 'rb') as audio_file:
                files = {"file": audio_file}
                data = {
                    "language": "english",
                    "response_format": "json"
                }
                
                response = requests.post(
                    self.lemonfox_url,
                    headers=headers,
                    files=files,
                    data=data
                )
            
            if response.status_code == 200:
                result = response.json()
                transcript = result.get('text', '')
                
                # Get audio duration for timestamp generation
                y, sr = librosa.load(audio_path, sr=16000)
                duration = len(y) / sr
                
                # Generate approximate word timestamps
                words = transcript.split()
                word_timestamps = []
                words_per_second = len(words) / max(duration, 1)
                
                for i, word in enumerate(words):
                    start_time = i / words_per_second
                    end_time = (i + 1) / words_per_second
                    word_timestamps.append({
                        'word': word,
                        'start_time': start_time,
                        'end_time': min(end_time, duration)
                    })
                
                return {
                    'transcript': transcript,
                    'word_timestamps': word_timestamps
                }
            else:
                print(f"LemonFox API error: {response.status_code}")
                return self.transcribe_with_gemini(audio_path)
            
        except Exception as e:
            print(f"Error in LemonFox transcription: {e}")
            return self.transcribe_with_gemini(audio_path)
    
    def transcribe_with_gemini(self, audio_path):
        """Fallback transcription using Gemini (limited capability)"""
        try:
            # Note: Gemini has limited audio transcription capabilities
            # This is a fallback method
            prompt = """You are an audio transcription assistant. 
            Please note that this is an audio file that needs to be transcribed.
            Provide a general transcription or indicate if audio transcription is not available."""
            
            response = self.gemini_model.generate_content(prompt)
            
            return {
                'transcript': response.text if response.text else "Audio transcription not available via Gemini API",
                'word_timestamps': []
            }
        except Exception as e:
            return {
                'transcript': f"Transcription error: {str(e)}",
                'word_timestamps': []
            }
    
    def analyze(self, audio_path):
        """Main method to analyze audio file"""
        try:
            # Convert to WAV for processing
            wav_path = self.convert_audio_to_wav(audio_path)
            
            # Get audio duration
            y, sr = librosa.load(wav_path, sr=16000)
            duration = len(y) / sr
            
            # Perform transcription using LemonFox API
            transcription_result = self.transcribe_audio(wav_path)
            
            # Perform speaker diarization using Gemini
            speaker_segments = self.diarize_speakers(wav_path, transcription_result)
            
            # Clean up temporary file if created
            if wav_path != audio_path and os.path.exists(wav_path):
                os.remove(wav_path)
            
            result = {
                'transcript': transcription_result['transcript'],
                'speaker_segments': speaker_segments,
                'audio_duration': duration,
                'num_speakers': len(set(s['speaker'] for s in speaker_segments)) if speaker_segments else 1,
                'memory_context': [m.get('summary', '') for m in self.conversation_memory[-3:]] if self.conversation_memory else []
            }
            
            # Save to memory
            self.save_to_memory(result)
            
            return result
        
        except Exception as e:
            print(f"Error in audio analysis: {e}")
            return {
                'error': str(e),
                'transcript': '',
                'speaker_segments': [],
                'audio_duration': 0,
                'num_speakers': 0
            }
