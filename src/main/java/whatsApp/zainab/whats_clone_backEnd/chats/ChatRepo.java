package whatsApp.zainab.whats_clone_backEnd.chats;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatRepo extends JpaRepository<Chats,UUID> {
    @Query(name = ChatConstants.FIND_CHAT_BY_USER_ID)
    List<Chats> findChatByUserId(@Param("userId") UUID senderId);
    @Query(name = ChatConstants.FIND_CHAT_BY_ID)
    Chats findChatById(@Param("ChatId") UUID id);
    @Query(name = ChatConstants.GET_CHAT)
    List<Chats> getChat(@Param("chatName") String chatN);


}
