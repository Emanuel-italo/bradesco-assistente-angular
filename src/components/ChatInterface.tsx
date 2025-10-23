import { useState, useEffect, useRef } from "react";
import { Send, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";

interface Message {
  text: string;
  isBot: boolean;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
}

const ChatInterface = ({ isOpen, onClose, initialMessage }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      setTimeout(() => {
        setMessages([
          {
            text: initialMessage || "Olá! Sou o Caio, seu assistente virtual de pagamentos. Como posso ajudá-lo hoje?",
            isBot: true,
          },
        ]);
      }, 500);
    }
  }, [isOpen, initialMessage]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate bot response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          text: "Recebi sua mensagem! Em breve nossa equipe irá processar sua solicitação.",
          isBot: true,
        },
      ]);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 md:relative md:h-[600px] flex flex-col bg-card/60 backdrop-blur-lg rounded-xl overflow-hidden shadow-2xl border border-border animate-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-[hsl(var(--bradesco-dark-red))] text-primary-foreground p-4 flex justify-between items-center">
        <span className="font-bold">Assistente Virtual</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-primary-foreground hover:bg-white/20 hover:rotate-90 transition-all duration-300"
        >
          <X size={20} />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-5 overflow-y-auto bg-muted/30">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg.text} isBot={msg.isBot} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-card border-t border-border flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Digite sua mensagem..."
          className="flex-1 focus-visible:ring-primary"
        />
        <Button
          onClick={handleSendMessage}
          size="icon"
          className="bg-primary hover:bg-primary/90"
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;
