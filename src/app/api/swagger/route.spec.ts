import { describe, it, expect } from "vitest";
import { GET } from "./route";

describe("GET /api/swagger", () => {
  it("returns 200 with OpenAPI spec", async () => {
    const response = await GET();

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.openapi).toBe("3.0.0");
    expect(body.info.title).toBe("My Parking API");
    expect(body.paths).toBeDefined();
  });

  it("includes all API routes in paths", async () => {
    const response = await GET();
    const body = await response.json();

    expect(body.paths).toHaveProperty("/api/confirmar");
    expect(body.paths).toHaveProperty("/api/saida");
    expect(body.paths).toHaveProperty("/api/sse/entrada");
    expect(body.paths).toHaveProperty("/api/vagas");
    expect(body.paths).toHaveProperty("/api/admin/login");
  });

  it("documents /api/confirmar with GET method", async () => {
    const response = await GET();
    const body = await response.json();

    expect(body.paths["/api/confirmar"]).toHaveProperty("get");
  });

  it("documents /api/admin/login with POST method", async () => {
    const response = await GET();
    const body = await response.json();

    expect(body.paths["/api/admin/login"]).toHaveProperty("post");
  });
});
