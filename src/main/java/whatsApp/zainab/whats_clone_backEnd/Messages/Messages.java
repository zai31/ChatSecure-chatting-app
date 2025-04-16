package whatsApp.zainab.whats_clone_backEnd.Messages;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import whatsApp.zainab.whats_clone_backEnd.User.Users;
import whatsApp.zainab.whats_clone_backEnd.chats.Chats;
import whatsApp.zainab.whats_clone_backEnd.shared.Auditing;

import java.util.UUID;

@Entity
@Table(name = "Messages")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@NamedQuery(name = MessageConstants.FIND_MESSAGES_BY_CHAT_ID,
        query = "SELECT m FROM Messages m WHERE m.chat.id = :chatId ORDER BY m.createdDate")
@NamedQuery(name = MessageConstants.FIND_MESSAGES_UNSEEN,
        query = "SELECT m FROM Messages m WHERE m.chat.id = :chatId and m.messageState= :messageState ORDER BY m.createdDate")

@NamedQuery(name=MessageConstants.SET_STATE_TO_SEEN,
        query = "UPDATE Messages SET messageState=:NewState where chat.id = :chatId")
@NamedQuery(name=MessageConstants.SET_STATE_TO_DELIVERED,
        query = "UPDATE Messages SET messageState=:NewState where chat.id = :chatId")
public class Messages extends Auditing {
    @ManyToOne
    @JoinColumn(name = "chat_id")
    private Chats chat;
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(unique = true, nullable = false)
    private UUID messageId;
    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private Users sender;  // Who sent the message

    @ManyToOne
    @JoinColumn(name = "receiver_id")
    private Users receiver;  // Who received the message (null if group message)
    @Enumerated(EnumType.STRING)
    private MessageType messageType;
    @Enumerated(EnumType.STRING)
    private MessageState messageState;
    private String ProfilePic;
    @Lob  // Stores large binary files
    @Column(name = "file_content")
    private byte[] fileContent;
    private String fileUrl;
    private String mediaFileKey;

    @Column(name = "mime_type", nullable = false)
    private String mimeType;
    private String textContent;



}
