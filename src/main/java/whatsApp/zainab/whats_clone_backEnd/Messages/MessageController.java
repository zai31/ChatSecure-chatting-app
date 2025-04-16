package whatsApp.zainab.whats_clone_backEnd.Messages;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/messages")
@Tag(name = "Messages", description = "Endpoints for sending and managing messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @Operation(summary = "Send a text or media message")
    @PostMapping(value = "/send", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<MessageResponse> sendMessage(
            @RequestPart("request") MessageRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        MessageResponse response = messageService.sendMessage(
                request.getSenderId(),
                request.getReceiverId(),
                request.getChatId(),
                request,
                file);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Search for messages by content")
    @GetMapping("/search")
    public ResponseEntity<List<Messages>> searchMessages(@RequestBody MessageRequest request) {
        List<Messages> messages = messageService.SearchMessages(request);
        return ResponseEntity.ok(messages);
    }


    @Operation(summary = "Get all messages in a chat")
    @GetMapping("/chat/{chatId}")
    public ResponseEntity<List<Messages>> getChatMessages(@PathVariable UUID chatId) {
        return ResponseEntity.ok(messageService.getChatMessages(chatId));
    }

    @Operation(summary = "Get all unseen messages in a chat")
    @GetMapping("/chat/{chatId}/unseen")
    public ResponseEntity<List<Messages>> getUnseenMessages(@PathVariable UUID chatId) {
        return ResponseEntity.ok(messageService.getUnseenMessages(chatId));
    }

    @Operation(summary = "Mark a message as SEEN")
    @PutMapping("/{messageId}/seen")
    public ResponseEntity<Void> markAsSeen(@PathVariable UUID messageId) {
        messageService.MarkAsSeen(messageId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Mark a message as DELIVERED")
    @PutMapping("/{messageId}/delivered")
    //put:Update an existing resource
    public ResponseEntity<Void> markAsDelivered(@PathVariable UUID messageId) {
        messageService.MarkAsDelivered(messageId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Edit a text message")
    @PutMapping("/{messageId}/edit")
    public ResponseEntity<Optional<Messages>> editMessage(
            @PathVariable UUID messageId,
            @RequestBody MessageRequest request) {
        return ResponseEntity.ok(messageService.EditTextMessage(request,messageId));
    }

    @Operation(summary = "Delete a message")
    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable UUID messageId) {
        messageService.DeleteMessage(messageId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Send a media message")
    @PostMapping(value = "/send-media", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<MessageResponse> sendMediaMessage(
            @RequestPart("request") MessageRequest request,
            @RequestPart("file") MultipartFile file) {

        MessageResponse response = messageService.sendMessage(
                request.getSenderId(),
                request.getReceiverId(),
                request.getChatId(),
                request,
                file);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Download media file from S3")
    @GetMapping("/{messageId}/media")
    public ResponseEntity<byte[]> downloadMedia(@PathVariable UUID messageId) {
        byte[] mediaData = messageService.downloadMedia(messageId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(mediaData);
    }

    @Operation(summary = "Delete media file from S3")
    @DeleteMapping("/{messageId}/media")
    public ResponseEntity<Void> deleteMedia(@PathVariable UUID messageId) {
        messageService.deleteMedia(messageId);
        return ResponseEntity.noContent().build();
    }
}
