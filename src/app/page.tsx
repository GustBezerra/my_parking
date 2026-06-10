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

  const [showInfo, setShowInfo] = useState(false);
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
      <div className={styles.topButtons}>
        <button className={styles.adminButton} onClick={() => router.push("/admin/dashboard")}>
          ⚙️
        </button>

        <div className={styles.infoContainer}>
          <button className={styles.infoButton} onClick={() => setShowInfo(!showInfo)}>
            👥
          </button>

          {showInfo && (
            <div className={styles.dropdown}>
              <h4>Frontend</h4>
              <ul>
                <li>Ádamo Levy</li>
                <li>Gustavo Silva</li>
                <li>Kayo Ranniel</li>
                <li>Maria Alícia</li>
                <li>Timóteo Moura</li>
              </ul>

              <h4>Backend</h4>
              <ul>
                <li>Antônio José</li>
                <li>Enzho Pablo</li>
                <li>Francisco David</li>
                <li>Jose Alexsandro</li>
                <li>Kamila Alves</li>
                <li>Raffael Gonçalves</li>
                <li>Raquel Aparecida</li>
                <li>Raylan Levi</li>
                <li>Sergio Carvalho</li>
                <li>Victor César</li>
              </ul>

              <hr />

              <a
                href="https://github.com/anatielsantos/my_parking" target="_blank" rel="noopener noreferrer">
                Repositório GitHub
              </a>
            </div>
          )}
        </div>
      </div>

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
