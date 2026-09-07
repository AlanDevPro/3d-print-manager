import { useEffect, useState } from "react";

export function useCountdownPedido(fechaEstimadaListo: string | null) {
  const [restanteMs, setRestanteMs] = useState<number | null>(null);

  useEffect(() => {
    if (!fechaEstimadaListo) {
      setRestanteMs(null);
      return;
    }
    const objetivo = new Date(fechaEstimadaListo).getTime();

    const tick = () => setRestanteMs(Math.max(0, objetivo - Date.now()));
    tick();
    const intervalo = setInterval(tick, 1000);
    return () => clearInterval(intervalo);
  }, [fechaEstimadaListo]);

  if (restanteMs === null) return { texto: null, finalizado: false };

  const totalSeg = Math.floor(restanteMs / 1000);
  const h = Math.floor(totalSeg / 3600);
  const m = Math.floor((totalSeg % 3600) / 60);
  const s = totalSeg % 60;

  return {
    texto: `${h}h ${m}m ${s}s`,
    finalizado: restanteMs <= 0,
  };
}