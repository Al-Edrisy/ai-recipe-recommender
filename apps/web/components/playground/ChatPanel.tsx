import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User as UserIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  avatar?: string;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSubmit: (message: string) => void;
  loading: boolean;
}

export const ChatPanel = ({ messages, onSubmit, loading }: ChatPanelProps) => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = () => {
    if (message.trim()) {
      onSubmit(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border rounded-lg h-full flex flex-col bg-background/50 backdrop-blur-sm">
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-6">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: msg.role === "user" ? 50 : -50 }}
                transition={{ duration: 0.2 }}
              >
                {msg.role === "ai" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/ai-avatar.png" alt="AI" />
                    <AvatarFallback className="bg-primary text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <motion.div
                  className={`max-w-[80%] p-4 rounded-xl ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {msg.content}
                </motion.div>

                {msg.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.avatar} alt="User" />
                    <AvatarFallback className="bg-secondary">
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              className="flex gap-3 justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/ai-avatar.png" alt="AI" />
                <AvatarFallback className="bg-primary text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted p-4 rounded-xl max-w-[80%]">
                <div className="flex space-x-2">
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </motion.div>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </motion.div>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <motion.div
        className="border-t p-4 bg-background/80"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message or /command (e.g. /load Tostadas)"
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="pr-20"
            />
            <motion.div
              className="absolute right-2 top-2"
              whileHover={{ scale: 1.05 }}
            >
              <Badge variant="secondary" className="text-xs">
                Enter to send
              </Badge>
            </motion.div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading || !message.trim()}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Try commands: <code>/load [recipe]</code>, <code>/save</code>,{" "}
          <code>/edit</code>
        </p>
      </motion.div>
    </div>
  );
};