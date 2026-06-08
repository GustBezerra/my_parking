"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

interface Spot {
  id: number;
  code: number;
  status: "disponivel" | "ocupada";
}

interface ApiResponse {
  success: boolean;
  total: number;
  spots: Spot[];
  error?: string;
}

export default function DashboardPage() {
  const router = useRouter();

  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/vagas");
        const data: ApiResponse = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/admin/login");
            return;
          }
          throw new Error(data.error || "Erro ao carregar vagas");
        }

        setSpots(data.spots);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const total = spots.length;

  const disponiveis = spots.filter(
    (spot) => spot.status === "disponivel",
  ).length;

  const ocupadas = spots.filter((spot) => spot.status === "ocupada").length;

  const ocupacao = total > 0 ? ((ocupadas / total) * 100).toFixed(0) : "0";

  if (loading) {
    return (
      <main className={styles.container}>
        <p>Carregando dashboard...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.container}>
        <div className={styles.error}>{error}</div>
      </main>
    );
  }

  return (
    /* Melhorar o layout e a estética aqui*/
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Painel Administrativo</h1>
        <button
          className={styles.homeButton}
          onClick={() => router.push("/") /* Voltar para a página inicial */}
        >
          ⬅️
        </button>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.card}>
          <h3>Total</h3>
          <span>{total}</span>
        </div>

        <div className={styles.card}>
          <h3>Disponíveis</h3>
          <span>{disponiveis}</span>
        </div>

        <div className={styles.card}>
          <h3>Ocupadas</h3>
          <span>{ocupadas}</span>
        </div>

        <div className={styles.card}>
          <h3>Ocupação</h3>
          <span>{ocupacao}%</span>
        </div>
      </section>

      <section className={styles.tableContainer}>
        <h2>Vagas do estacionamento</h2>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {spots.map((spot) => (
              <tr key={spot.id}>
                <td>{spot.code}</td>

                <td>
                  <span
                    className={
                      spot.status === "ocupada"
                        ? styles.ocupada
                        : styles.disponivel
                    }
                  >
                    {spot.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
