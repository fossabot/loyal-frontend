"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import localFont from "next/font/local";
import Image from "next/image";
import { useEffect,useRef, useState } from "react";

import { CircleChevronRightIcon } from "@/components/ui/circle-chevron-right";
import { CopyIcon, type CopyIconHandle } from "@/components/ui/copy";
import { MenuIcon, type MenuIconHandle } from "@/components/ui/menu";

const instrumentSerif = localFont({
  src: [
    {
      path: "../../../public/fonts/InstrumentSerif-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/fonts/InstrumentSerif-Italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  display: "swap",
});

export default function LandingPage() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });
  const [input, setInput] = useState("");
  const [isChatMode, setIsChatMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const menuIconRef = useRef<MenuIconHandle>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const copyIconRefs = useRef<Map<string, CopyIconHandle>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Control menu icon animation based on sidebar state
  useEffect(() => {
    if (isSidebarOpen) {
      menuIconRef.current?.startAnimation();
    } else {
      menuIconRef.current?.stopAnimation();
    }
  }, [isSidebarOpen]);

  // Auto-focus on initial load
  useEffect(() => {
    // Focus the textarea when the component mounts
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 500);

    return () => clearTimeout(timer);
  }, []); // Empty dependency array = run once on mount

  // Auto-focus input when entering chat mode with multiple fallback strategies
  useEffect(() => {
    if (isChatMode && inputRef.current) {
      const focusInput = () => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select(); // Also select any existing text
        }
      };

      // Strategy 1: Immediate focus attempt
      focusInput();

      // Strategy 2: After micro-task
      Promise.resolve().then(focusInput);

      // Strategy 3: After animation frame (for layout)
      requestAnimationFrame(() => {
        focusInput();

        // Strategy 4: After second animation frame (for paint)
        requestAnimationFrame(focusInput);
      });

      // Strategy 5: After transition completes (800ms based on CSS)
      const timeout1 = setTimeout(focusInput, 850);

      // Strategy 6: Multiple attempts with increasing delays
      const timeout2 = setTimeout(focusInput, 100);
      const timeout3 = setTimeout(focusInput, 300);
      const timeout4 = setTimeout(focusInput, 500);
      const timeout5 = setTimeout(focusInput, 1000);

      // Cleanup
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);
        clearTimeout(timeout4);
        clearTimeout(timeout5);
      };
    }
  }, [isChatMode]);

  // Keep focus on textarea when messages change (e.g., after receiving response)
  useEffect(() => {
    if (isChatMode && messages.length > 0 && inputRef.current) {
      // Small delay to ensure UI has updated
      const timeout = setTimeout(() => {
        if (document.activeElement !== inputRef.current) {
          inputRef.current?.focus();
        }
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [messages, isChatMode]);

  // Auto-resize textarea when input changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      // Use a small delay to ensure DOM is updated
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status === "ready") {
      sendMessage({ text: input });
      setInput("");
      setIsChatMode(true);

      // Reset textarea height and ensure focus
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.style.height = 'auto';
          inputRef.current.focus();
        }
      }, 50);
    }
  };

  const handleCopyMessage = async (messageId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);

      // Trigger animation on the specific copy icon
      const iconHandle = copyIconRefs.current.get(messageId);
      iconHandle?.startAnimation();

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedMessageId(null);
        iconHandle?.stopAnimation();
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Mock data for previous chats - replace with real data later
  const previousChats = [
    { id: "1", title: "What is quantum computing?", timestamp: "2 hours ago" },
    { id: "2", title: "Explain blockchain technology", timestamp: "Yesterday" },
    { id: "3", title: "How does AI work?", timestamp: "2 days ago" },
  ];

  return (
    <main
      style={{
        margin: 0,
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          marginLeft: isSidebarOpen ? "300px" : "0",
          transition: "margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Image
          src="/landing.png"
          alt="Landing"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        {/* Dark overlay for chat mode */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: isChatMode ? "blur(8px)" : "blur(0px)",
            opacity: isChatMode ? 1 : 0,
            transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            pointerEvents: isChatMode ? "auto" : "none",
          }}
        />

        {/* Menu Button - Always Visible */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{
            position: "fixed",
            top: "1.5rem",
            left: "1.5rem",
            zIndex: 50,
            width: "3rem",
            height: "3rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow:
              "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
            color: "#fff",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
            e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.15)";
          }}
        >
          <MenuIcon
            ref={menuIconRef}
            size={24}
            onMouseEnter={() => {}}
            onMouseLeave={() => {}}
          />
        </button>

        {/* Sidebar */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: "300px",
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(20px)",
            borderRight: "1px solid rgba(255, 255, 255, 0.1)",
            transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: 40,
            display: "flex",
            flexDirection: "column",
            boxShadow: isSidebarOpen
              ? "0 0 60px rgba(0, 0, 0, 0.5)"
              : "none",
          }}
        >
          {/* Sidebar Header */}
          <div
            style={{
              padding: "1.5rem",
              paddingTop: "1.5rem",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <button
              onClick={() => {
                setIsChatMode(false);
                setInput("");
                // Focus on input after resetting chat
                setTimeout(() => {
                  inputRef.current?.focus();
                }, 100);
              }}
              style={{
                width: "100%",
                padding: "0.75rem 1.25rem",
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "0.95rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.border =
                  "1px solid rgba(255, 255, 255, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.border =
                  "1px solid rgba(255, 255, 255, 0.15)";
              }}
            >
              + New Chat
            </button>
          </div>

          {/* Previous Chats List */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
            }}
          >
            {previousChats.map((chat) => (
              <div
                key={chat.id}
                style={{
                  padding: "0.875rem 1rem",
                  marginBottom: "0.5rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.border =
                    "1px solid rgba(255, 255, 255, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.border =
                    "1px solid rgba(255, 255, 255, 0.08)";
                }}
              >
                <div
                  style={{
                    color: "#fff",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    marginBottom: "0.25rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {chat.title}
                </div>
                <div
                  style={{
                    color: "rgba(255, 255, 255, 0.5)",
                    fontSize: "0.75rem",
                  }}
                >
                  {chat.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className={instrumentSerif.className}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            textAlign: "center",
            padding: "22vh 1.5rem 0",
            gap: "0.75rem",
            color: "#fff",
            transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: isChatMode ? "translateY(-100vh)" : "translateY(0)",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 4.25rem)",
              fontWeight: 400,
              lineHeight: 1.1,
              maxWidth: "100%",
              whiteSpace: "nowrap",
            }}
          >
            <em>Private</em> intelligence for <em>private</em> people
          </h1>
          <p
            style={{
              fontSize: "clamp(1.125rem, 2vw, 1.6rem)",
              fontWeight: 400,
              maxWidth: "40rem",
              lineHeight: 1.45,
            }}
          >
            Loyal is built for those who want to ask questions with no
            reprucussions.
          </p>
        </div>

        {/* Input container */}
        <div
          style={{
            position: "absolute",
            bottom: isChatMode ? "0" : "48vh",
            left: "50%",
            transform: "translateX(-50%)",
            width: isChatMode ? "min(920px, 90%)" : "min(600px, 90%)",
            maxHeight: isChatMode ? "100vh" : "auto",
            transition:
              "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: isChatMode ? "2rem 1rem 2rem 2rem" : "0",
          }}
          onClick={(e) => {
            // Focus input when clicking on the container (but not on other elements)
            if (isChatMode && e.target === e.currentTarget) {
              inputRef.current?.focus();
            }
          }}
        >
          {/* Chat messages */}
          {isChatMode && (
              <div
                ref={messagesContainerRef}
                className="chat-messages-container"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  overflowX: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  padding: "2rem 1rem 2rem 0",
                  animation: "fadeIn 0.5s ease-in",
                  position: "relative",
                  maskImage: "linear-gradient(to bottom, transparent 0%, black 1.5rem, black calc(100% - 1.5rem), transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 1.5rem, black calc(100% - 1.5rem), transparent 100%)",
                }}
                onClick={() => {
                  // Focus input when clicking on the message area
                  inputRef.current?.focus();
                }}
              >
              {messages.map((message) => {
                const messageText = message.parts
                  .filter(part => part.type === "text")
                  .map(part => part.text)
                  .join("");

                return (
                  <div
                    key={message.id}
                    style={{
                      position: "relative",
                      padding: "1rem 3rem 1rem 1.5rem",
                      borderRadius: "16px",
                      background:
                        message.role === "user"
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      fontSize: "1rem",
                      lineHeight: 1.5,
                      alignSelf:
                        message.role === "user" ? "flex-end" : "flex-start",
                      maxWidth: "80%",
                      transition: "all 0.2s ease",
                      overflow: "visible",
                      animation: "slideInUp 0.3s ease-out",
                      animationFillMode: "both",
                    }}
                  >
                    {message.parts.map((part, index) =>
                      part.type === "text" ? (
                        <span key={index}>{part.text}</span>
                      ) : null,
                    )}

                    {/* Copy button */}
                    <button
                      onClick={() => handleCopyMessage(message.id, messageText)}
                      style={{
                        position: "absolute",
                        top: "1rem",
                        right: "0.75rem",
                        padding: "0.25rem",
                        background: copiedMessageId === message.id
                          ? "rgba(34, 197, 94, 0.2)"
                          : "transparent",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        color: copiedMessageId === message.id
                          ? "#22c55e"
                          : "rgba(255, 255, 255, 0.5)",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onMouseEnter={(e) => {
                        if (copiedMessageId !== message.id) {
                          e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (copiedMessageId !== message.id) {
                          e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                      title={copiedMessageId === message.id ? "Copied!" : "Copy message"}
                    >
                      <CopyIcon
                        ref={(el) => {
                          if (el) {
                            copyIconRefs.current.set(message.id, el);
                          }
                        }}
                        size={18}
                      />
                    </button>

                    {/* Copied feedback text */}
                    {copiedMessageId === message.id && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-0.5rem",
                          right: "0.125rem",
                          fontSize: "0.65rem",
                          color: "#fff",
                          background: "rgba(34, 197, 94, 0.9)",
                          padding: "0.125rem 0.375rem",
                          borderRadius: "4px",
                          animation: "fadeInDownSimple 0.2s ease-in",
                          fontWeight: 500,
                          letterSpacing: "0.025em",
                          whiteSpace: "nowrap",
                          pointerEvents: "none",
                          zIndex: 10,
                        }}
                      >
                        Copied
                      </span>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} style={{ height: "1rem" }} />
            </div>
          )}

          {/* Input form - liquid glass style */}
          <form
            onSubmit={handleSubmit}
            style={{
              position: "relative",
              width: "100%",
              display: "flex",
              gap: "0.75rem",
              marginTop: "0.5rem",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-resize textarea
                if (inputRef.current) {
                  inputRef.current.style.height = 'auto';
                  inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
                }
              }}
              disabled={status !== "ready"}
              placeholder="Ask me anything..."
              autoFocus
              tabIndex={0}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              style={{
                flex: 1,
                padding: "1.25rem 1.75rem",
                fontSize: "1rem",
                color: "#fff",
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "20px",
                outline: "none",
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow:
                  "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
                resize: "none",
                fontFamily: "inherit",
                lineHeight: "1.5",
                overflowX: "hidden",
                overflowY: "auto",
                minHeight: "auto",
                maxHeight: "200px",
              }}
              onFocus={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.12)";
                e.target.style.border = "1px solid rgba(255, 255, 255, 0.25)";
              }}
              onBlur={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.08)";
                e.target.style.border = "1px solid rgba(255, 255, 255, 0.15)";
              }}
            />
            <button
              type="submit"
              disabled={status !== "ready" || !input.trim()}
              style={{
                padding: "0",
                width: "auto",
                aspectRatio: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                background:
                  status !== "ready" || !input.trim()
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "20px",
                cursor:
                  status !== "ready" || !input.trim()
                    ? "not-allowed"
                    : "pointer",
                outline: "none",
                transition: "all 0.3s ease",
                boxShadow:
                  "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
                opacity: status !== "ready" || !input.trim() ? 0.5 : 1,
                alignSelf: "stretch",
                minWidth: "60px",
              }}
              onMouseEnter={(e) => {
                if (status === "ready" && input.trim()) {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.25)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 40px 0 rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.15)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px rgba(255, 255, 255, 0.1)";
              }}
            >
              <CircleChevronRightIcon
                size={32}
                style={{
                  animation: (status === "streaming" || status === "submitted")
                    ? "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite"
                    : "none"
                }}
              />
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDownSimple {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        input::placeholder,
        textarea::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        /* Hide scrollbar for textarea */
        textarea::-webkit-scrollbar {
          display: none;
        }
        textarea {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }

        /* Custom scrollbar for chat messages */
        .chat-messages-container::-webkit-scrollbar {
          width: 8px;
        }

        .chat-messages-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          margin: 10px 0;
        }

        .chat-messages-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .chat-messages-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Firefox custom scrollbar */
        .chat-messages-container {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </main>
  );
}
