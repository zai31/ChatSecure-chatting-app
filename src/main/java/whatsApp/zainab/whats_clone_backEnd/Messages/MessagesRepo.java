package whatsApp.zainab.whats_clone_backEnd.Messages;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MessagesRepo extends JpaRepository<Messages, UUID> {
    @Query (name = MessageConstants.FIND_MESSAGES_BY_CHAT_ID)
    List<Messages> findByChatId(UUID chatId);

    @Query(name=MessageConstants.SET_STATE_TO_SEEN)
    void setStateToSeen(UUID chatId);

    @Query(name=MessageConstants.SET_STATE_TO_DELIVERED)
    void setStateToDelivered(UUID chatId);

    @Query(name=MessageConstants.FIND_MESSAGES_UNSEEN)
    List<Messages> findUnseenMessages(@Param("chatId") UUID chatId, @Param("state") MessageState state);

    List<Messages> findByMessageId(UUID messageId);

    Optional<Messages> findById(UUID messageId);

}
