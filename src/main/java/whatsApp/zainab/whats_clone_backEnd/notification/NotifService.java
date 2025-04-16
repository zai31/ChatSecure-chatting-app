package whatsApp.zainab.whats_clone_backEnd.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotifService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendNotification(String userId, Notif notification) {
        log.info("Sending WS notification to {} with payload {}", userId, notification);
        messagingTemplate.convertAndSendToUser(
                userId,
                "/chat",
                notification
        );
    }
}
