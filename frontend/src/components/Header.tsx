import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Gamepad2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onCreateClick: () => void;
}

const Header = ({ onCreateClick }: HeaderProps) => {
  return (
    <header className="border-b-4 border-foreground bg-card sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-gaming flex items-center justify-center border-4 border-foreground">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-base md:text-xl gradient-text hidden sm:block">
              CelestiaBracketRush
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={onCreateClick}
              className="pixel-button text-[10px] px-4 py-2 hidden md:inline-flex"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
            <div className="[&_button]:text-[10px] [&_button]:px-4 [&_button]:py-2">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
