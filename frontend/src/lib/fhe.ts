import { create } from 'zustand';
import { getAddress, bytesToHex } from 'viem';
import { CONTRACT_ADDRESS } from '@/config/contracts';

declare global {
  interface Window {
    RelayerSDK?: any;
    relayerSDK?: any;
    ethereum?: any;
    okxwallet?: any;
  }
}

interface FheState {
  ready: boolean;
  initializing: boolean;
  error: string | null;
}

export const useFheStore = create<FheState>(() => ({
  ready: false,
  initializing: false,
  error: null
}));

let fheInstance: any = null;

/**
 * Get SDK from window (loaded via static script tag in HTML)
 * SDK 0.3.0-5 is loaded via static script tag in index.html
 */
const getSDK = (): any => {
  if (typeof window === 'undefined') {
    throw new Error('FHE SDK requires browser environment');
  }

  // Check for both uppercase and lowercase versions
  const sdk = window.RelayerSDK || window.relayerSDK;

  if (!sdk) {
    throw new Error('RelayerSDK not loaded. Please ensure the script tag is in your HTML.');
  }

  return sdk;
};

export const initializeFhe = async (): Promise<void> => {
  const state = useFheStore.getState();
  if (state.ready || state.initializing) return;

  useFheStore.setState({ initializing: true, error: null });

  try {
    console.log('[FHE] 🚀 Initializing FHE SDK...');

    const sdk = getSDK();

    // Get Ethereum provider from multiple sources (supporting different wallets)
    const provider =
      window.ethereum ||
      window.okxwallet?.provider ||
      window.okxwallet;

    if (!provider) {
      throw new Error('No Ethereum provider found. Please connect your wallet first.');
    }

    const { initSDK, createInstance, SepoliaConfig } = sdk;

    console.log('[FHE] 🔧 SDK found, calling initSDK()...');
    await initSDK();
    console.log('[FHE] ✅ SDK initialized');

    console.log('[FHE] 🏗️ Creating FHE instance for Sepolia...');
    const config = { ...SepoliaConfig, network: provider };

    fheInstance = await createInstance(config);
    console.log('[FHE] ✅ FHE instance created successfully!');

    useFheStore.setState({ ready: true, initializing: false });
  } catch (error) {
    console.error('[FHE] ❌ Initialization failed:', error);
    const message = error instanceof Error ? error.message : 'Unknown FHE error';
    useFheStore.setState({ initializing: false, error: message });
    throw error;
  }
};

export const isFheReady = () => useFheStore.getState().ready;

const ensureInstance = async () => {
  if (!fheInstance) {
    await initializeFhe();
  }
  if (!fheInstance) throw new Error('FHE SDK not initialized');
  return fheInstance;
};

export const encryptWeight = async (
  weight: bigint,
  userAddress: string
): Promise<{ handle: `0x${string}`; proof: `0x${string}` }> => {
  console.log('[FHE] 🔐 Starting encryption process...');
  console.log('[FHE] 📊 Input:', { weight, userAddress, contractAddress: CONTRACT_ADDRESS });

  if (weight <= 0n) throw new Error('Weight must be positive');

  const instance = await ensureInstance();

  try {
    console.log('[FHE] 📝 Creating encrypted input...');
    const input = instance.createEncryptedInput(
      getAddress(CONTRACT_ADDRESS),
      getAddress(userAddress)
    );

    input.add64(weight);

    console.log('[FHE] 🔐 Encrypting...');
    const { handles, inputProof } = await input.encrypt();

    const handle = bytesToHex(handles[0]) as `0x${string}`;
    const proof = bytesToHex(inputProof) as `0x${string}`;

    console.log('[FHE] ✅ Encryption completed');
    console.log('[FHE] 📋 Encrypted handle length:', handle.length);
    console.log('[FHE] 📋 Proof length:', proof.length);

    return { handle, proof };
  } catch (error) {
    console.error('[FHE] ❌ Encryption failed:', error);
    throw new Error(`Failed to encrypt weight: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Legacy compatibility exports
export const initFHE = initializeFhe;
export const getFHEInstance = ensureInstance;
export const encryptUint64 = async (value: number | bigint, userAddress?: string): Promise<{ data: string; proof: string }> => {
  if (!userAddress) {
    // Try to get from window.ethereum
    const accounts = await window.ethereum?.request({ method: 'eth_accounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('No wallet connected');
    }
    userAddress = accounts[0];
  }

  const { handle, proof } = await encryptWeight(BigInt(value), userAddress);
  return { data: handle, proof };
};
