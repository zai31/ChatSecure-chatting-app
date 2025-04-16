package whatsApp.zainab.whats_clone_backEnd.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.retry.annotation.Retryable;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserSynchronizer {

    private final UserRepo userRepo;
    private final UserMapper userMapper;

    @Transactional
    @Retryable(value = ObjectOptimisticLockingFailureException.class, maxAttempts = 3)
    public void synchronizeWithIdp(Jwt token) {
        UUID userId = UUID.fromString(token.getClaim("sub"));
        String email = token.getClaim("email");
        String firstName = token.getClaim("given_name");
        String lastName = token.getClaim("family_name");

        Users user = userRepo.findByEmail(email)
                .orElseGet(() -> {
                    Users newUser = userMapper.MappingUserCredentials(token.getClaims());
                    newUser.setLastSeen(LocalDateTime.now());
                    newUser.setId(userId); // Set the ID from the token
                    return newUser;
                });

        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setLastSeen(LocalDateTime.now());
        
        userRepo.save(user);
    }
}
