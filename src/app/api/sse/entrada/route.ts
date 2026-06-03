import { createSSEHandler } from "use-next-sse";
import QRCode from "qrcode";
import { createPrepareEntryUseCase } from "@/lib/use-cases/factory";
import { NoAvailableSpotsError } from "@/lib/use-cases/prepare-entry";
import { entradaEventEmitter, ENTRADA_EVENT } from "@/lib/sse/entrada-emitter";
import { BASE_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const GET = createSSEHandler((send, close, { onClose }) => {
  let closed = false;

  onClose(() => {
    closed = true;
  });

  const prepareEntry = createPrepareEntryUseCase();

  const run = async () => {
    try {
      while (!closed) {
        const { spot, token } = await prepareEntry.execute();
        const confirmUrl = `${BASE_URL}/entrada/confirmar?token=${token}`;
        const qrDataUrl = await QRCode.toDataURL(confirmUrl);

        send({ spot, token, qrDataUrl }, ENTRADA_EVENT);

        if (closed) break;

        await new Promise<void>((resolve) => {
          entradaEventEmitter.once(ENTRADA_EVENT, () => {
            if (!closed) resolve();
          });
        });
      }
    } catch (error) {
      if (error instanceof NoAvailableSpotsError && !closed) {
        send({ error: "Nao ha vagas disponiveis no momento" }, "error");
      }
    } finally {
      if (!closed) close();
    }
  };

  run();
});
