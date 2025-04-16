package whatsApp.zainab.whats_clone_backEnd.chats;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import whatsApp.zainab.whats_clone_backEnd.User.UserRepo;
import whatsApp.zainab.whats_clone_backEnd.User.Users;

import java.util.List;
import java.util.UUID;
//handle searching by name /id/or joining using a link/or disallow name dup
@Service
@AllArgsConstructor
public class ChatService {

    private final ChatRepo chatRepo;
    private final UserRepo userRepo;
    private final ChatMapper mapper;

    //getting all user's chats
    public  List<Chats> GetAllUserChats(Authentication currentUser) {
        if (currentUser instanceof JwtAuthenticationToken jwtAuthenticationToken) {
            String userId = jwtAuthenticationToken.getToken().getClaimAsString("sub");
            return chatRepo.findChatByUserId(UUID.fromString(userId));
        }
        throw new RuntimeException("User ID could not be extracted");

    }

    //search a chat by name
    public List<Chats> SearchAchat(String ChatName) {
        return chatRepo.getChat(ChatName);
    }

    //create a chat
    public Chats createChat(@NonNull  String Name,@NonNull UUID chatId, @NonNull List<UUID> membersId) {
        if (chatRepo.findById(chatId).isPresent()) {
           throw new RuntimeException("Chat name already exists") ;
        }

        Chats chat = new Chats();
        chat.setName(Name);
        for (UUID userId : membersId) {
            userRepo.findById(userId).ifPresent(chat.getMembers()::add);
        }
        chatRepo.save(chat);
        return chat;

    }

    //delete chat
    @Transactional
    public void deleteChat(@NonNull UUID chatId, @NonNull UUID userId) {
        Chats chat = chatRepo.findById(chatId).get();
        //if group exists and user is a member
        if (chatRepo.findById(chatId).isPresent() && chat.getMembers().stream().
                anyMatch(user -> user.getId().equals(userId))) {
            chatRepo.delete(chat);
        } else {
            throw new IllegalArgumentException("User is not authorized to delete this chat.");
        }


    }

    //join chat
    public void joinChat(@NonNull UUID chatId, @NonNull UUID userId) {
        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Chats chat = chatRepo.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        // Correct membership check (compare user IDs)
        boolean isMember = chat.getMembers().stream()
                .anyMatch(member -> member.getId().equals(userId));

        if (isMember) {
            throw new IllegalArgumentException("User is already in this chat.");
        }

        // Add user to chat and save
        chat.getMembers().add(user);
        chatRepo.save(chat);
    }

    //leave chat
    public void leaveChat(@NonNull UUID chatId, @NonNull UUID userId) {
        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Chats chat = chatRepo.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        // Correct membership check (compare user IDs)
        boolean isMember = chat.getMembers().stream()
                .anyMatch(member -> member.getId().equals(userId));

        if (isMember) {
            chat.getMembers().remove(user);
            chatRepo.save(chat);
        }
        else
            throw new IllegalArgumentException("User is no longer a member of this chat.");

    }

    //admin adds a member
    @PreAuthorize("hasRole('ADMIN')")
    public void adminAddsMember(@NonNull UUID chatId, @NonNull UUID memberId) {
        // If the user isn't an admin, Spring throws AccessDeniedException automatically

        Chats chat = chatRepo.findChatById(chatId);
        Users user = userRepo.findById(memberId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (chat.getMembers().contains(user)) {
            throw new IllegalArgumentException("User is already a member of this chat.");
        }
        chat.getMembers().add(user);
        chatRepo.save(chat);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void adminRemovesMember(@NonNull UUID chatId, @NonNull UUID memberId) {
        // If the user isn't an admin, Spring throws AccessDeniedException automatically

        Chats chat = chatRepo.findChatById(chatId);
        Users user = userRepo.findById(memberId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (chat.getMembers().contains(user)) {
            chat.getMembers().remove(user);
            chatRepo.save(chat);
        }
    }
}