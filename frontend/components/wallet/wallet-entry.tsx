"use client";

import { useWallet } from "@/context/wallet-context";
import { shortenPublicKey } from "@/lib/wallet";

function formatConnectedAt(timestamp: string): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function WalletEntry() {
  const {
    wallets,
    status,
    session,
    selectedWalletId,
    errorMessage,
    isHydrated,
    connect,
    disconnect,
    clearError,
  } = useWallet();

  if (!isHydrated) {
    return (
      <main className="app-shell">
        <section className="wallet-panel wallet-panel--loading">
          <div className="loading-pulse" />
          <h1>Loading wallet session...</h1>
          <p className="subtitle">
            Checking your previous connection before loading FlowFi.
          </p>
        </section>
      </main>
    );
  }

  if (status === "connected" && session) {
    return (
      <main className="app-shell">
        <section className="wallet-panel connected-panel">
          <p className="kicker">Wallet Connected</p>
          <h1>FlowFi Access Granted</h1>
          <p className="subtitle">
            Your wallet session is active. Continue into payment streams and
            subscriptions.
          </p>

          <p className="connected-wallet">{session.walletName}</p>

          <div className="connected-meta">
            <div className="connected-row">
              <span>Public key</span>
              <strong>{shortenPublicKey(session.publicKey)}</strong>
            </div>
            <div className="connected-row">
              <span>Network</span>
              <strong>{session.network}</strong>
            </div>
            <div className="connected-row">
              <span>Connected at</span>
              <strong>{formatConnectedAt(session.connectedAt)}</strong>
            </div>
          </div>

          {session.mocked ? (
            <p className="mock-note">
              Running with a mocked wallet session until full adapter
              integration is finished.
            </p>
          ) : null}

          <div className="connected-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={disconnect}
            >
              Disconnect
            </button>
          </div>
        </section>
      </main>
    );
  }

  const isConnecting = status === "connecting";

  return (
    <main className="app-shell">
      <section className="wallet-panel">
        <p className="kicker">FlowFi Entry</p>
        <h1>Select a wallet to continue</h1>
        <p className="subtitle">
          Choose your preferred wallet provider. The connection session is
          stored locally so you stay signed in after refresh.
        </p>

        {errorMessage ? (
          <div className="wallet-error" role="alert">
            <span>{errorMessage}</span>
            <button type="button" className="inline-link" onClick={clearError}>
              Dismiss
            </button>
          </div>
        ) : null}

        <div className="wallet-grid">
          {wallets.map((wallet, index) => {
            const isActiveWallet = selectedWalletId === wallet.id;
            const isConnectingThisWallet = isConnecting && isActiveWallet;

            return (
              <article
                key={wallet.id}
                className="wallet-card"
                data-active={isActiveWallet ? "true" : undefined}
                style={{ animationDelay: `${index * 110}ms` }}
              >
                <header className="wallet-card__header">
                  <h2>{wallet.name}</h2>
                  <span>{wallet.badge}</span>
                </header>
                <p>{wallet.description}</p>
                <button
                  type="button"
                  className="wallet-button"
                  disabled={isConnecting}
                  onClick={() => void connect(wallet.id)}
                >
                  {isConnectingThisWallet
                    ? "Connecting..."
                    : `Connect ${wallet.name}`}
                </button>
              </article>
            );
          })}
        </div>

        <p className="wallet-status" data-busy={isConnecting ? "true" : undefined}>
          {isConnecting
            ? "Awaiting wallet approval..."
            : "Supported wallets: Freighter, Albedo, xBull."}
        </p>
      </section>
    </main>
  );
}
