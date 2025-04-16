package whatsApp.zainab.whats_clone_backEnd.User;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserMapper {
    //from token to db
    public Users MappingUserCredentials(Map<String, Object> credentials) {
        Users user = new Users();
        if (credentials.containsKey("sub")) {
            user.setId(UUID.fromString(credentials.get("sub").toString()));
        }

        if (credentials.containsKey("given_name")) {
            user.setFirstName(credentials.get("given_name").toString());
        } else if (credentials.containsKey("nickname")) {
            user.setFirstName(credentials.get("nickname").toString());
        }

        if (credentials.containsKey("family_name")) {
            user.setLastName(credentials.get("family_name").toString());
        }

        if (credentials.containsKey("email")) {
            user.setEmail(credentials.get("email").toString());
        }
        user.setLastSeen(LocalDateTime.now());
        return user;
    }

    //from db to api requests
    public UserResponse Response(Users user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .lastSeen(user.getLastSeen())
                .isOnline(user.isUserOnline())
                .build();
    }

}
