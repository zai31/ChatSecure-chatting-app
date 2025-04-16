package whatsApp.zainab.whats_clone_backEnd.Messages;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageResponse {
    private UUID messageId;
    private UUID chatId;
    private UUID senderId;
    private MessageType messageType;
    private MessageState messageState;
    private String textContent;
    private String mimeType;
    private LocalDateTime createdDate;
}
