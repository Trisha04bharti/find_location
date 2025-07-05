class AIBodhiChatbot {
    constructor() {
        this.isOpen = false;
        this.messagesContainer = document.getElementById('chatbot-messages');
        this.inputField = document.getElementById('chatbot-input');
        this.form = document.getElementById('chatbot-form');
        this.toggleBtn = document.getElementById('chatbot-toggle');
        this.closeBtn = document.getElementById('chatbot-close');
        this.container = document.getElementById('chatbot-container');
        
        // Backend URL - Update this when deploying
        this.backendUrl = 'http://localhost:5000';  // Change to your deployed backend URL
        
        this.init();
    }
    
    init() {
        // Toggle chatbot
        this.toggleBtn.addEventListener('click', () => this.toggle());
        this.closeBtn.addEventListener('click', () => this.close());
        
        // Handle form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUserInput();
        });
        
        // Handle suggestion chips
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                this.inputField.value = chip.dataset.message;
                this.handleUserInput();
            });
        });
        
        // Remove notification after first open
        this.toggleBtn.addEventListener('click', () => {
            const notification = document.querySelector('.chatbot-notification');
            if (notification) notification.style.display = 'none';
        }, { once: true });
        
        // Enter key handling
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserInput();
            }
        });
    }
    
    toggle() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.container.classList.add('active');
            this.toggleBtn.classList.add('active');
            this.toggleBtn.innerHTML = '<i class="ri-close-line"></i>';
            this.inputField.focus();
        } else {
            this.close();
        }
    }
    
    close() {
        this.isOpen = false;
        this.container.classList.remove('active');
        this.toggleBtn.classList.remove('active');
        this.toggleBtn.innerHTML = '<i class="ri-chat-3-line"></i>';
    }
    
    async handleUserInput() {
        const userMessage = this.inputField.value.trim();
        if (!userMessage) return;
        
        // Add user message
        this.addMessage(userMessage, 'user');
        
        // Clear input
        this.inputField.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Send message to AI backend
            const response = await this.sendToAI(userMessage);
            
            // Remove typing indicator
            this.removeTypingIndicator();
            
            // Add AI response
            this.addMessage(response, 'bot');
            
        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator();
            this.addMessage('I apologize, but I\'m having trouble connecting to my knowledge base. Please try again in a moment. 🙏', 'bot');
        }
    }
    
    async sendToAI(message) {
        try {
            const response = await fetch(`${this.backendUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            return data.response;
            
        } catch (error) {
            console.error('Error calling AI:', error);
            throw error;
        }
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chatbot-message', `${sender}-message`);
        
        if (sender === 'bot') {
            messageDiv.innerHTML = `
                <img src="https://pbs.twimg.com/profile_images/1499265096006000640/ZhEnSTch_400x400.jpg" alt="Buddha" class="message-avatar">
                <div class="message-content">${this.formatMessage(text)}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">${this.escapeHtml(text)}</div>
            `;
        }
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Animate message entrance
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(10px)';
        requestAnimationFrame(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        });
    }
    
    formatMessage(text) {
        // Split by newlines and wrap in paragraphs
        const paragraphs = text.split('\n').filter(p => p.trim());
        
        return paragraphs.map(paragraph => {
            // Check if it's already HTML formatted
            if (paragraph.includes('<ul>') || paragraph.includes('<li>') || paragraph.includes('<strong>')) {
                return paragraph;
            }
            // Otherwise wrap in paragraph tags
            return `<p>${paragraph}</p>`;
        }).join('');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('chatbot-message', 'bot-message', 'typing-message');
        typingDiv.innerHTML = `
            <img src="https://pbs.twimg.com/profile_images/1499265096006000640/ZhEnSTch_400x400.jpg" alt="Buddha" class="message-avatar">
            <div class="typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    removeTypingIndicator() {
        const typingMessage = document.querySelector('.typing-message');
        if (typingMessage) typingMessage.remove();
    }
    
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const aiChatbot = new AIBodhiChatbot();
});