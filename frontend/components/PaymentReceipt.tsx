"use client";

type PaymentReceiptProps = {
  txHash: string;
  explorerUrl: string;
};

export function PaymentReceipt({ txHash, explorerUrl }: PaymentReceiptProps) {
  // Shorten tx hash for display: 0x1234...5678
  const shortHash =
    txHash.slice(0, 6) + "..." + txHash.slice(-4);

  return (
    <div className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 shadow-[0_12px_26px_-18px_rgba(16,185,129,0.8)]">

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-emerald-300 rounded-full" />
        <span className="text-emerald-300 font-medium text-sm">
          Transaction confirmed on Arc
        </span>
      </div>

      {/* Tx hash row */}
      <div className="mb-3 flex items-center justify-between rounded-lg border border-emerald-400/25 bg-black/20 px-3 py-2">
        <span className="text-slate-300 text-xs">Tx hash</span>
        <span className="text-emerald-200 font-mono text-xs">
          {shortHash}
        </span>
      </div>

      {/* View on ArcScan button */}
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-center text-sm font-medium text-white transition-all duration-200 hover:from-emerald-400 hover:to-teal-400"
      >
        View on ArcScan
      </a>
    </div>
  );
}