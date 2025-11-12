import { Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BracketCardProps {
  title: string;
  description: string;
  participants: number;
  endDate: string;
  prize: string;
  status: "active" | "upcoming" | "ended";
  onJoin?: () => void;
}

const BracketCard = ({
  title,
  description,
  participants,
  endDate,
  prize,
  status,
  onJoin,
}: BracketCardProps) => {
  const statusColors = {
    active: "bg-accent text-accent-foreground",
    upcoming: "bg-secondary text-secondary-foreground",
    ended: "bg-muted text-muted-foreground",
  };

  return (
    <div className="pixel-card p-6 space-y-4 hover:cursor-pointer group">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className={`inline-block px-3 py-1 text-[10px] mb-3 ${statusColors[status]}`}>
            {status.toUpperCase()}
          </div>
          <h3 className="text-base mb-2 gradient-text leading-relaxed">{title}</h3>
          <p className="text-[10px] text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-gaming flex items-center justify-center border-4 border-foreground">
            <span className="text-4xl">🏆</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t-4 border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-[10px]">Players</span>
          </div>
          <p className="text-sm font-bold">{participants}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-[10px]">Ends</span>
          </div>
          <p className="text-[10px] font-bold">{endDate}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-sm">🏆</span>
            <span className="text-[10px]">Prize</span>
          </div>
          <p className="text-sm font-bold">{prize}</p>
        </div>
      </div>

      {status === "active" && (
        <Button
          onClick={onJoin}
          className="w-full pixel-button"
        >
          Enter Bracket
        </Button>
      )}
    </div>
  );
};

export default BracketCard;
