package whatsApp.zainab.whats_clone_backEnd.notification;

import lombok.*;
import whatsApp.zainab.whats_clone_backEnd.Messages.MessageType;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Notif {

    private String chatId;
    private String content;
    private String senderId;
    private String receiverId;
    private String chatName;
    private MessageType messageType;
    private NotifType type;
    private byte[] media;
}