import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = () =>
  createSwaggerSpec({
    apiFolder: "src/app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "My Parking API",
        version: "1.0.0",
        description:
          "API do Sistema de Gerenciamento de Estacionamento — controle de vagas via QR Code com atualizacao em tempo real via SSE.",
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Desenvolvimento local",
        },
      ],
    },
  });
