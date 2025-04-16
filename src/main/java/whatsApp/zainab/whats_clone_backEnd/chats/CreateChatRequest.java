package whatsApp.zainab.whats_clone_backEnd.chats;

import java.util.List;

public class CreateChatRequest {
        private String name;
        private String chatId;  // Keep as String first
        private List<String> membersId;  // Keep as List<String> first

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getChatId() { return chatId; }
        public void setChatId(String chatId) { this.chatId = chatId; }

        public List<String> getMembersId() { return membersId; }
        public void setMembersId(List<String> membersId) { this.membersId = membersId; }
    }


