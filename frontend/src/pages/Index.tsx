import { useState } from "react";
import { Plus, Filter, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import BracketCard from "@/components/BracketCard";
import CreateBracketDialog from "@/components/CreateBracketDialog";
import JoinBracketDialog from "@/components/JoinBracketDialog";
import { Button } from "@/components/ui/button";
import { useBrackets, useBracket } from "@/hooks/useBracketContract";
import { CONTRACT_ADDRESS } from "@/config/contracts";

interface JoinDialogState {
  open: boolean;
  bracketId: string;
  title: string;
  entryFee: bigint;
}

// Component to display individual bracket with real data
const BracketItem = ({ bracketId, onJoin }: { bracketId: string; onJoin: (id: string, title: string, fee: bigint) => void }) => {
  const { data: bracket } = useBracket(bracketId);

  if (!bracket) return null;

  const [entryFee, lockTime, prizePool, cancelled, settled] = bracket;
  const now = Math.floor(Date.now() / 1000);

  let status: "active" | "upcoming" | "ended" = "active";
  if (cancelled || settled || lockTime < now) {
    status = "ended";
  }

  const endDate = new Date(Number(lockTime) * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  const participants = 0; // We don't track this in simple version
  const prize = `${(Number(prizePool) / 1e18).toFixed(4)} ETH`;
  const title = bracketId.replace(/-/g, " ");
  const description = `Prize Pool: ${prize} · Entry Fee: ${(Number(entryFee) / 1e18).toFixed(4)} ETH`;

  return (
    <BracketCard
      title={title}
      description={description}
      participants={participants}
      endDate={endDate}
      prize={prize}
      status={status}
      onJoin={() => onJoin(bracketId, title, entryFee)}
    />
  );
};

const Index = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialog, setJoinDialog] = useState<JoinDialogState>({
    open: false,
    bracketId: "",
    title: "",
    entryFee: BigInt(0),
  });
  const [filter, setFilter] = useState<"all" | "active" | "upcoming" | "ended">("all");

  // Fetch brackets from contract
  const { data: bracketIds, isLoading: loadingBrackets, error } = useBrackets();

  // Debug logging
  console.log('Brackets Data:', { bracketIds, loadingBrackets, error });

  const handleJoinBracket = (bracketId: string, title: string, entryFee: bigint) => {
    setJoinDialog({
      open: true,
      bracketId,
      title,
      entryFee,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header onCreateClick={() => setCreateDialogOpen(true)} />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-12 md:py-20">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-4xl leading-relaxed gradient-text pixel-glow">
            Decentralized Bracket Predictions
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Create, compete, and settle predictions on-chain. No admins, no gatekeepers.
            Pure skill-based gaming powered by blockchain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="pixel-button text-sm w-full sm:w-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Bracket
            </Button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-6 py-6">
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Filter:</span>
          </div>
          {(["all", "active", "upcoming", "ended"] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
              className={`text-[10px] px-4 py-2 border-2 ${
                filter === status
                  ? "pixel-button"
                  : "border-foreground bg-background hover:bg-muted"
              }`}
            >
              {status.toUpperCase()}
            </Button>
          ))}
        </div>
      </section>

      {/* Brackets Grid */}
      <section className="container mx-auto px-6 py-6 pb-20">
        {loadingBrackets && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <span className="ml-3 text-sm text-muted-foreground">Loading brackets from blockchain...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-20 pixel-card p-8 max-w-md mx-auto">
            <p className="text-red-500 text-sm mb-2">Error loading brackets from blockchain</p>
            <p className="text-xs text-muted-foreground">{error.message || 'Unknown error'}</p>
            <p className="text-xs text-muted-foreground mt-4">
              Contract: {CONTRACT_ADDRESS}
            </p>
          </div>
        )}

        {!loadingBrackets && !error && bracketIds && bracketIds.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bracketIds.map((bracketId: string) => (
              <BracketItem
                key={bracketId}
                bracketId={bracketId}
                onJoin={handleJoinBracket}
              />
            ))}
          </div>
        )}

        {!loadingBrackets && !error && (!bracketIds || bracketIds.length === 0) && (
          <div className="text-center py-20 pixel-card p-12 max-w-md mx-auto">
            <p className="text-muted-foreground text-sm mb-4">No brackets found on the blockchain yet.</p>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="pixel-button text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create the First Bracket
            </Button>
          </div>
        )}
      </section>

      <CreateBracketDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      <JoinBracketDialog
        open={joinDialog.open}
        onOpenChange={(open) => setJoinDialog({ ...joinDialog, open })}
        bracketId={joinDialog.bracketId}
        bracketTitle={joinDialog.title}
        entryFee={joinDialog.entryFee}
      />

      {/* Footer */}
      <footer className="border-t-4 border-foreground bg-card mt-20">
        <div className="container mx-auto px-6 py-8 text-center">
          <p className="text-[10px] text-muted-foreground">
            Built on blockchain. Powered by community. No gatekeepers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
