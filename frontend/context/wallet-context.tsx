"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  SUPPORTED_WALLETS,
  connectWallet,
  toWalletErrorMessage,
  type WalletDescriptor,
  type WalletId,
  type WalletSession,
} from "@/lib/wallet";

type WalletStatus = "idle" | "connecting" | "connected" | "error";

interface WalletContextValue {
  wallets: readonly WalletDescriptor[];
  status: WalletStatus;
  session: WalletSession | null;
  selectedWalletId: WalletId | null;
  errorMessage: string | null;
  isHydrated: boolean;
  connect: (walletId: WalletId) => Promise<void>;
  disconnect: () => void;
  clearError: () => void;
}

const STORAGE_KEY = "flowfi.wallet.session.v1";
const WalletContext = createContext<WalletContextValue | undefined>(undefined);
const VALID_WALLET_IDS: WalletId[] = ["freighter", "albedo", "xbull"];

function isWalletSession(value: unknown): value is WalletSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Partial<WalletSession>;

  return (
    typeof session.walletId === "string" &&
    VALID_WALLET_IDS.includes(session.walletId as WalletId) &&
    typeof session.walletName === "string" &&
    typeof session.publicKey === "string" &&
    typeof session.connectedAt === "string" &&
    typeof session.network === "string" &&
    typeof session.mocked === "boolean"
  );
}

function readStoredSession(): WalletSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isWalletSession(parsed)) {
      return parsed;
    }
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return null;
}

function storeSession(session: WalletSession): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function removeStoredSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<WalletStatus>("idle");
  const [session, setSession] = useState<WalletSession | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<WalletId | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const existingSession = readStoredSession();

    if (existingSession) {
      setSession(existingSession);
      setSelectedWalletId(existingSession.walletId);
      setStatus("connected");
    }

    setIsHydrated(true);
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
    setStatus((currentStatus) =>
      currentStatus === "error" ? "idle" : currentStatus,
    );
  }, []);

  const connect = useCallback(async (walletId: WalletId) => {
    setSelectedWalletId(walletId);
    setErrorMessage(null);
    setStatus("connecting");

    try {
      const nextSession = await connectWallet(walletId);
      setSession(nextSession);
      setStatus("connected");
      storeSession(nextSession);
    } catch (error) {
      setSession(null);
      setStatus("error");
      setErrorMessage(toWalletErrorMessage(error));
      removeStoredSession();
    }
  }, []);

  const disconnect = useCallback(() => {
    setStatus("idle");
    setSession(null);
    setSelectedWalletId(null);
    setErrorMessage(null);
    removeStoredSession();
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      wallets: SUPPORTED_WALLETS,
      status,
      session,
      selectedWalletId,
      errorMessage,
      isHydrated,
      connect,
      disconnect,
      clearError,
    }),
    [
      clearError,
      connect,
      disconnect,
      errorMessage,
      isHydrated,
      selectedWalletId,
      session,
      status,
    ],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useWallet must be used within WalletProvider.");
  }

  return context;
}
