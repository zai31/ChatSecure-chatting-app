package whatsApp.zainab.whats_clone_backEnd.chats;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/chats")
@Tag(name = "Chats", description = "Endpoints for chat management")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @Operation(summary = "Get all chats for a user")
    @GetMapping("/MyChats")
    public ResponseEntity<List<Chats>> getAllUserChats(Authentication authentication) {
        List<Chats> userChats = chatService.GetAllUserChats(authentication);
        if (userChats.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204 No Content if no chats exist
        }
        return ResponseEntity.ok(userChats);
    }

    @Operation(summary = "Search for a chat by name")
    @GetMapping("/SearchChat")
    public ResponseEntity<List<Chats>> searchChat(@RequestParam String ChatName) {
        List<Chats> chats = chatService.SearchAchat(ChatName);
        if (chats.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(chats);
    }

    @Operation(summary = "Create a new chat")
    @PostMapping("/CreateChat")
    public ResponseEntity<Chats> createChat(@RequestParam String name,
                                            @RequestParam UUID chatId,
                                            @RequestBody List<UUID> membersId) {
        Chats chat = chatService.createChat(name, chatId, membersId);
        return ResponseEntity.ok(chat);
    }

    @Operation(summary = "Delete a chat")
    @DeleteMapping("/{chatId}")
    public ResponseEntity<Void> deleteChat(@PathVariable UUID chatId,
                                           @RequestParam UUID userId) {
        chatService.deleteChat(chatId, userId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Join a chat")
    @PostMapping("/{chatId}/join")
    public ResponseEntity<String> joinChat(@PathVariable UUID chatId,
                                           @RequestParam UUID userId) {
        chatService.joinChat(chatId, userId);
        return ResponseEntity.ok("User joined chat successfully.");
    }

    @Operation(summary = "Leave a chat")
    @PostMapping("/{chatId}/leave")
    public ResponseEntity<String> leaveChat(@PathVariable UUID chatId,
                                            @RequestParam UUID userId) {
        chatService.leaveChat(chatId, userId);
        return ResponseEntity.ok("User left chat successfully.");
    }

    @Operation(summary = "Admin adds a member to a chat")
    @PostMapping("/{chatId}/admin/add")
    public ResponseEntity<String> adminAddsMember(@PathVariable UUID chatId,
                                                  @RequestParam UUID memberId) {
        chatService.adminAddsMember(chatId, memberId);
        return ResponseEntity.ok("Member added by admin.");
    }

    @Operation(summary = "Admin removes a member from a chat")
    @DeleteMapping("/{chatId}/admin/remove")
    public ResponseEntity<String> adminRemovesMember(@PathVariable UUID chatId,
                                                     @RequestParam UUID memberId) {
        chatService.adminRemovesMember(chatId, memberId);
        return ResponseEntity.ok("Member removed by admin.");
    }
}
