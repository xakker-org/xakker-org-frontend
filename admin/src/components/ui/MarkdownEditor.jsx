import { useMemo, useRef, useState } from "react";
import { marked } from "marked";
import { useLang } from "../../contexts/LanguageContext";
import Icon from "./Icon";
import "./MarkdownEditor.css";

marked.setOptions({ breaks: true, gfm: true });

const T = {
  az: {
    write: "Yaz", preview: "Önizləmə",
    bold: "Qalın", italic: "Kursiv", h2: "Başlıq", link: "Keçid",
    code: "Kod", codeBlock: "Kod bloku", quote: "Sitat", ul: "Siyahı", ol: "Nömrələnmiş",
    empty: "Önizləmə üçün mətn yoxdur",
  },
  en: {
    write: "Write", preview: "Preview",
    bold: "Bold", italic: "Italic", h2: "Heading", link: "Link",
    code: "Code", codeBlock: "Code block", quote: "Quote", ul: "List", ol: "Numbered",
    empty: "Nothing to preview yet",
  },
};

// Wraps/prefixes the current textarea selection with markdown syntax and
// restores a sane cursor/selection afterwards.
function applyWrap(el, before, after = before, placeholder = "") {
  const { selectionStart: s, selectionEnd: e, value } = el;
  const selected = value.slice(s, e) || placeholder;
  const next = value.slice(0, s) + before + selected + after + value.slice(e);
  const cursorStart = s + before.length;
  const cursorEnd = cursorStart + selected.length;
  return { next, cursorStart, cursorEnd };
}

function applyLinePrefix(el, prefix) {
  const { selectionStart: s, selectionEnd: e, value } = el;
  const lineStart = value.lastIndexOf("\n", s - 1) + 1;
  const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
  return { next, cursorStart: s + prefix.length, cursorEnd: e + prefix.length };
}

const TOOLBAR = [
  { key: "bold", icon: "B", action: (el) => applyWrap(el, "**", "**", "qalın mətn") },
  { key: "italic", icon: "I", action: (el) => applyWrap(el, "_", "_", "kursiv mətn") },
  { key: "h2", icon: "H", action: (el) => applyLinePrefix(el, "## ") },
  { key: "link", icon: "🔗", action: (el) => applyWrap(el, "[", "](https://)", "keçid mətni") },
  { key: "code", icon: "</>", action: (el) => applyWrap(el, "`", "`", "kod") },
  { key: "codeBlock", icon: "{ }", action: (el) => applyWrap(el, "```\n", "\n```", "kod bloku") },
  { key: "quote", icon: "❝", action: (el) => applyLinePrefix(el, "> ") },
  { key: "ul", icon: "•", action: (el) => applyLinePrefix(el, "- ") },
  { key: "ol", icon: "1.", action: (el) => applyLinePrefix(el, "1. ") },
];

/**
 * Polished dark-mode Markdown editor: toolbar + write/preview toggle,
 * split-friendly (used inline where FieldRenderer wires `richtext` fields).
 * Value is a plain markdown string; onChange(nextValue) mirrors Textarea's
 * `(e) => onChange(e.target.value)` contract used by the rest of the forms.
 */
export default function MarkdownEditor({ id, value = "", onChange, rows = 14 }) {
  const { lang } = useLang();
  const t = T[lang] || T.az;
  const [mode, setMode] = useState("write"); // "write" | "preview"
  const textareaRef = useRef(null);

  const html = useMemo(() => {
    if (!value) return "";
    try {
      return marked.parse(value);
    } catch {
      return "";
    }
  }, [value]);

  const runAction = (action) => {
    const el = textareaRef.current;
    if (!el) return;
    const { next, cursorStart, cursorEnd } = action(el);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  return (
    <div className="mde">
      <div className="mde-toolbar">
        <div className="mde-tools">
          {TOOLBAR.map((tool) => (
            <button
              key={tool.key}
              type="button"
              className="mde-tool"
              title={t[tool.key]}
              disabled={mode === "preview"}
              onClick={() => runAction(tool.action)}
            >
              {tool.icon}
            </button>
          ))}
        </div>
        <div className="mde-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "write"}
            className={`mde-tab${mode === "write" ? " is-active" : ""}`}
            onClick={() => setMode("write")}
          >
            <Icon name="terminal" size={13} /> {t.write}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "preview"}
            className={`mde-tab${mode === "preview" ? " is-active" : ""}`}
            onClick={() => setMode("preview")}
          >
            <Icon name="eye" size={13} /> {t.preview}
          </button>
        </div>
      </div>

      {mode === "write" ? (
        <textarea
          id={id}
          ref={textareaRef}
          className="mde-textarea"
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
        />
      ) : (
        <div className="mde-preview" style={{ minHeight: rows * 22 }}>
          {html ? (
            <div className="mde-preview-body" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <div className="mde-preview-empty">{t.empty}</div>
          )}
        </div>
      )}
    </div>
  );
}
