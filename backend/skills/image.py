import os
import google.generativeai as genai
from PIL import Image
import base64
import io

class ImageAnalyzer:
    def __init__(self):
        # Initialize Gemini for image analysis
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        self.vision_model = genai.GenerativeModel('gemini-2.5-flash')
    
    def analyze(self, image_path):
        """Analyze image and generate detailed description using Gemini"""
        try:
            # Open and prepare the image
            image = Image.open(image_path)
            
            # Create a detailed prompt for image analysis
            prompt = """Please provide a comprehensive analysis of this image including:

1. **Main Subject**: What is the primary focus or subject of the image?
2. **Visual Description**: Describe what you see in detail (objects, people, scenery, etc.)
3. **Colors and Composition**: What are the dominant colors and how is the image composed?
4. **Context and Setting**: Where does this appear to be taking place? What's the environment?
5. **Mood and Atmosphere**: What mood or feeling does the image convey?
6. **Notable Details**: Any interesting or unique details worth mentioning?
7. **Technical Aspects**: Comment on lighting, perspective, or photographic technique if relevant.
8. **Possible Purpose**: What might be the purpose or use case for this image?

Please be thorough but concise in your analysis."""
            
            # Generate content using Gemini
            response = self.vision_model.generate_content([prompt, image])
            
            # Extract text from response
            if response.text:
                analysis = response.text
            else:
                analysis = "Unable to generate image analysis. Please try again."
            
            # Also get a brief summary
            summary_prompt = "Provide a brief one-paragraph summary of this image in 2-3 sentences."
            summary_response = self.vision_model.generate_content([summary_prompt, image])
            
            return {
                'detailed_analysis': analysis,
                'brief_summary': summary_response.text if summary_response.text else "Image uploaded successfully.",
                'image_properties': {
                    'format': image.format,
                    'mode': image.mode,
                    'size': f"{image.width}x{image.height}",
                    'file_size': os.path.getsize(image_path)
                }
            }
            
        except Exception as e:
            return {
                'error': f'Image analysis failed: {str(e)}',
                'detailed_analysis': '',
                'brief_summary': '',
                'image_properties': {}
            }
    
    def extract_text_from_image(self, image_path):
        """Extract any text present in the image (OCR functionality)"""
        try:
            image = Image.open(image_path)
            
            prompt = """Extract and transcribe all text visible in this image. 
            If there is no text, respond with 'No text found in image.'
            Format the extracted text maintaining its original structure as much as possible."""
            
            response = self.vision_model.generate_content([prompt, image])
            
            return {
                'extracted_text': response.text if response.text else "No text found in image."
            }
            
        except Exception as e:
            return {
                'extracted_text': f'Text extraction failed: {str(e)}'
            }
    
    def detect_objects(self, image_path):
        """Detect and list objects in the image"""
        try:
            image = Image.open(image_path)
            
            prompt = """List all identifiable objects, people, animals, or items in this image.
            Format as a bulleted list with brief descriptions.
            Also provide a count of main objects detected."""
            
            response = self.vision_model.generate_content([prompt, image])
            
            return {
                'objects_detected': response.text if response.text else "No objects detected."
            }
            
        except Exception as e:
            return {
                'objects_detected': f'Object detection failed: {str(e)}'
            }
