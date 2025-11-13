import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateBracket } from "@/hooks/useBracketContract";
import { parseEther } from "viem";

interface Matchup {
  label: string;
  optionLeft: string;
  optionRight: string;
  allowDraw: boolean;
}

interface CreateBracketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateBracketDialog = ({ open, onOpenChange }: CreateBracketDialogProps) => {
  const queryClient = useQueryClient();
  const [bracketId, setBracketId] = useState("");
  const [entryFee, setEntryFee] = useState("0.001");
  const [durationDays, setDurationDays] = useState("7");
  const [matchups, setMatchups] = useState<Matchup[]>([
    { label: "Match 1", optionLeft: "", optionRight: "", allowDraw: false },
  ]);

  const hasShownSuccessToast = useRef(false);
  const lastSuccessHash = useRef<string | undefined>();
  const { createBracket, isPending, isConfirming, isSuccess, hash } = useCreateBracket();

  // Handle success
  useEffect(() => {
    if (isSuccess && hash && hash !== lastSuccessHash.current && !hasShownSuccessToast.current) {
      hasShownSuccessToast.current = true;
      lastSuccessHash.current = hash;

      toast.success(
        <div className="flex flex-col gap-1">
          <div className="font-semibold">Bracket created successfully!</div>
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

      // Invalidate queries to refresh bracket list
      queryClient.invalidateQueries({ queryKey: ['brackets'] });

      // Close dialog after short delay
      setTimeout(() => {
        onOpenChange(false);
        resetForm();
      }, 1000);
    }
  }, [isSuccess, hash, onOpenChange, queryClient]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      hasShownSuccessToast.current = false;
      lastSuccessHash.current = undefined;
    }
  }, [open]);

  const resetForm = () => {
    setBracketId("");
    setEntryFee("0.001");
    setDurationDays("7");
    setMatchups([{ label: "Match 1", optionLeft: "", optionRight: "", allowDraw: false }]);
  };

  const addMatchup = () => {
    if (matchups.length >= 12) {
      toast.error("Maximum 12 matchups allowed");
      return;
    }
    setMatchups([
      ...matchups,
      { label: `Match ${matchups.length + 1}`, optionLeft: "", optionRight: "", allowDraw: false },
    ]);
  };

  const removeMatchup = (index: number) => {
    if (matchups.length <= 2) {
      toast.error("Minimum 2 matchups required");
      return;
    }
    const newMatchups = matchups.filter((_, i) => i !== index);
    setMatchups(newMatchups);
  };

  const updateMatchup = (index: number, field: keyof Matchup, value: string | boolean) => {
    const newMatchups = [...matchups];
    newMatchups[index] = { ...newMatchups[index], [field]: value };
    setMatchups(newMatchups);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!bracketId.trim()) {
      toast.error("Please enter a bracket ID");
      return;
    }

    if (matchups.some((m) => !m.optionLeft.trim() || !m.optionRight.trim())) {
      toast.error("Please fill in all matchup options");
      return;
    }

    const entryFeeWei = parseEther(entryFee);
    const durationSeconds = BigInt(Math.floor(Number(durationDays) * 24 * 60 * 60));

    try {
      await createBracket({
        bracketId: bracketId.trim(),
        entryFee: entryFeeWei,
        duration: durationSeconds,
        labels: matchups.map((m) => m.label),
        optionsLeft: matchups.map((m) => m.optionLeft),
        optionsRight: matchups.map((m) => m.optionRight),
        allowDraw: matchups.map((m) => m.allowDraw),
      });
    } catch (error) {
      console.error("Failed to create bracket:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-4 max-w-3xl max-h-[85vh] p-0">
        <div className="max-h-[85vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-xl gradient-text">Create New Bracket</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Basic Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bracketId" className="text-xs">
                Bracket ID *
              </Label>
              <Input
                id="bracketId"
                value={bracketId}
                onChange={(e) => setBracketId(e.target.value)}
                placeholder="e.g. NBA-FINALS-2025"
                className="border-2 border-foreground bg-background text-xs"
                disabled={isPending || isConfirming}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entryFee" className="text-xs">
                Entry Fee (ETH) *
              </Label>
              <Input
                id="entryFee"
                type="number"
                step="0.001"
                min="0.001"
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
                placeholder="0.001"
                className="border-2 border-foreground bg-background text-xs"
                disabled={isPending || isConfirming}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-xs">
                Duration (Days) *
              </Label>
              <Input
                id="duration"
                type="number"
                step="1"
                min="1"
                max="84"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                placeholder="7"
                className="border-2 border-foreground bg-background text-xs"
                disabled={isPending || isConfirming}
                required
              />
            </div>
          </div>

          {/* Matchups */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold">Matchups ({matchups.length}/12)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMatchup}
                disabled={matchups.length >= 12 || isPending || isConfirming}
                className="border-2 border-foreground text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Matchup
              </Button>
            </div>

            {matchups.map((matchup, index) => (
              <div key={index} className="pixel-card p-4 space-y-3 bg-muted/30">
                <div className="flex justify-between items-center">
                  <Input
                    value={matchup.label}
                    onChange={(e) => updateMatchup(index, "label", e.target.value)}
                    placeholder="Matchup label"
                    className="border-2 border-foreground bg-background text-xs flex-1 mr-2"
                    disabled={isPending || isConfirming}
                  />
                  {matchups.length > 2 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeMatchup(index)}
                      disabled={isPending || isConfirming}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Left Option *</Label>
                    <Input
                      value={matchup.optionLeft}
                      onChange={(e) => updateMatchup(index, "optionLeft", e.target.value)}
                      placeholder="e.g. Team A"
                      className="border-2 border-foreground bg-background text-xs"
                      disabled={isPending || isConfirming}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Right Option *</Label>
                    <Input
                      value={matchup.optionRight}
                      onChange={(e) => updateMatchup(index, "optionRight", e.target.value)}
                      placeholder="e.g. Team B"
                      className="border-2 border-foreground bg-background text-xs"
                      disabled={isPending || isConfirming}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`allowDraw-${index}`}
                    checked={matchup.allowDraw}
                    onChange={(e) => updateMatchup(index, "allowDraw", e.target.checked)}
                    className="w-4 h-4"
                    disabled={isPending || isConfirming}
                  />
                  <Label htmlFor={`allowDraw-${index}`} className="text-xs cursor-pointer">
                    Allow Draw
                  </Label>
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="pixel-card p-4 bg-blue-500/10 border-2 border-blue-500/50">
            <p className="text-xs text-blue-200">
              💡 <span className="font-semibold">Tip:</span> Create unique bracket IDs (e.g., NBA-FINALS-2025).
              Entry fee must be at least 0.001 ETH. Duration is when predictions lock, not when bracket ends.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-2 border-foreground"
              disabled={isPending || isConfirming}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 pixel-button"
              disabled={isPending || isConfirming}
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isPending ? "Submitting..." : "Confirming..."}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Bracket
                </>
              )}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBracketDialog;
