import PageShell from "@/components/PageShell";
import { ArrowLeft, Send, Image, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  isGroup?: boolean;
}

const chats: Chat[] = [
  { id: "1", name: "Jaylen Carter", lastMessage: "Down for sparring Thursday?", time: "2m", unread: 2 },
  { id: "2", name: "Sofia Morales", lastMessage: "Good rounds today 🥊", time: "1h", unread: 0 },
  { id: "3", name: "Iron Fist Gym Chat", lastMessage: "Coach: Gym closes early Friday", time: "3h", unread: 5, isGroup: true },
  { id: "4", name: "DeShawn Williams", lastMessage: "Thanks for the tips man", time: "1d", unread: 0 },
  { id: "5", name: "Sparring Partners", lastMessage: "Kai: Anyone free Saturday AM?", time: "2d", unread: 1, isGroup: true },
];

interface Message {
  id: string;
  text: string;
  sent: boolean;
  time: string;
}

const demoMessages: Message[] = [
  { id: "1", text: "Yo, you training Thursday evening?", sent: false, time: "4:32 PM" },
  { id: "2", text: "Yeah I'll be there around 6. You want to get some rounds in?", sent: true, time: "4:35 PM" },
  { id: "3", text: "Down for sparring Thursday?", sent: false, time: "4:36 PM" },
  { id: "4", text: "Let's do it. Light work though, I've got a fight coming up 😤", sent: true, time: "4:38 PM" },
];

const MessagesPage = () => {
  const [openChat, setOpenChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState("");

  if (openChat) {
    return (
      <div className="page-enter min-h-screen bg-background flex flex-col pb-20">
        {/* Chat Header */}
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border/50 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setOpenChat(null)} className="text-muted-foreground hover:text-foreground transition">
            <ArrowLeft size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-display text-sm text-foreground">
            {openChat.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <h2 className="font-semibold text-sm text-foreground">{openChat.name}</h2>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {demoMessages.map((m) => (
            <div key={m.id} className={`flex ${m.sent ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                m.sent
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary text-foreground rounded-bl-md"
              }`}>
                <p>{m.text}</p>
                <p className={`text-[10px] mt-1 ${m.sent ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="sticky bottom-20 bg-card/95 backdrop-blur-md border-t border-border/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <button className="p-2 text-muted-foreground hover:text-foreground transition">
              <Image size={20} />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-secondary border border-border rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
            <button className="p-2.5 rounded-full gradient-fire text-primary-foreground">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageShell title="The Clinch">
      <div className="pt-4 space-y-2">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => setOpenChat(chat)}
            className="w-full glass-card p-4 flex items-center gap-3 text-left hover:border-primary/30 transition-colors"
          >
            <div className={`w-11 h-11 rounded-full flex items-center justify-center font-display text-lg ${
              chat.isGroup ? "bg-primary/15 text-primary" : "bg-secondary text-foreground"
            }`}>
              {chat.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm text-foreground truncate">{chat.name}</p>
                <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{chat.time}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{chat.lastMessage}</p>
            </div>
            {chat.unread > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                {chat.unread}
              </span>
            )}
            <ChevronRight size={14} className="text-muted-foreground/50 shrink-0" />
          </button>
        ))}
      </div>
    </PageShell>
  );
};

export default MessagesPage;
