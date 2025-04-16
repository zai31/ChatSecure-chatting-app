package whatsApp.zainab.whats_clone_backEnd.Messages;

import org.springframework.stereotype.Component;
import whatsApp.zainab.whats_clone_backEnd.User.Users;
import whatsApp.zainab.whats_clone_backEnd.chats.Chats;

import java.time.LocalDateTime;

@Component
public class MessageMapper {
    private final MessagesRepo messagesRepo;

    public MessageMapper(MessagesRepo messagesRepo) {
        this.messagesRepo = messagesRepo;
    }

    public Messages makeMessage(MessageRequest request, Users sender, Chats chat) {
        Messages message = new Messages();
        message.setChat(chat);
        message.setSender(sender);
        message.setMessageType(request.getMessageType());
        message.setMessageState(MessageState.SENT); // Default state
        message.setFileContent(request.getFileContent());
        message.setMimeType(request.getMimeType());
        return message;
    }

    public MessageResponse mapToResponse(Messages message) {


            MessageResponse response = new MessageResponse();
            response.setMessageId(message.getMessageId());
            response.setChatId(message.getChat().getId());
            response.setSenderId(message.getSender().getId());
            response.setMessageType(message.getMessageType());
            response.setMessageState(message.getMessageState());
            response.setMimeType(message.getMimeType());
            response.setCreatedDate(message.getCreatedDate());
            return response;

        }

    public Messages editMessage(Messages message) {
        message.setTextContent(message.getTextContent());
        message.setLastModifiedDate(LocalDateTime.now());
        messagesRepo.save(message);
        return message;
    }
}

