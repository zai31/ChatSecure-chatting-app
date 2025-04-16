package whatsApp.zainab.whats_clone_backEnd.Messages;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import whatsApp.zainab.whats_clone_backEnd.S3.S3Service;
import whatsApp.zainab.whats_clone_backEnd.User.UserRepo;
import whatsApp.zainab.whats_clone_backEnd.User.Users;
import whatsApp.zainab.whats_clone_backEnd.chats.ChatRepo;
import whatsApp.zainab.whats_clone_backEnd.chats.Chats;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class MessageService {

    private final MessagesRepo messagesRepo;
    private final MessageMapper messageMapper;
    private final UserRepo userRepo;
    private final ChatRepo chatRepo;
    private final S3Service s3Service;


@Transactional
public MessageResponse sendMessage(UUID senderId, UUID receiverId, UUID chatId, MessageRequest request,MultipartFile file) {
    Users sender = userRepo.findById(senderId)
            .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

    Users receiver = receiverId != null ? userRepo.findById(receiverId)
            .orElseThrow(() -> new IllegalArgumentException("Receiver not found")) : null;

    Chats chat = chatId != null ? chatRepo.findById(chatId)
            .orElseThrow(() -> new IllegalArgumentException("Chat not found")) : null;

    // Prevent blocked users from messaging
    if (receiver != null && receiver.getBlockedUsers().contains(sender)) {
        throw new IllegalArgumentException("You cannot send messages to this user.");
    }
        Messages message = messageMapper.makeMessage(request, sender, chat);

        // If a file is attached, upload to S3 and store URL
        if (file != null && !file.isEmpty()) {
            String fileUrl = s3Service.uploadFile(file);  // Upload to S3
            message.setFileUrl(fileUrl);  // Store S3 URL in database
        }

        messagesRepo.save(message);
        return messageMapper.mapToResponse(message);
    }

    /*package whatsApp.zainab.whats_clone_backEnd.Messages;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import whatsApp.zainab.whats_clone_backEnd.User.UserRepo;
import whatsApp.zainab.whats_clone_backEnd.User.Users;
import whatsApp.zainab.whats_clone_backEnd.chats.ChatRepo;
import whatsApp.zainab.whats_clone_backEnd.chats.Chats;
import whatsApp.zainab.whats_clone_backEnd.services.S3FileService;

import java.util.UUID;

@Service
@AllArgsConstructor
public class MessageService {

    private final MessagesRepo messagesRepo;
    private final MessageMapper messageMapper;
    private final UserRepo userRepo;
    private final ChatRepo chatRepo;
    private final S3FileService s3FileService; // S3 service for media upload

    @Transactional
    public MessageResponse sendMessage(MessageRequest request) {
        // Validate sender and chat
        Users sender = userRepo.findById(request.getSenderId())
                .orElseThrow(() -> new IllegalArgumentException("No user found"));

        Chats chat = chatRepo.findChatById(request.getChatId());
        if (chat == null) {
            throw new IllegalArgumentException("Chat not found");
        }

        Messages message = new Messages();
        message.setSender(sender);
        message.setChat(chat);
        message.setMessageState(MessageState.SENT);

        // If there is text, save it as a text message
        if (request.getText() != null && !request.getText().isEmpty()) {
            message.setMessageType(MessageType.TEXT);
        }

        // If there is a file, upload it to S3
        if (request.getFile() != null && !request.getFile().isEmpty()) {
            String fileUrl = s3FileService.uploadFile(request.getFile());
            message.setMessageType(MessageType.MEDIA);
            message.setProfilePic(fileUrl);  // Store the file URL
            message.setMimeType(request.getMimeType());
        }

        // If no text and no file, reject the request
        if (message.getMessageType() == null) {
            throw new IllegalArgumentException("Message must have text or a file");
        }

        // Save message and return response
        messagesRepo.save(message);
        return messageMapper.mapToResponse(message);
    }
}
*/

    List<Messages> SearchMessages(MessageRequest request) {
        List<Messages> message = messagesRepo.findByMessageId(request.getMesssageId());
        return message;

    }

    @Transactional
    void DeleteMessage(UUID messageID) {
        Messages message = messagesRepo.findById(messageID)
                .orElseThrow(() -> new IllegalArgumentException("No messages found"));
        messagesRepo.delete(message);


    }

    List<Messages> getChatMessages(UUID chatID) {
        List<Messages> messages = messagesRepo.findByChatId(chatID);
        return messages;
        //should i set them to seen?
    }

    public List<Messages> getUnseenMessages(UUID chatId) {
        return messagesRepo.findUnseenMessages(chatId, MessageState.RECEIVED);
    }

    @Transactional
    void MarkAsSeen(UUID messageID) {
        messagesRepo.setStateToSeen(messageID);
    }

    @Transactional
    void MarkAsDelivered(UUID messageID) {
        messagesRepo.setStateToDelivered(messageID);
    }

    Optional<Messages> EditTextMessage(MessageRequest request,UUID Mid) {
        Messages message = messagesRepo.findById(request.getMesssageId())
                .orElseThrow(() -> new IllegalArgumentException("No messages found"));

        Messages editedM = null;
        if (message == null) {
            throw new IllegalArgumentException("No messages found");
        } else if (message.getMessageType().equals(MessageType.TEXT)) {
            editedM = messageMapper.editMessage(message);

        }
        return Optional.ofNullable(editedM);
    }


    public MessageResponse sendMediaMessage(MessageRequest request, MultipartFile file) {
        Users sender = userRepo.findById(request.getSenderId())
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

        Chats chat = chatRepo.findChatById(request.getChatId());
        if (chat == null) throw new IllegalArgumentException("Chat not found");

        // Upload file to S3 and get file key
        String fileKey = s3Service.uploadFile(file);

        // Create Message object
        Messages message = messageMapper.makeMessage(request, sender, chat);
        message.setFileContent(null); // No need to store file in DB
        message.setMimeType(file.getContentType());
        message.setProfilePic(fileKey); // Store the file key instead

        messagesRepo.save(message);

        return messageMapper.mapToResponse(message);
    }

    /**
     * Download Media Message
     */
    public byte[] downloadMedia(UUID messageId) {
        Messages message = messagesRepo.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        String fileKey = message.getMediaFileKey();

        if (fileKey == null || fileKey.isEmpty()) {
            throw new IllegalArgumentException("No media file attached to this message");
        }

        return s3Service.downloadFile(fileKey);
    }

    @Transactional
    public void deleteMedia(UUID messageId) {
        Messages message = messagesRepo.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        String fileKey = message.getMediaFileKey();

        if (fileKey != null && !fileKey.isEmpty()) {
            s3Service.deleteFile(fileKey);
            message.setMediaFileKey(null); // Remove media reference but keep message
            messagesRepo.save(message);
        }
    }
}





