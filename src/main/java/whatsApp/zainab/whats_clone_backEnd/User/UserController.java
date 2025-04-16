package whatsApp.zainab.whats_clone_backEnd.User;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/{userId}/block/{blockedUserId}")
    public ResponseEntity<String> blockUser(@PathVariable UUID userId, @PathVariable UUID blockedUserId) {
        userService.blockUser(userId, blockedUserId);
        return ResponseEntity.ok("User blocked successfully");
    }

    @PostMapping("/{userId}/unblock/{blockedUserId}")
    public ResponseEntity<String> unblockUser(@PathVariable UUID userId, @PathVariable UUID blockedUserId) {
        userService.unblockUser(userId, blockedUserId);
        return ResponseEntity.ok("User unblocked successfully");
    }

    @GetMapping("/{userId}/blocked")
    public ResponseEntity<List<Users>> getBlockedUsers(@PathVariable UUID userId) {
        return ResponseEntity.ok(userService.getBlockedUsers(userId));
    }
}

