"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

type PageState =
  | { status: "loading" }
  | { status: "success"; spotCode: number; saidaQrUrl: string }
  | { status: "error"; message: string };

function ConfirmarContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<PageState>({ status: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ status: "error", message: "Token ausente" });
      return;
    }

    let cancelled = false;

    fetch(`/api/confirmar?token=${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || "Erro ao confirmar entrada");
        }
        return res.json();
      })
      .then(async ({ entry }) => {
        if (cancelled) return;
        const saidaUrl = `/api/saida?token=${token}`;
        const saidaQrUrl = await QRCode.toDataURL(saidaUrl);
        if (cancelled) return;
        setState({
          status: "success",
          spotCode: entry.spotId,
          saidaQrUrl,
        });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setState({ status: "error", message: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state.status === "loading") {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p>Processando entrada...</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h1>Erro</h1>
        <p>{state.message}</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Vaga {state.spotCode} reservada!</h1>
      <p>Guarde este QR Code para usar na saída.</p>
      <img
        src={state.saidaQrUrl}
        alt="QR Code de saída"
        style={{ maxWidth: "300px", width: "100%" }}
      />
      <p>
        <small>Token: {token}</small>
      </p>
    </div>
  );
}

export default function ConfirmarPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "2rem" }}>Carregando...</div>}>
      <ConfirmarContent />
    </Suspense>
  );
}
