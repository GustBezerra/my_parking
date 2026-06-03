"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import "./swagger-docs.css";

export default function ApiDocs() {
  return (
    <div className="swagger-docs-page">
      <header className="swagger-docs-header">
        <h1>My Parking API</h1>
        <p>
          API do Sistema de Gerenciamento de Estacionamento —
          controle de vagas via QR Code com SSE em tempo real.
        </p>
      </header>
      <SwaggerUI
        url="/api/swagger"
        docExpansion="list"
        defaultModelsExpandDepth={1}
        tryItOutEnabled={false}
        filter={true}
        displayRequestDuration={true}
        deepLinking={true}
        persistAuthorization={true}
        supportedSubmitMethods={["get"]}
      />
    </div>
  );
}
