"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

interface EntradaEvent {
  token: string;
  qrDataUrl: string;
}

export default function Home() {
  const router = useRouter();

  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const eventSource = new EventSource("/api/sse/entrada");

    eventSource.addEventListener("vaga_ocupada", (event: Event) => {
      try {
        const messageEvent = event as MessageEvent;

        const data = JSON.parse(messageEvent.data) as EntradaEvent;

        setQrCode(data.qrDataUrl);

        setError("");
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    });

    eventSource.addEventListener("error", () => {
      setError("Não foi possível carregar vagas disponíveis.");

      setLoading(false);
    });

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    /* Melhorar o layout e a estética aqui*/
    <main className={styles.home}>
      <button
        className={styles.adminButton}
        onClick={() => router.push("/admin/login")}
      >
        ⚙️
      </button>

      <section className={styles.card}>
        <h1 className={styles.title}>My Parking</h1>

        <p className={styles.subtitle}>
          Escaneie o QR Code abaixo com o celular.
        </p>

        {loading && <div className={styles.loading}>Carregando QR Code...</div>}

        {!loading && error && <div className={styles.error}>{error}</div>}

        {!loading && qrCode && (
          <div className={styles.qrWrapper}>
            <img
              src={qrCode}
              alt="QR Code para entrada"
              className={styles.qrImage}
            />
          </div>
        )}
      </section>
    </main>
  );
}
