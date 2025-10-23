import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isBot: boolean;
}

const ChatMessage = ({ message, isBot }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "max-w-[70%] p-3 rounded-lg mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isBot
          ? "bg-primary text-primary-foreground mr-auto rounded-tl-none"
          : "bg-secondary text-secondary-foreground ml-auto rounded-tr-none"
      )}
    >
      <p className="text-sm leading-relaxed">{message}</p>
    </div>
  );
};

export default ChatMessage;
