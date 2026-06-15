"use client";

import { useState, useRef, useEffect } from "react";
import type { User } from "@/lib/types";
import { formatDistance } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatAI({ user }: { user: User }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const systemPrompt = `Sos un asistente especializado en análisis de gemelos digitales de conductores para una aseguradora.
Tenés acceso a los datos del asegurado ${user.nombre}.

Perfil del conductor:
- Nombre: ${user.nombre}
- Dispositivo: ${user.dispositivo}
- Vehículo: ${user.vehiculo?.modelo ?? "—"}
- Antigüedad del vehículo: ${user.vehiculo?.Antigüedad ?? "—"}
- Valor del vehículo: ${user.vehiculo?.["Valor Infoauto jun 2026"] ?? "—"} (ARS ${(user.vehiculo?.["Valor ARS"] ?? 0).toLocaleString("es-AR")})
- Score seguridad activa del vehículo: ${user.vehiculo?.["Score seguridad activa"] ?? "—"}

Scores de conducción (promedio histórico):
- Score general: ${user.score_promedio?.general ?? "—"}/100
- Atención (uso de teléfono): ${user.score_promedio?.atencion ?? "—"}/100
- Suavidad (frenadas/aceleraciones): ${user.score_promedio?.suavidad ?? "—"}/100
- Legalidad (exceso de velocidad): ${user.score_promedio?.legal ?? "—"}/100
- Total de viajes registrados: ${user.total_viajes}

Score último mes (${user.score_ultimo?.mes ?? "—"}):
- General: ${user.score_ultimo?.score_general ?? "—"}/100
- Viajes: ${user.score_ultimo?.cantidad_viajes ?? "—"}
- Distancia: ${formatDistance(user.score_ultimo?.distancia_total_m ?? 0)}

Respondé siempre en español rioplatense. Sé conciso y orientado a decisiones de seguros: retención, ajuste de prima, recomendaciones al conductor.`;

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          system: systemPrompt,
        }),
      });

      if (!res.ok || !res.body) throw new Error("API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: updated[updated.length - 1].content + parsed.text,
                };
                return updated;
              });
            }
          } catch {
            // skip malformed chunk
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: "Error al conectar con el asistente. Verificá la API key.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 380 }}>
      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 12,
          paddingRight: 4,
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              color: "#334155",
              fontSize: 13,
              textAlign: "center",
              marginTop: 60,
              lineHeight: 1.6,
            }}
          >
            Preguntá sobre el perfil de {user.nombre}
            <br />
            <span style={{ fontSize: 11, color: "#1e293b" }}>
              ¿Qué riesgo tiene? ¿Conviene retenerlo? ¿Cómo va el score?
            </span>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              background: msg.role === "user" ? "#1d4ed8" : "#1e293b",
              borderRadius:
                msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              padding: "10px 14px",
              fontSize: 13,
              lineHeight: 1.6,
              color: "#f1f5f9",
              whiteSpace: "pre-wrap",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {msg.content ||
              (loading && i === messages.length - 1 ? (
                <span style={{ color: "#475569" }}>●●●</span>
              ) : (
                ""
              ))}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder={`Consultá sobre ${user.nombre.split(" ")[0]}...`}
          disabled={loading}
          style={{
            flex: 1,
            background: "#0f172a",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            padding: "10px 14px",
            color: "#f1f5f9",
            fontSize: 13,
            outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            background:
              loading || !input.trim() ? "#1e293b" : "#1d4ed8",
            color: loading || !input.trim() ? "#334155" : "white",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            padding: "10px 20px",
            fontSize: 14,
            cursor:
              loading || !input.trim() ? "not-allowed" : "pointer",
            transition: "background 0.15s",
          }}
        >
          {loading ? "..." : "→"}
        </button>
      </div>
    </div>
  );
}
