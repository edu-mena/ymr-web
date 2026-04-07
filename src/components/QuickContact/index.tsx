import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";

export default function QuickContact() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Olá! Como podemos ajudar você hoje?", fromSupport: true, timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Função para formatar horário HH:mm
  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function sendMessage() {
    if (input.trim() === "") return;
    const newMsg = { id: Date.now(), text: input.trim(), fromSupport: false, timestamp: new Date() };
    setMessages((msgs) => [...msgs, newMsg]);
    setInput("");

    // Simular resposta do suporte depois de 1.5s
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        {
          id: Date.now() + 1,
          text: "Obrigado pelo contato! Estamos verificando.",
          fromSupport: true,
          timestamp: new Date()
        }
      ]);
    }, 1500);
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center z-50 transition-colors"
        aria-label={open ? "Fechar chat de suporte" : "Abrir chat de suporte"}
      >
        {open ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Janela de chat */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 max-w-full bg-white rounded-lg shadow-xl flex flex-col z-50">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between bg-blue-600 text-white rounded-t-lg px-4 py-2">
            <h2 className="font-semibold text-lg">Suporte</h2>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar chat"
              className="hover:bg-blue-700 p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 max-h-[400px] bg-gray-50 flex flex-col">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[75%] p-2 rounded-lg flex flex-col ${
                  msg.fromSupport
                    ? "bg-blue-100 text-blue-800 self-start items-start"
                    : "bg-blue-600 text-white self-end items-end"
                }`}
              >
                <span>{msg.text}</span>
                <span className="text-xs text-gray-500 mt-1 select-none">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex border-t border-gray-300"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 px-3 py-2 outline-none rounded-bl-lg bg-white text-gray-900 placeholder-gray-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-br-lg transition-colors"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </>
  );
}
