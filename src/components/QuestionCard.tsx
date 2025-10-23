import { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";

interface QuestionCardProps {
  question: string;
  icon: LucideIcon;
  onClick: () => void;
}

const QuestionCard = ({ question, icon: Icon, onClick }: QuestionCardProps) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="w-full justify-start text-left h-auto py-4 px-4 mb-3 bg-gradient-to-r from-card to-muted border-2 border-border hover:border-primary hover:shadow-md transition-all duration-300 group"
    >
      <div className="flex items-center gap-3 w-full">
        <div className="text-primary group-hover:scale-110 transition-transform duration-300">
          <Icon size={24} />
        </div>
        <span className="font-medium text-sm flex-1">{question}</span>
      </div>
    </Button>
  );
};

export default QuestionCard;
