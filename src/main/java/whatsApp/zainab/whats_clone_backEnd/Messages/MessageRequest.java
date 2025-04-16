package whatsApp.zainab.whats_clone_backEnd.Messages;

import lombok.Data;
import org.antlr.v4.runtime.misc.NotNull;

import java.util.UUID;

@Data
public class MessageRequest {

    @NotNull
    private UUID chatId;

    @NotNull
    private UUID senderId;

    private UUID ReceiverId;
    @NotNull
    private UUID messsageId;

    @NotNull
    private MessageType messageType;


    private String textContent; // Optional for text messages

    private byte[] fileContent; // Optional for media messages

    private String mimeType; // Helps to determine file type



}
