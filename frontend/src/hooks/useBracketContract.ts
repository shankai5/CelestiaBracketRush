import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contracts';
import { encryptUint64 } from '@/lib/fhe';

// Read all brackets
export function useBrackets() {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'listReplicaBrackets',
  });
}

// Read single bracket details
export function useBracket(bracketId: string) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getReplicaBracket',
    args: [bracketId],
  });
}

// Read bracket matchups
export function useBracketMatchups(bracketId: string) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getReplicaMatchups',
    args: [bracketId],
  });
}

// Create bracket
export function useCreateBracket() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createBracket = async (params: {
    bracketId: string;
    entryFee: bigint;
    duration: bigint;
    labels: string[];
    optionsLeft: string[];
    optionsRight: string[];
    allowDraw: boolean[];
  }) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'createReplicaBracket',
        args: [
          params.bracketId,
          params.entryFee,
          params.duration,
          params.labels,
          params.optionsLeft,
          params.optionsRight,
          params.allowDraw,
        ],
      });
    } catch (error) {
      console.error('Failed to create bracket:', error);
      toast.error('Failed to create bracket');
    }
  };

  return {
    createBracket,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Enter bracket with encrypted weight
export function useEnterBracket() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const enterBracket = async (params: {
    bracketId: string;
    picks: number[];
    weight: number;
    entryFee: bigint;
  }) => {
    try {
      // Encrypt the weight using FHE SDK
      toast.info('Encrypting your prediction weight...');
      const encrypted = await encryptUint64(params.weight);

      // Convert picks to uint8 array
      const picks = params.picks.map((p) => p as number);

      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'enterReplicaBracket',
        args: [params.bracketId, picks, encrypted.data as `0x${string}`, encrypted.proof as `0x${string}`],
        value: params.entryFee,
      });

      toast.success('Entry submitted! Waiting for confirmation...');
    } catch (error) {
      console.error('Failed to enter bracket:', error);
      toast.error('Failed to submit entry');
    }
  };

  return {
    enterBracket,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Adjust bracket entry
export function useAdjustEntry() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const adjustEntry = async (params: {
    bracketId: string;
    newPicks: number[];
    newWeight: number;
  }) => {
    try {
      toast.info('Encrypting new prediction weight...');
      const encrypted = await encryptUint64(params.newWeight);

      const picks = params.newPicks.map((p) => p as number);

      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'adjustReplicaEntry',
        args: [params.bracketId, picks, encrypted.data as `0x${string}`, encrypted.proof as `0x${string}`],
      });

      toast.success('Adjustment submitted! Waiting for confirmation...');
    } catch (error) {
      console.error('Failed to adjust entry:', error);
      toast.error('Failed to adjust entry');
    }
  };

  return {
    adjustEntry,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Settle bracket
export function useSettleBracket() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const settleBracket = async (bracketId: string) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'settleReplicaBracket',
        args: [bracketId],
      });

      toast.success('Settlement initiated! Waiting for confirmation...');
    } catch (error) {
      console.error('Failed to settle bracket:', error);
      toast.error('Failed to settle bracket');
    }
  };

  return {
    settleBracket,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Claim prize
export function useClaimPrize() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claimPrize = async (bracketId: string) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'claimReplicaPrize',
        args: [bracketId],
      });

      toast.success('Claim submitted! Waiting for confirmation...');
    } catch (error) {
      console.error('Failed to claim prize:', error);
      toast.error('Failed to claim prize');
    }
  };

  return {
    claimPrize,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Claim refund
export function useClaimRefund() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claimRefund = async (bracketId: string) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'claimReplicaRefund',
        args: [bracketId],
      });

      toast.success('Refund claim submitted! Waiting for confirmation...');
    } catch (error) {
      console.error('Failed to claim refund:', error);
      toast.error('Failed to claim refund');
    }
  };

  return {
    claimRefund,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Cancel bracket
export function useCancelBracket() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const cancelBracket = async (bracketId: string) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'cancelReplicaBracket',
        args: [bracketId],
      });

      toast.success('Cancellation submitted! Waiting for confirmation...');
    } catch (error) {
      console.error('Failed to cancel bracket:', error);
      toast.error('Failed to cancel bracket');
    }
  };

  return {
    cancelBracket,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
