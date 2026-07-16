import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";
import { endpoints } from "../services/endpoints";
import Icon from "../components/ui/Icon";

const T = {
  az: {
    newChat: "Yeni söhbət",
    history: "Söhbətlər",
    noHistory: "Hələ söhbət yoxdur",
    greetingSub:
      "Xakker.org-un AI köməkçisiyəm — kibertəhlükəsizlik və platforma haqqında suallarınıza cavab verirəm",
    placeholder: "Sualınızı yazın...",
    send: "Göndər",
    enterHint: "Göndərmək üçün Enter, yeni sətir üçün Shift+Enter",
    thinking: "Düşünür...",
    loadError: "Söhbətlər yüklənə bilmədi.",
    sendError: "Mesaj göndərilmədi. Yenidən cəhd edin.",
    errorTitle: "Nəsə səhv getdi",
    newMessage: "Yeni mesaj aç",
    retry: "Yenidən cəhd et",
    deleteConfirm: "Bu söhbəti silmək istəyirsiniz?",
    you: "Siz",
    assistant: "Xakker AI",
    today: "Bu gün",
    closeHistory: "Bağla",
    openHistory: "Söhbətlər",
  },
  en: {
    newChat: "New chat",
    history: "Conversations",
    noHistory: "No conversations yet",
    greetingSub:
      "I'm Xakker.org's AI assistant — I answer your questions about cybersecurity and the platform",
    placeholder: "Type your question...",
    send: "Send",
    enterHint: "Enter to send, Shift+Enter for a new line",
    thinking: "Thinking...",
    loadError: "Couldn't load conversations.",
    sendError: "Message failed to send. Try again.",
    errorTitle: "Something went wrong",
    newMessage: "New message",
    retry: "Retry",
    deleteConfirm: "Delete this conversation?",
    you: "You",
    assistant: "Xakker AI",
    today: "Today",
    closeHistory: "Close",
    openHistory: "Conversations",
  },
};

function fmtDate(iso, lang) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(lang === "az" ? "az-AZ" : "en-US", { day: "2-digit", month: "short" });
  } catch {
    return "";
  }
}

/** Types out `text` char-by-char into onTick, resolves onDone when complete. */
function useTypewriter() {
  const timerRef = useRef(null);
  useEffect(() => () => clearInterval(timerRef.current), []);
  return (text, onTick, onDone) => {
    clearInterval(timerRef.current);
    let i = 0;
    const step = Math.max(1, Math.round(text.length / 140));
    timerRef.current = setInterval(() => {
      i += step;
      if (i >= text.length) {
        onTick(text);
        clearInterval(timerRef.current);
        onDone && onDone();
      } else {
        onTick(text.slice(0, i));
      }
    }, 14);
  };
}

export default function AiAssistantPage() {
  const { lang } = useLang();
  const t = T[lang] || T.az;

  const [conversations, setConversations] = useState([]);
  const [convLoading, setConvLoading] = useState(true);
  const [convError, setConvError] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]); // {id, role, content, streaming}
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [failedMessage, setFailedMessage] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const listRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const typewriter = useTypewriter();

  const NEAR_BOTTOM_PX = 96;

  const isNearBottom = () => {
    const el = listRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM_PX;
  };

  const handleMessagesScroll = () => {
    stickToBottomRef.current = isNearBottom();
  };

  const scrollToBottom = () => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  const loadConversations = () => {
    setConvLoading(true);
    endpoints
      .aiChatConversations()
      .then(({ data }) => {
        setConversations(Array.isArray(data) ? data : []);
        setConvError(false);
      })
      .catch(() => setConvError(true))
      .finally(() => setConvLoading(false));
  };

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    if (stickToBottomRef.current) {
      // Wait for layout to reflect the just-rendered content. A single rAF is
      // enough for incremental typewriter ticks, but a full conversation swap
      // (openConversation) can mount many bubble nodes at once whose height
      // isn't committed by the time the first rAF fires — so we scroll again
      // on a second rAF (post-paint) to guarantee we land on the true bottom.
      let raf2;
      const raf1 = requestAnimationFrame(() => {
        scrollToBottom();
        raf2 = requestAnimationFrame(scrollToBottom);
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
  }, [messages]);

  const openConversation = (id) => {
    setDrawerOpen(false);
    setActiveId(id);
    setError("");
    setMessages([]);
    stickToBottomRef.current = true;
    endpoints
      .aiChatConversation(id)
      .then(({ data }) => {
        setMessages((data.messages || []).map((m) => ({ ...m, streaming: false })));
      })
      .catch(() => setError(t.loadError));
  };

  const startNewChat = () => {
    setDrawerOpen(false);
    setActiveId(null);
    setMessages([]);
    setError("");
    setFailedMessage(null);
    stickToBottomRef.current = true;
  };

  const send = (explicitText) => {
    const value = (explicitText ?? input).trim();
    if (!value || sending) return;
    if (explicitText == null) setInput("");
    setError("");
    setFailedMessage(null);
    const userMsg = { id: `local-${Date.now()}`, role: "user", content: value, created_at: new Date().toISOString() };
    stickToBottomRef.current = true;
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    const isNewConversation = activeId == null;

    endpoints
      .aiChatSend({ conversation_id: activeId, message: value, lang })
      .then(({ data }) => {
        if (isNewConversation) setActiveId(data.conversation_id);

        const assistantId = data.assistant_message.id;
        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: "assistant", content: "", streaming: true },
        ]);

        typewriter(
          data.assistant_message.content,
          (partial) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: partial } : m))
            );
          },
          () => {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m))
            );
            if (isNewConversation) loadConversations();
            else {
              // bump updated conversation to top / refresh preview
              loadConversations();
            }
          }
        );
      })
      .catch(() => {
        setError(t.sendError);
        setFailedMessage(value);
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      })
      .finally(() => setSending(false));
  };

  const retrySend = () => {
    if (!failedMessage) return;
    const text = failedMessage;
    setError("");
    setFailedMessage(null);
    send(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const deleteConversation = (id, e) => {
    e.stopPropagation();
    if (!window.confirm(t.deleteConfirm)) return;
    endpoints
      .aiChatDeleteConversation(id)
      .then(() => {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeId === id) startNewChat();
      })
      .catch(() => {});
  };

  const isEmpty = messages.length === 0;

  const renderErrorState = (compact) => (
    <motion.div
      className={`ai-error-state${compact ? " is-compact" : ""}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="ai-empty-video-wrap ai-error-video-wrap" aria-hidden="true">
        <video
          className="ai-empty-video"
          src="/static/logo/error.mp4"
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          aria-hidden="true"
        />
      </div>
      <p className="ai-error-title">{t.errorTitle}</p>
      <p className="ai-error-sub">{error}</p>
      <div className="ai-error-actions">
        <button type="button" className="ai-error-btn ghost" onClick={startNewChat}>
          <Icon name="plus" size={14} />
          {t.newMessage}
        </button>
        <button type="button" className="ai-error-btn primary" onClick={retrySend}>
          <Icon name="refresh" size={14} />
          {t.retry}
        </button>
      </div>
    </motion.div>
  );

  return (
    <>
      <div className="ai-page">
        <section className="ai-main">
          <div className="ai-main-topbar">
            <span className="ai-main-title">
              <Icon name="sparkles" size={15} />
              <span>{t.assistant}</span>
            </span>
            <button
              type="button"
              className={`ai-drawer-toggle${drawerOpen ? " is-active" : ""}`}
              onClick={() => setDrawerOpen((v) => !v)}
              aria-expanded={drawerOpen}
              aria-label={drawerOpen ? t.closeHistory : t.openHistory}
            >
              <Icon name="menu" size={16} />
              <span>{t.history}</span>
            </button>
          </div>

          {isEmpty ? (
            <div className="ai-empty">
              {error ? (
                renderErrorState()
              ) : (
                <motion.div
                  className="ai-empty-inner"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="ai-empty-video-wrap" aria-hidden="true">
                    <video
                      className="ai-empty-video"
                      src="/static/logo/salamlama-animasiyasi.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      disablePictureInPicture
                      aria-hidden="true"
                    />
                  </div>
                  <p className="ai-empty-sub">{t.greetingSub}</p>

                  <div className="ai-composer ai-composer-center">
                    <textarea
                      className="ai-input"
                      rows={1}
                      value={input}
                      placeholder={t.placeholder}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button
                      type="button"
                      className="ai-send"
                      disabled={!input.trim() || sending}
                      onClick={() => send()}
                      aria-label={t.send}
                    >
                      <Icon name="arrowRight" size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <>
              <div className="ai-messages" ref={listRef} onScroll={handleMessagesScroll}>
                <AnimatePresence initial={false}>
                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      className={`ai-bubble-row ${m.role}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className={`ai-bubble ${m.role}`}>
                        <div className="ai-bubble-role">{m.role === "user" ? t.you : t.assistant}</div>
                        <div className="ai-bubble-text">
                          {m.content}
                          {m.streaming && <span className="ai-caret" />}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {sending && (
                    <motion.div
                      key="typing"
                      className="ai-bubble-row assistant"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="ai-bubble assistant is-typing">
                        <span className="ai-dot" />
                        <span className="ai-dot" />
                        <span className="ai-dot" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="ai-composer">
                <textarea
                  className="ai-input"
                  rows={1}
                  value={input}
                  placeholder={t.placeholder}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  className="ai-send"
                  disabled={!input.trim() || sending}
                  onClick={() => send()}
                  aria-label={t.send}
                >
                  <Icon name="arrowRight" size={16} />
                </button>
              </div>
              <div className="ai-hint">{t.enterHint}</div>
              {error && renderErrorState(true)}
            </>
          )}
        </section>

        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div
                className="ai-drawer-overlay"
                onClick={() => setDrawerOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.aside
                className="ai-history"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="ai-history-head">
                  <span className="ai-history-title">{t.history}</span>
                  <button
                    type="button"
                    className="ai-history-close"
                    onClick={() => setDrawerOpen(false)}
                    aria-label={t.closeHistory}
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>
                <button type="button" className="ai-new-chat" onClick={startNewChat}>
                  <Icon name="plus" size={14} />
                  {t.newChat}
                </button>
                <div className="ai-history-list">
                  {convLoading && (
                    <div className="ai-history-empty">{lang === "az" ? "Yüklənir..." : "Loading..."}</div>
                  )}
                  {!convLoading && convError && <div className="ai-history-empty">{t.loadError}</div>}
                  {!convLoading && !convError && conversations.length === 0 && (
                    <div className="ai-history-empty">{t.noHistory}</div>
                  )}
                  {!convLoading &&
                    conversations.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        className={`ai-history-item${c.id === activeId ? " is-active" : ""}`}
                        onClick={() => openConversation(c.id)}
                      >
                        <div className="ai-history-item-title">{c.title}</div>
                        <div className="ai-history-item-meta">
                          <span>{fmtDate(c.updated_at || c.created_at, lang)}</span>
                        </div>
                        <span
                          className="ai-history-item-del"
                          role="button"
                          tabIndex={-1}
                          onClick={(e) => deleteConversation(c.id, e)}
                          aria-label="delete"
                        >
                          <Icon name="trash" size={13} />
                        </span>
                      </button>
                    ))}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
