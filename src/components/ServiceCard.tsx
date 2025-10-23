import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

const ServiceCard = ({ title, description, icon: Icon, onClick }: ServiceCardProps) => {
  return (
    <div
      onClick={onClick}
      className="group relative bg-card border-l-4 border-primary p-4 mb-4 cursor-pointer overflow-hidden rounded-lg transition-all duration-300 hover:translate-x-1 hover:scale-[1.02] hover:shadow-lg"
    >
      {/* Hover gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative flex items-start gap-3">
        <div className="mt-1 text-primary">
          <Icon size={24} />
        </div>
        <div>
          <h3 className="font-bold text-primary mb-1 text-shadow-sm">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
