document.addEventListener('DOMContentLoaded', () => {
    // Crear el contenedor del chatbot y su contenido
    const chatbotContainer = document.createElement('div');
    chatbotContainer.id = 'chatbot-container';
    chatbotContainer.innerHTML = `
        <div id="chatbot-toggle" class="chatbot-icon">
            <i class="fas fa-comment-dots"></i>
        </div>
        <div id="chatbot" class="chatbot-window">
            <div id="chatbot-header" class="chatbot-header">
                <h5>ChatBot</h5>
                <button id="chatbot-close" class="chatbot-close">&times;</button>
            </div>
            <div id="chatbot-messages" class="chatbot-messages"></div>
            <div class="chatbot-input-area">
                <input type="text" id="chatbot-input" placeholder="Escribe tu pregunta..." class="chatbot-input">
                <button id="chatbot-send" class="chatbot-send"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;
    document.body.appendChild(chatbotContainer); // Añadir al cuerpo del documento

    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbot = document.getElementById('chatbot');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');

    const responses = {
        "hola": "¡Hola! ¿En qué puedo ayudarte hoy?",
        "¿cómo estás?": "Estoy bien, gracias. ¿Y tú?",
        "qué puedes hacer": "Puedo responder preguntas básicas y ayudarte con información general.",
        "dónde estás": "Estoy en tu página web, listo para ayudarte.",
        "cuál es tu nombre": "Soy un chatbot sin nombre, pero puedes llamarme ChatBot.",
        "adiós": "¡Adiós! Que tengas un buen día.",
        "¿Cómo puedo reiniciar mi contraseña?": "Para reiniciar tu contraseña, por favor visita la página de recuperación de contraseña y sigue las instrucciones.",
        "Mi cuenta está bloqueada, ¿qué puedo hacer?": "Si tu cuenta está bloqueada, contacta a nuestro soporte técnico a través del formulario de contacto o llama al 123-456-7890.",
        "¿Cómo funcionas?": "Soy un chatbot diseñado para ayudarte con respuestas automáticas y asistencia básica. Utilizo coincidencia difusa para entender y responder tus preguntas.",
        "Tengo una sugerencia para mejorar el bot.": "¡Gracias por tu sugerencia! Puedes enviarla a nuestro equipo de desarrollo a través del formulario de contacto en nuestro sitio web.",
        "¿Puedo dejar un comentario sobre el servicio?": "Sí, nos encantaría escuchar tu opinión. Puedes dejar un comentario a través del formulario de retroalimentación en nuestra página."
    };

    chatbotToggle.addEventListener('click', () => {
        chatbot.classList.toggle('open');
    });

    chatbotClose.addEventListener('click', () => {
        chatbot.classList.remove('open');
    });

    chatbotSend.addEventListener('click', sendMessage);

    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    function sendMessage() {
        const userMessage = chatbotInput.value.trim();
        if (userMessage) {
            addMessage(userMessage, 'user');
            const botResponse = getResponse(userMessage.toLowerCase());
            addMessage(botResponse, 'bot');
            chatbotInput.value = '';
        }
    }

    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `chatbot-message ${sender}`;
        messageElement.textContent = message;
        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function getResponse(userMessage) {
        return responses[userMessage] || "Lo siento, no entiendo tu pregunta. Por favor, intenta con otra.";
    }
});
