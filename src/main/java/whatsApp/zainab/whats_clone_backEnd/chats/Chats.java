package whatsApp.zainab.whats_clone_backEnd.chats;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import whatsApp.zainab.whats_clone_backEnd.Messages.Messages;
import whatsApp.zainab.whats_clone_backEnd.User.Users;
import whatsApp.zainab.whats_clone_backEnd.shared.Auditing;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "chats")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@NamedQuery(name = ChatConstants.FIND_CHAT_BY_USER_ID,
        query = "SELECT c FROM Chats c JOIN c.members m WHERE m.id = :userId")
@NamedQuery(name = ChatConstants.FIND_CHAT_BY_ID,
        query = "SELECT m FROM Chats m WHERE m.Id = :chatId")
@NamedQuery(name = ChatConstants.GET_ALL_CHATS,
        query = "SELECT c FROM Chats c join c.members u WHERE u.id=:senderId ")
@NamedQuery(name = ChatConstants.GET_CHAT,
        query = "SELECT c FROM Chats c join c.members u WHERE c.name=:chatName ")


public class Chats extends Auditing {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(unique = true, nullable = false)
    private UUID Id;
    private String name;
    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true,fetch = FetchType.EAGER)
    @OrderBy("createdDate DESC " )
    private Set<Messages> messages=new HashSet<>();;
    @ManyToMany
    @JoinTable(
            name = "chat_members",
            joinColumns = @JoinColumn(name = "chat_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<Users> members = new HashSet<>();



}
