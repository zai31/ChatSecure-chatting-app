package whatsApp.zainab.whats_clone_backEnd.User;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import whatsApp.zainab.whats_clone_backEnd.S3.S3Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor


public class UserService {

    private final UserRepo userRepo;
    private final UserMapper userMapper;
    private final S3Service s3Service;
    public List<UserResponse> finAllUsersExceptSelf(Authentication connectedUser) {
        return userRepo.findAllUsersExceptSelf(UUID.fromString(connectedUser.name()))
                .stream()
                .map(userMapper::Response)
                .toList();
    }

            /**
             * Register a new user
             */
      /*      public Users registerUser(UserRequest request) {
                if (userRepo.existsByPhoneNumber(request.getPhoneNumber())) {
                    throw new IllegalArgumentException("Phone number already registered");
                }

                Users user = new Users();
                user.setUsername(request.getUsername());
                user.setPhoneNumber(request.getPhoneNumber());
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                user.setStatus("Hey there! I’m using WhatsApp Clone.");

                return userRepo.save(user);
            }

            /**
             * Get user profile
             */
            public Users getUserProfile(UUID userId) {
                return userRepo.findById(userId)
                        .orElseThrow(() -> new IllegalArgumentException("User not found"));
            }

            /**
             * Update user profile
             */
            @Transactional
            public Users updateProfile(UUID userId, UserRequest request) {
                Users user = userRepo.findById(userId)
                        .orElseThrow(() -> new IllegalArgumentException("User not found"));

                if (request.getFirstName() != null && !request.getFirstName().isEmpty()) {
                    user.setFirstName(request.getFirstName());
                }
                if (request.getStatus() != null && !request.getStatus().isEmpty()) {
                    user.setStatus(request.getStatus());
                }

                return userRepo.save(user);
            }

            /**
             * Upload profile picture
             */
            public String uploadProfilePicture(UUID userId, MultipartFile file) {
                Users user = userRepo.findById(userId)
                        .orElseThrow(() -> new IllegalArgumentException("User not found"));

                String fileUrl = s3Service.uploadFile(file);
                user.setProfilePic(fileUrl);
                userRepo.save(user);

                return fileUrl;
            }

            /**
             * Fetch user contacts
             */
            public List<Users> getUserContacts(UUID userId) {
                return userRepo.findAllUsersExceptSelf(userId);
            }

            /**
             * Block or unblock a user
             */
            @Transactional
            public void blockUser(UUID userId, UUID blockedUserId) {
                Users user = userRepo.findById(userId)
                        .orElseThrow(() -> new IllegalArgumentException("User not found"));
                Users blockedUser = userRepo.findById(blockedUserId)
                        .orElseThrow(() -> new IllegalArgumentException("Blocked user not found"));

                if (user.getId().equals(blockedUser.getId())) {
                    throw new IllegalArgumentException("You cannot block yourself!");
                }

                user.getBlockedUsers().add(blockedUser);
                userRepo.save(user);
            }

    @Transactional
    public void unblockUser(UUID userId, UUID blockedUserId) {
        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Users blockedUser = userRepo.findById(blockedUserId)
                .orElseThrow(() -> new IllegalArgumentException("Blocked user not found"));

        if (!user.getBlockedUsers().contains(blockedUser)) {
            throw new IllegalArgumentException("User is not blocked");
        }

        user.getBlockedUsers().remove(blockedUser);
        userRepo.save(user);
    }

    public List<Users> getBlockedUsers(UUID userId) {
        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return user.getBlockedUsers();
    }

        /**
         * Get last seen of a user
         */
            public LocalDateTime getLastSeen(UUID userId) {
                Users user = userRepo.findById(userId)
                        .orElseThrow(() -> new IllegalArgumentException("User not found"));

                return user.getLastSeen();
            }
        }
