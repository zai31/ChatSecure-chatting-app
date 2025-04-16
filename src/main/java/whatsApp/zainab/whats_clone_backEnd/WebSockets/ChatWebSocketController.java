package whatsApp.zainab.whats_clone_backEnd.WebSockets;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import whatsApp.zainab.whats_clone_backEnd.Messages.*;
import whatsApp.zainab.whats_clone_backEnd.Messages.MessageResponse;


@Controller
@RequiredArgsConstructor

public class ChatWebSocketController {

    @MessageMapping("/chat")  // When a message is sent to /app/chat
    @SendTo("/topic/messages") // Broadcast to all users subscribed to /topic/messages
    public MessageResponse sendMessage(MessageRequest request) {
        return new MessageResponse(
                null,  // Message ID (if generating it later, keep as null)
                request.getSenderId(),
                request.getChatId(),
                MessageType.TEXT, // Assuming it's a text message
                MessageState.SENT, // Assuming the initial state is SENT
                request.getTextContent(),null,
                null // No file URL for text messages
        );
    }
}