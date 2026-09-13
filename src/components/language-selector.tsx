"use client";

import * as React from "react";
import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguageCode,
} from "@/lib/languages";
import { Globe } from "lucide-react";

export interface LanguageSelectorProps {
  value: SupportedLanguageCode | null;
  onChange: (code: SupportedLanguageCode | null) => void;
  disabled?: boolean;
  showLabel?: boolean;
}

/**
 * LanguageSelector - Dropdown to select target language for PDF translation
 */
export function LanguageSelector({
  value,
  onChange,
  disabled = false,
  showLabel = true,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLanguage = SUPPORTED_LANGUAGES.find((lang) => lang.code === value);

  const handleSelect = (code: SupportedLanguageCode) => {
    onChange(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {showLabel && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          <Globe className="inline h-4 w-4 mr-1.5 -mt-0.5 text-[#C9A962]" />
          Target Language
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-2
          px-3 py-2.5 text-sm border rounded-lg
          transition-colors cursor-pointer
          ${disabled
            ? "bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200"
            : isOpen
            ? "bg-white border-[#C9A962] ring-2 ring-[#C9A962]/20"
            : "bg-white border-slate-300 hover:border-[#C9A962] hover:bg-slate-50"
          }
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={`flex items-center gap-2 ${!selectedLanguage ? "text-slate-400" : ""}`}>
          {selectedLanguage ? (
            <>
              <span
                className={`inline-block w-5 h-5 rounded overflow-hidden ${
                  selectedLanguage.rtl ? "bg-slate-800" : "bg-slate-100"
                }`}
              >
                {selectedLanguage.nativeName.charAt(0)}
              </span>
              <span className="font-medium">{selectedLanguage.nativeName}</span>
              <span className="text-slate-500 text-xs">({selectedLanguage.name})</span>
            </>
          ) : (
            <span className="text-slate-400">Select language...</span>
          )}
        </span>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-60 overflow-auto">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer text-left ${
                  value === lang.code
                    ? "bg-[#C9A962]/10 text-[#171717] font-medium"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
                role="option"
                aria-selected={value === lang.code}
              >
                <span
                  className={`inline-block w-5 h-5 rounded overflow-hidden flex items-center justify-center text-xs ${
                    lang.rtl ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {lang.nativeName.charAt(0)}
                </span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{lang.nativeName}</div>
                  <div className="text-xs text-slate-500">{lang.name}</div>
                </div>
                {lang.rtl && (
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21V3m0 0l3 3m-3-3l-3 3m7 0v-9m0 0l3 3m-3-3l-3 3" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function LanguageBadge({ code }: { code: SupportedLanguageCode }) {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  if (!lang) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        lang.rtl ? "bg-slate-800 text-white" : "bg-[#C9A962]/10 text-[#8b7435]"
      }`}
    >
      {lang.nativeName}
      <span className="text-[10px]">({code})</span>
    </span>
  );
}