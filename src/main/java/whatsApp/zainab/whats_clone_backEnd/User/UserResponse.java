package whatsApp.zainab.whats_clone_backEnd.User;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponse {

    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private
    LocalDateTime lastSeen;
    private boolean isOnline;
}
