from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv
import re

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Create the model
generation_config = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 1024,
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
)

# Context about Bodh Gaya and Mahabodhi Temple
SYSTEM_CONTEXT = """You are Bodhi Guide, a knowledgeable and friendly AI assistant for Divine Destinations, specializing in Bodh Gaya and the Mahabodhi Temple. 

Your knowledge includes:
- Mahabodhi Temple: UNESCO World Heritage Site where Buddha attained enlightenment, 55m tall, built by Emperor Ashoka
- Buddha's Enlightenment: Occurred under the Bodhi Tree after 49 days of meditation, around 2500 years ago
- Visiting Hours: Temple 5AM-9PM, Meditation Park 5AM-6PM, Museum 10AM-5PM (closed Fridays)
- Best time to visit: October to March (15-25°C), December for Bodhi Day
- Nearby attractions: Thai Monastery, Great Buddha Statue (80ft), Royal Bhutan Monastery, Vietnamese Temple, Japanese Temple, Dungeshwari Cave, Archaeological Museum
- Getting there: Gaya Airport (12km), Gaya Junction (16km), then auto/taxi to Bodh Gaya
- Accommodation: Budget monasteries (free/donation), mid-range hotels, luxury options
- Etiquette: Modest dress, remove shoes, walk clockwise, no photography inside main temple
- Food: Mostly vegetarian, Thai Temple free lunch at 12PM
- Emergency contacts: 112 (emergency), Tourist Police: +91-631-2200795

Always be helpful, respectful, and provide accurate information. Use emojis appropriately. If unsure, admit it and suggest alternatives."""

# Initialize chat session
chat_session = model.start_chat(history=[
    {
        "role": "user",
        "parts": [SYSTEM_CONTEXT]
    },
    {
        "role": "model",
        "parts": ["Understood. I am Bodhi Guide, ready to help visitors explore the sacred land of Bodh Gaya and the Mahabodhi Temple. 🙏"]
    }
])

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        # Send message to Gemini
        response = chat_session.send_message(user_message)
        
        # Clean up the response
        bot_response = response.text.strip()
        
        # Format response for better display
        bot_response = format_response(bot_response)
        
        return jsonify({
            'response': bot_response,
            'status': 'success'
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'error': 'Sorry, I encountered an error. Please try again.',
            'status': 'error'
        }), 500

def format_response(text):
    """Format the response for better display in chat"""
    # Convert markdown bold to HTML
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    
    # Convert markdown lists to HTML
    lines = text.split('\n')
    formatted_lines = []
    in_list = False
    
    for line in lines:
        line = line.strip()
        if line.startswith('- ') or line.startswith('• '):
            if not in_list:
                formatted_lines.append('<ul>')
                in_list = True
            formatted_lines.append(f'<li>{line[2:]}</li>')
        else:
            if in_list and line:
                formatted_lines.append('</ul>')
                in_list = False
            if line:
                formatted_lines.append(line)
    
    if in_list:
        formatted_lines.append('</ul>')
    
    return '\n'.join(formatted_lines)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))

    