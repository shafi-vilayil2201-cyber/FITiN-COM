import React, { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IMAGE_BASE_URL, chatWithAi } from "../../services/api";

const starterMessages = [
  {
    id: "assistant-welcome",
    role: "assistant",
    answer: "Ask about products, recommendations, shipping, returns, or delivery.",
    suggestedProducts: [],
    sources: [],
  },
];

const getImageUrl = (value) =>
{
  if (!value) return "https://via.placeholder.com/120x120?text=FiTiN";
  return value.startsWith("http") ? value.replace(":7071", ":5252") : `${IMAGE_BASE_URL}${value}`;
};

const createConversationId = () =>
{
  if (typeof crypto !== "undefined" && crypto.randomUUID)
  {
    return crypto.randomUUID();
  }

  return `fitn-ai-${Date.now()}`;
};

const getPageContext = (pathname) =>
{
  if (pathname.startsWith("/products/")) return "product-detail";
  if (pathname.startsWith("/products")) return "products-listing";
  if (pathname.startsWith("/categories")) return "categories-page";
  if (pathname.startsWith("/cart")) return "cart-page";
  if (pathname.startsWith("/checkout")) return "checkout-page";
  if (pathname.startsWith("/supplements")) return "supplements-page";
  return "home-page";
};

const getFriendlyAiErrorMessage = (error) =>
{
  const rawMessage = String(error?.message || "").toLowerCase();

  if (
    rawMessage.includes("anthropic") ||
    rawMessage.includes("credit balance") ||
    rawMessage.includes("plans & billing") ||
    rawMessage.includes("invalid_request_error") ||
    rawMessage.includes("status code")
  )
  {
    return "AI assistant is temporarily unavailable. Please try again later.";
  }

  if (error?.status >= 500)
  {
    return "AI assistant is temporarily unavailable. Please try again later.";
  }

  return error?.message || "AI request failed.";
};

const AiChatWidget = () =>
{
  const navigate = useNavigate();
  const location = useLocation();
  const conversationIdRef = useRef(createConversationId());
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(starterMessages);

  const pageContext = useMemo(() => getPageContext(location.pathname), [location.pathname]);

  const handleSend = async () =>
  {
    const message = input.trim();
    if (!message || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      answer: message,
      suggestedProducts: [],
      sources: [],
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);

    try
    {
      const response = await chatWithAi({
        message,
        conversationId: conversationIdRef.current,
        pageContext,
      });

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          answer: response?.answer || "I could not generate a response right now.",
          suggestedProducts: response?.suggestedProducts || [],
          sources: response?.sources || [],
        },
      ]);
    } catch (error)
    {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          answer: getFriendlyAiErrorMessage(error),
          suggestedProducts: [],
          sources: [],
        },
      ]);
    } finally
    {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) =>
  {
    if (event.key === "Enter" && !event.shiftKey)
    {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[70] md:bottom-6 md:right-6">
      {isOpen ? (
        <div className="premium-card flex h-[min(78vh,40rem)] w-[min(calc(100vw-2rem),24rem)] flex-col overflow-hidden rounded-[30px] border border-white/75 bg-white/92 shadow-[0_28px_80px_rgba(24,28,33,0.18)] backdrop-blur-xl">
          <div className="flex items-start justify-between border-b border-slate-200/70 px-4 py-4">
            <div>
              <p className="card-metadata">Fitin AI</p>
              <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-900">Shopping assistant</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="soft-pill flex h-10 w-10 items-center justify-center text-slate-700"
              aria-label="Close AI assistant"
            >
              ×
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div key={message.id} className={message.role === "user" ? "ml-8" : "mr-8"}>
                <div
                  className={message.role === "user"
                    ? "rounded-[22px] bg-slate-900 px-4 py-3 text-sm leading-6 text-white"
                    : "rounded-[22px] bg-white/85 px-4 py-3 text-sm leading-6 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                  }
                >
                  {message.answer}
                </div>

                {message.role === "assistant" && message.suggestedProducts?.length > 0 && (
                  <div className="mt-3 grid gap-3">
                    {message.suggestedProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="premium-panel grid grid-cols-[4.5rem_1fr] items-center gap-3 rounded-[22px] p-3 text-left"
                      >
                        <img
                          src={getImageUrl(product.imageUrl)}
                          alt={product.name}
                          className="h-[4.5rem] w-[4.5rem] rounded-[18px] object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">{product.categoryName}</p>
                          <p className="mt-2 text-sm font-semibold text-slate-900">Rs {Number(product.price || 0).toLocaleString("en-IN")}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {message.role === "assistant" && message.sources?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.sources.map((source, index) => (
                      <span key={`${message.id}-source-${index}`} className="soft-pill px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                        {source.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="mr-8 rounded-[22px] bg-white/85 px-4 py-3 text-sm text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                Thinking...
              </div>
            )}
          </div>

          <div className="border-t border-slate-200/70 p-4">
            <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                placeholder="Ask FiTiN AI for product help, shipping, returns, or recommendations"
                className="w-full resize-none bg-transparent px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              <div className="flex items-center justify-between gap-3 px-2 pb-2">
                <p className="text-xs text-slate-500">Context: {pageContext.replace(/-/g, " ")}</p>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="primary-cta px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="primary-cta flex items-center gap-3 px-5 py-4 text-sm shadow-[0_18px_40px_rgba(29,31,33,0.24)]"
        >
          <span className="text-base">✦</span>
          Ask Fitin AI
        </button>
      )}
    </div>
  );
};

export default AiChatWidget;
