"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Bot,
  Check,
  Loader2,
  Send,
  Sparkles,
  X,
  RotateCcw,
} from "lucide-react";

import axios from "@/lib/axios";

type AiMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

type GriotAiChatProps = {
  open: boolean;
  onClose: () => void;
  idea: string;
  onUseContent: (content: string) => void;
};

export default function GriotAiChat({
  open,
  onClose,
  idea,
  onUseContent,
}: GriotAiChatProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  /* =========================================================
     MESSAGE D'ACCUEIL
  ========================================================= */

  useEffect(() => {
    if (!open) return;

    if (messages.length === 0) {
      setMessages([
        {
          id: Date.now(),
          role: "assistant",
          content:
            "Bonjour 👋 Je suis Griot AI. Je peux vous aider à créer, reformuler ou améliorer votre publication. Décrivez-moi simplement ce que vous souhaitez.",
        },
      ]);
    }
  }, [open, messages.length]);

  /* =========================================================
     SCROLL AUTOMATIQUE
  ========================================================= */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  /* =========================================================
     ENVOYER À GEMINI
  ========================================================= */

  const handleSend = async () => {
    const userMessage = message.trim();

    if (!userMessage || loading) return;

    const userMessageItem: AiMessage = {
      id: Date.now(),
      role: "user",
      content: userMessage,
    };

    setMessages((current) => [
      ...current,
      userMessageItem,
    ]);

    setMessage("");
    setLoading(true);

    try {
      let prompt = userMessage;

      if (idea.trim()) {
        prompt = `
Tu aides l'utilisateur à créer une publication pour les réseaux sociaux.

Voici son idée actuelle :
"${idea}"

Demande de l'utilisateur :
"${userMessage}"

Réponds directement avec le contenu demandé.
N'ajoute pas de commentaire inutile avant ou après le contenu.
Adapte le texte à la demande de l'utilisateur.
        `.trim();
      }

      const response = await axios.post(
        "/api/ai/test",
        {
          message: prompt,
        }
      );

      const content =
        response.data?.message ||
        "Je n'ai pas reçu de réponse.";

      const assistantMessage: AiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content,
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (error: any) {
      console.error(
        "Erreur Griot AI :",
        error
      );

      let errorMessage =
        "Une erreur est survenue avec Griot AI.";

      if (
        error?.response?.data?.message
      ) {
        errorMessage =
          error.response.data.message;
      }

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     ENTRÉE CLAVIER
  ========================================================= */

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSend();
    }
  };

  /* =========================================================
     ACTIONS RAPIDES
  ========================================================= */

  const handleQuickAction = (
    action: string
  ) => {
    if (loading) return;

    setMessage(action);
  };

  /* =========================================================
     NOUVELLE CONVERSATION
  ========================================================= */

  const handleReset = () => {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        content:
          "Nouvelle conversation ✨ Que souhaitez-vous créer ?",
      },
    ]);

    setMessage("");
  };

  if (!open) return null;

  return (
    <>
      {/* =====================================================
          FOND MOBILE
      ===================================================== */}

      <div
        className="fixed inset-0 z-[80] bg-black/20 backdrop-blur-[2px] lg:hidden"
        onClick={onClose}
      />

      {/* =====================================================
          CHAT
      ===================================================== */}

      <aside
        className="
          fixed
          right-0
          top-0
          z-[90]
          flex
          h-screen
          w-full
          max-w-[430px]
          flex-col
          border-l
          border-slate-200
          bg-white
          shadow-2xl
        "
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-dark text-white shadow-sm">
              <Sparkles size={18} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-[13px] font-black text-slate-800">
                  Griot AI
                </h2>

                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[7px] font-black text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  EN LIGNE
                </span>
              </div>

              <p className="mt-0.5 text-[9px] text-slate-400">
                Votre assistant de création
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleReset}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Nouvelle conversation"
              title="Nouvelle conversation"
            >
              <RotateCcw size={14} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Fermer Griot AI"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* ===================================================
            ACTIONS RAPIDES
        =================================================== */}

        <div className="shrink-0 border-b border-slate-100 bg-slate-50/60 px-4 py-3">
          <p className="mb-2 text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
            Actions rapides
          </p>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() =>
                handleQuickAction(
                  "Crée une publication professionnelle à partir de mon idée."
                )
              }
              className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[8px] font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-dark"
            >
              ✍️ Créer un texte
            </button>

            <button
              type="button"
              onClick={() =>
                handleQuickAction(
                  "Crée une publication Instagram courte, engageante et avec des hashtags pertinents."
                )
              }
              className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[8px] font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-dark"
            >
              📱 Instagram
            </button>

            <button
              type="button"
              onClick={() =>
                handleQuickAction(
                  "Reformule mon contenu pour le rendre plus professionnel et engageant."
                )
              }
              className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[8px] font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-dark"
            >
              ✨ Améliorer
            </button>
          </div>
        </div>

        {/* ===================================================
            MESSAGES
        =================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-4">
            {messages.map((item) => {
              const isUser =
                item.role === "user";

              return (
                <div
                  key={item.id}
                  className={`flex ${
                    isUser
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] ${
                      isUser
                        ? ""
                        : "w-full"
                    }`}
                  >
                    {!isUser && (
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-red-dark text-white">
                          <Bot size={11} />
                        </div>

                        <span className="text-[8px] font-black text-slate-500">
                          Griot AI
                        </span>
                      </div>
                    )}

                    <div
                      className={`rounded-2xl px-3.5 py-3 ${
                        isUser
                          ? "rounded-br-md bg-red-dark text-white"
                          : "rounded-bl-md border border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      <p className="whitespace-pre-line text-[10px] leading-[1.7]">
                        {item.content}
                      </p>
                    </div>

                    {!isUser &&
                      item.content &&
                      !item.content.startsWith(
                        "Une erreur"
                      ) && (
                        <button
                          type="button"
                          onClick={() =>
                            onUseContent(
                              item.content
                            )
                          }
                          className="mt-2 flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-2.5 py-2 text-[8px] font-black text-red-dark transition hover:bg-red-100"
                        >
                          <Check size={12} />
                          Utiliser dans ma publication
                        </button>
                      )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="w-full max-w-[88%]">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-red-dark text-white">
                      <Bot size={11} />
                    </div>

                    <span className="text-[8px] font-black text-slate-500">
                      Griot AI
                    </span>
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-slate-50 px-3.5 py-3">
                    <Loader2
                      size={14}
                      className="animate-spin text-red-dark"
                    />

                    <span className="text-[9px] font-semibold text-slate-400">
                      Griot AI réfléchit...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ===================================================
            CONTEXTE IDÉE
        =================================================== */}

        {idea.trim() && (
          <div className="shrink-0 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
            <div className="flex items-start gap-2">
              <Sparkles
                size={12}
                className="mt-0.5 shrink-0 text-red-dark"
              />

              <p className="line-clamp-2 text-[8px] leading-relaxed text-slate-500">
                <span className="font-black text-slate-600">
                  Idée actuelle :
                </span>{" "}
                {idea}
              </p>
            </div>
          </div>
        )}

        {/* ===================================================
            INPUT
        =================================================== */}

        <div className="shrink-0 border-t border-slate-200 bg-white p-3.5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-red-dark focus-within:bg-white focus-within:ring-4 focus-within:ring-red-dark/10">
            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={3}
              placeholder="Demandez à Griot AI de créer ou modifier votre contenu..."
              className="w-full resize-none bg-transparent px-2 py-1.5 text-[10px] leading-relaxed text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <div className="flex items-center justify-between px-1">
              <p className="text-[7px] text-slate-400">
                Entrée pour envoyer · Shift + Entrée
                pour une nouvelle ligne
              </p>

              <button
                type="button"
                onClick={handleSend}
                disabled={
                  loading ||
                  !message.trim()
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-dark text-white transition hover:bg-red-dark/90 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Envoyer"
              >
                {loading ? (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}