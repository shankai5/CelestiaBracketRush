import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import { useBracketMatchups, useEnterBracket } from "@/hooks/useBracketContract";
import { initializeFhe } from "@/lib/fhe";

interface JoinBracketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bracketId: string;
  bracketTitle: string;
  entryFee: bigint;
}

const JoinBracketDialog = ({
  open,
  onOpenChange,
  bracketId,
  bracketTitle,
  entryFee,
}: JoinBracketDialogProps) => {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const [picks, setPicks] = useState<number[]>([]);
  const [weight, setWeight] = useState(50);
  const [fheReady, setFheReady] = useState(false);
  const [initializingFHE, setInitializingFHE] = useState(false);
  const hasShownSuccessToast = useRef(false);
  const lastSuccessHash = useRef<string | undefined>();

  const { data: matchups, isLoading: loadingMatchups } = useBracketMatchups(bracketId);
  const { enterBracket, isPending, isConfirming, isSuccess, hash } = useEnterBracket();

  // Initialize FHE SDK when dialog opens
  useEffect(() => {
    if (open && !fheReady && !initializingFHE) {
      setInitializingFHE(true);
      initializeFhe()
        .then(() => {
          setFheReady(true);
          setInitializingFHE(false);
        })
        .catch((error) => {
          console.error('FHE initialization failed:', error);
          setInitializingFHE(false);
          toast.error('Failed to initialize encryption system');
        });
    }
  }, [open, fheReady, initializingFHE]);

  // Initialize picks when matchups load
  useEffect(() => {
    if (matchups && picks.length === 0) {
      // Initialize all picks to 0 (left option)
      setPicks(new Array(matchups.length).fill(0));
    }
  }, [matchups, picks.length]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setPicks([]);
      setWeight(50);
      hasShownSuccessToast.current = false;
      lastSuccessHash.current = undefined;
    }
  }, [open]);

  // Handle success - only show toast once per transaction
  useEffect(() => {
    if (isSuccess && hash && hash !== lastSuccessHash.current && !hasShownSuccessToast.current) {
      hasShownSuccessToast.current = true;
      lastSuccessHash.current = hash;

      toast.success(
        <div className="flex flex-col gap-1">
          <div className="font-semibold">Successfully joined bracket!</div>
          <a
            href={`https://sepolia.etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 underline"
          >
            View on Etherscan →
          </a>
        </div>,
        { duration: 5000 }
      );

      // Invalidate queries to refresh bracket data
      queryClient.invalidateQueries({ queryKey: ['bracket'] });
      queryClient.invalidateQueries({ queryKey: ['brackets'] });

      // Close dialog after short delay
      setTimeout(() => {
        onOpenChange(false);
      }, 1000);
    }
  }, [isSuccess, hash, onOpenChange, queryClient]);

  const handlePickChange = (index: number, value: number) => {
    const newPicks = [...picks];
    newPicks[index] = value;
    setPicks(newPicks);
  };

  const handleSubmit = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!fheReady) {
      toast.error('Encryption system not ready. Please wait...');
      return;
    }

    if (picks.length === 0 || picks.some(p => p === undefined)) {
      toast.error('Please make all your predictions');
      return;
    }

    try {
      await enterBracket({
        bracketId,
        picks,
        weight,
        entryFee,
      });
    } catch (error) {
      console.error('Failed to join bracket:', error);
    }
  };

  if (!isConnected) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Wallet Required</DialogTitle>
            <DialogDescription>
              Please connect your wallet to join this bracket.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="gradient-text">Join {bracketTitle}</DialogTitle>
          <DialogDescription>
            Make your predictions and set your confidence weight. Entry Fee: {(Number(entryFee) / 1e18).toFixed(4)} ETH
          </DialogDescription>
        </DialogHeader>

        {initializingFHE && (
          <div className="flex items-center justify-center py-8 space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm text-muted-foreground">Initializing encryption system...</span>
          </div>
        )}

        {!initializingFHE && loadingMatchups && (
          <div className="flex items-center justify-center py-8 space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading matchups...</span>
          </div>
        )}

        {!initializingFHE && !loadingMatchups && matchups && (
          <div className="space-y-6">
            {/* Matchups */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Your Predictions</h3>
              {matchups.map((matchup: any, index: number) => (
                <div key={index} className="pixel-card p-4 space-y-3">
                  <Label className="text-xs font-semibold">{matchup.label}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={picks[index] === 0 ? "default" : "outline"}
                      onClick={() => handlePickChange(index, 0)}
                      className={`text-xs ${picks[index] === 0 ? 'pixel-button' : 'border-2 border-foreground'}`}
                    >
                      {matchup.optionLeft}
                    </Button>
                    {matchup.allowDraw && (
                      <Button
                        variant={picks[index] === 2 ? "default" : "outline"}
                        onClick={() => handlePickChange(index, 2)}
                        className={`text-xs ${picks[index] === 2 ? 'pixel-button' : 'border-2 border-foreground'}`}
                      >
                        Draw
                      </Button>
                    )}
                    <Button
                      variant={picks[index] === 1 ? "default" : "outline"}
                      onClick={() => handlePickChange(index, 1)}
                      className={`text-xs ${picks[index] === 1 ? 'pixel-button' : 'border-2 border-foreground'}`}
                    >
                      {matchup.optionRight}
                    </Button>
                  </div>
                  <div className="text-[10px] text-muted-foreground flex justify-between">
                    <span>Picks: L:{matchup.picksLeft.toString()} R:{matchup.picksRight.toString()}{matchup.allowDraw ? ` D:${matchup.picksDraw.toString()}` : ''}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Confidence Weight */}
            <div className="pixel-card p-4 space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold">Confidence Weight (Encrypted)</Label>
                <span className="text-sm font-bold gradient-text">{weight}</span>
              </div>
              <Slider
                value={[weight]}
                onValueChange={(value) => setWeight(value[0])}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />

              {/* Weight Explanation */}
              <div className="space-y-2 text-[11px]">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-cyan-400 font-semibold mt-0.5">ℹ️</span>
                  <div>
                    <p className="font-semibold text-foreground mb-1">What is Confidence Weight?</p>
                    <p className="leading-relaxed">
                      Your weight determines your share of the prize pool. Higher weights mean bigger rewards if you win,
                      but you compete against others with similar confidence levels.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                  <div className="space-y-1">
                    <p className="text-emerald-400 font-semibold">✓ Higher Weight (70-100)</p>
                    <p className="text-muted-foreground text-[10px]">
                      • Larger prize share<br/>
                      • Higher rewards<br/>
                      • More competitive
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-amber-400 font-semibold">⚡ Lower Weight (1-30)</p>
                    <p className="text-muted-foreground text-[10px]">
                      • Smaller prize share<br/>
                      • Lower rewards<br/>
                      • Less competitive
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-border/50 text-[10px]">
                  <span className="text-purple-400">🔒</span>
                  <p className="text-purple-300">
                    Your weight is <span className="font-semibold">fully encrypted</span> using FHE technology -
                    no one can see it until the bracket is settled.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 border-2 border-foreground"
                disabled={isPending || isConfirming}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 pixel-button"
                disabled={isPending || isConfirming || !fheReady || picks.length === 0}
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isPending ? 'Encrypting...' : 'Confirming...'}
                  </>
                ) : (
                  `Join for ${(Number(entryFee) / 1e18).toFixed(4)} ETH`
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JoinBracketDialog;
