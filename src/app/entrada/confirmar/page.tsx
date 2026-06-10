"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import QRCode from "qrcode";
import styles from "./page.module.css";

type PageState =
  | { status: "loading" }
  | { status: "success"; spotCode: number; saidaQrUrl: string; token: string }
  | { status: "error"; message: string };

function ConfirmarContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<PageState>({ status: "loading" });
  const [exitState, setExitState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [exitError, setExitError] = useState("");

  const handleExit = useCallback(async () => {
    if (!token) return;
    setExitState("loading");
    try {
      const res = await fetch(`/api/saida?token=${token}`);
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Erro ao liberar saída");
      }
      setExitState("success");
    } catch (err) {
      setExitError(err instanceof Error ? err.message : "Erro desconhecido");
      setExitState("error");
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      queueMicrotask(() => {
        setState({
          status: "error",
          message: "Token ausente",
        });
      });

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
        const saidaUrl = `${window.location.origin}/api/saida?token=${token}`;
        const saidaQrUrl = await QRCode.toDataURL(saidaUrl);
        if (cancelled) return;

        setState({
          status: "success",
          spotCode: entry.spotId,
          saidaQrUrl,
          token: token!,
        });
      })

      .catch((err: Error) => {
        if (cancelled) return;

        setState({
          status: "error",
          message: err.message,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state.status === "loading") {
    return (
      <div className={styles.container}>
        <p>Processando entrada...</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className={styles.container}>
        <h1>Erro</h1>
        <p>{state.message}</p>
      </div>
    );
  }

  if (exitState === "success") {
    return (
      <div className={styles.container}>
        <p className={styles.exitSuccessFullscreen}>Saída liberada!</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Vaga {state.spotCode} reservada!</h1>
        <p className={styles.message}>Guarde este QR Code para usar na saída.</p>
        <img
          src={state.saidaQrUrl}
          alt="QR Code de saída"
          className={styles.qrImage}
        />
        <p className={styles.token}>
          <small>Token: {state.token}</small>
        </p>
        <div className={styles.actions}>
          {exitState === "idle" && (
            <>
              <p className={styles.hint}>
                Você pode usar o QR Code ou clicar no botão abaixo para liberar sua vaga.
              </p>
              <button className={styles.exitButton} onClick={handleExit}>
                Sair
              </button>
            </>
          )}
          {exitState === "loading" && (
            <button className={styles.exitButton} disabled>
              Liberando...
            </button>
          )}
          {exitState === "error" && (
            <>
              <p className={styles.exitError}>{exitError}</p>
              <button className={styles.exitButton} onClick={handleExit}>
                Sair
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ConfirmarPage() {
  return (
    <Suspense fallback={<div className={styles.container}>Carregando...</div>}>
      <ConfirmarContent />
    </Suspense>
  );
}
