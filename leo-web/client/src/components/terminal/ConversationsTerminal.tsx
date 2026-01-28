/**
 * ConversationsTerminal Component
 *
 * Read-only terminal display using xterm.js for streaming agent conversation logs.
 * Shows agent reasoning, tool uses, prompts, and responses.
 */

import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import type { ConversationLogMessage } from '../../lib/wsi-client';
import { TERMINAL_CONFIG } from '../../config/terminal';
import '@xterm/xterm/css/xterm.css';

interface ToolUse {
  name: string;
  input: unknown;
}

interface ConversationsTerminalProps {
  conversationLogs: ConversationLogMessage[];
}

/**
 * ANSI color codes for message formatting
 */
const ANSI = {
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
  ITALIC: '\x1b[3m',

  // Foreground colors
  FG_BLACK: '\x1b[30m',
  FG_RED: '\x1b[31m',
  FG_GREEN: '\x1b[32m',
  FG_YELLOW: '\x1b[33m',
  FG_BLUE: '\x1b[34m',
  FG_MAGENTA: '\x1b[35m',
  FG_CYAN: '\x1b[36m',
  FG_WHITE: '\x1b[37m',
  FG_BRIGHT_BLACK: '\x1b[90m',
  FG_BRIGHT_RED: '\x1b[91m',
  FG_BRIGHT_GREEN: '\x1b[92m',
  FG_BRIGHT_YELLOW: '\x1b[93m',
  FG_BRIGHT_BLUE: '\x1b[94m',
  FG_BRIGHT_MAGENTA: '\x1b[95m',
  FG_BRIGHT_CYAN: '\x1b[96m',
  FG_BRIGHT_WHITE: '\x1b[97m',
};

/**
 * Format conversation log entry for terminal display
 */
function formatConversationLog(log: ConversationLogMessage): string[] {
  const lines: string[] = [];
  const timestamp = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '';
  const agentName = log.agent || 'Unknown Agent';

  switch (log.entry_type) {
    case 'user_prompt':
      lines.push(`${ANSI.FG_BRIGHT_CYAN}${ANSI.BOLD}═══════════════════════════════════════${ANSI.RESET}`);
      lines.push(`${ANSI.FG_BRIGHT_CYAN}${ANSI.BOLD}📝 USER PROMPT${ANSI.RESET} ${ANSI.FG_BRIGHT_BLACK}[${agentName}] ${timestamp}${ANSI.RESET}`);
      lines.push(`${ANSI.FG_BRIGHT_CYAN}═══════════════════════════════════════${ANSI.RESET}`);
      if (log.content) {
        lines.push(`${ANSI.FG_WHITE}${log.content}${ANSI.RESET}`);
      }
      lines.push('');
      break;

    case 'assistant_message':
      lines.push(`${ANSI.FG_BRIGHT_MAGENTA}${ANSI.BOLD}───────────────────────────────────────${ANSI.RESET}`);
      lines.push(`${ANSI.FG_BRIGHT_MAGENTA}${ANSI.BOLD}🤖 ASSISTANT${ANSI.RESET} ${ANSI.FG_BRIGHT_BLACK}[${agentName}] Turn ${log.turn || '?'} ${timestamp}${ANSI.RESET}`);
      lines.push(`${ANSI.FG_BRIGHT_MAGENTA}───────────────────────────────────────${ANSI.RESET}`);

      // Show thinking blocks
      if (log.thinking_blocks && log.thinking_blocks.length > 0) {
        lines.push(`${ANSI.FG_BRIGHT_YELLOW}${ANSI.DIM}💭 Thinking:${ANSI.RESET}`);
        log.thinking_blocks.forEach((block) => {
          // Truncate long thinking blocks
          const truncated = block.length > TERMINAL_CONFIG.THINKING_BLOCK_TRUNCATE ? block.slice(0, TERMINAL_CONFIG.THINKING_BLOCK_TRUNCATE) + '...' : block;
          lines.push(`${ANSI.FG_BRIGHT_BLACK}${ANSI.DIM}   ${truncated.replace(/\n/g, '\n   ')}${ANSI.RESET}`);
        });
      }

      // Show text blocks
      if (log.text_blocks && log.text_blocks.length > 0) {
        lines.push(`${ANSI.FG_BRIGHT_GREEN}📄 Response:${ANSI.RESET}`);
        log.text_blocks.forEach((block) => {
          lines.push(`${ANSI.FG_WHITE}   ${block.replace(/\n/g, '\n   ')}${ANSI.RESET}`);
        });
      }

      // Show tool uses
      if (log.tool_uses && log.tool_uses.length > 0) {
        lines.push(`${ANSI.FG_BRIGHT_BLUE}🔧 Tool Uses:${ANSI.RESET}`);
        log.tool_uses.forEach((tool) => {
          lines.push(`${ANSI.FG_BRIGHT_CYAN}   → ${tool.name}${ANSI.RESET}`);
          // Truncate long tool inputs
          const inputStr = JSON.stringify(tool.input);
          if (inputStr.length > TERMINAL_CONFIG.TOOL_INPUT_TRUNCATE) {
            lines.push(`${ANSI.FG_BRIGHT_BLACK}     ${inputStr.slice(0, TERMINAL_CONFIG.TOOL_INPUT_TRUNCATE)}...${ANSI.RESET}`);
          } else {
            lines.push(`${ANSI.FG_BRIGHT_BLACK}     ${inputStr}${ANSI.RESET}`);
          }
        });
      }
      lines.push('');
      break;

    case 'result':
      lines.push(`${ANSI.FG_BRIGHT_GREEN}${ANSI.BOLD}═══════════════════════════════════════${ANSI.RESET}`);
      lines.push(`${log.success ? ANSI.FG_BRIGHT_GREEN : ANSI.FG_BRIGHT_RED}${ANSI.BOLD}✓ RESULT${ANSI.RESET} ${ANSI.FG_BRIGHT_BLACK}[${agentName}] ${timestamp}${ANSI.RESET}`);
      lines.push(`${ANSI.FG_BRIGHT_GREEN}═══════════════════════════════════════${ANSI.RESET}`);
      lines.push(`${ANSI.FG_WHITE}   Success: ${log.success ? '✅ Yes' : '❌ No'}${ANSI.RESET}`);
      if (log.termination_reason) {
        lines.push(`${ANSI.FG_WHITE}   Reason: ${log.termination_reason}${ANSI.RESET}`);
      }
      if (log.cost_usd !== undefined) {
        lines.push(`${ANSI.FG_WHITE}   Cost: $${log.cost_usd.toFixed(4)}${ANSI.RESET}`);
      }
      if (log.duration_ms !== undefined) {
        lines.push(`${ANSI.FG_WHITE}   Duration: ${(log.duration_ms / 1000).toFixed(1)}s${ANSI.RESET}`);
      }
      if (log.input_tokens !== undefined || log.output_tokens !== undefined) {
        lines.push(`${ANSI.FG_WHITE}   Tokens: ${log.input_tokens?.toLocaleString() || 0} in / ${log.output_tokens?.toLocaleString() || 0} out${ANSI.RESET}`);
      }
      lines.push('');
      break;

    case 'error':
      lines.push(`${ANSI.FG_BRIGHT_RED}${ANSI.BOLD}═══════════════════════════════════════${ANSI.RESET}`);
      lines.push(`${ANSI.FG_BRIGHT_RED}${ANSI.BOLD}❌ ERROR${ANSI.RESET} ${ANSI.FG_BRIGHT_BLACK}[${agentName}] ${timestamp}${ANSI.RESET}`);
      lines.push(`${ANSI.FG_BRIGHT_RED}═══════════════════════════════════════${ANSI.RESET}`);
      if (log.error_type) {
        lines.push(`${ANSI.FG_BRIGHT_RED}   Type: ${log.error_type}${ANSI.RESET}`);
      }
      if (log.error_message) {
        lines.push(`${ANSI.FG_BRIGHT_RED}   Message: ${log.error_message}${ANSI.RESET}`);
      }
      lines.push('');
      break;

    case 'system':
      const levelColor = log.level === 'ERROR' ? ANSI.FG_BRIGHT_RED
        : log.level === 'WARNING' ? ANSI.FG_BRIGHT_YELLOW
        : ANSI.FG_BRIGHT_BLACK;
      lines.push(`${levelColor}[${log.level}] ${log.message || ''}${ANSI.RESET}`);
      break;

    default:
      lines.push(`${ANSI.FG_BRIGHT_BLACK}[${log.entry_type}] ${JSON.stringify(log)}${ANSI.RESET}`);
  }

  return lines;
}

/**
 * ConversationsTerminal Component - Read-only display for agent conversations
 */
export default function ConversationsTerminal({ conversationLogs }: ConversationsTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const lastLogCount = useRef<number>(0);

  // State for expandable tool details panel
  const [showDetails, setShowDetails] = useState(false);
  const [recentToolUses, setRecentToolUses] = useState<ToolUse[]>([]);

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current) return;

    // Create terminal instance with read-only configuration
    const terminal = new Terminal({
      theme: {
        background: '#09090b',
        foreground: '#fafafa',
        cursor: '#fbbf24',
        black: '#000000',
        red: '#ef4444',
        green: '#10b981',
        yellow: '#f59e0b',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#fafafa',
        brightBlack: '#52525b',
        brightRed: '#f87171',
        brightGreen: '#34d399',
        brightYellow: '#fbbf24',
        brightBlue: '#60a5fa',
        brightMagenta: '#c084fc',
        brightCyan: '#22d3ee',
        brightWhite: '#ffffff',
      },
      fontFamily: 'JetBrains Mono, Consolas, monospace',
      fontSize: 13,
      fontWeight: '400',
      fontWeightBold: '700',
      cursorBlink: false,
      cursorStyle: 'block',
      scrollback: 10000,
      allowProposedApi: true,
      disableStdin: true,
    });

    // Create and load fit addon
    const fit = new FitAddon();
    fitAddon.current = fit;
    terminal.loadAddon(fit);

    // Open terminal
    terminal.open(terminalRef.current);
    try {
      fit.fit();
    } catch (e) {
      console.warn('Xterm fit addon error:', e);
    }

    terminalInstance.current = terminal;

    // Welcome message
    terminal.writeln(`${ANSI.FG_BRIGHT_MAGENTA}${ANSI.BOLD}Agent Conversations${ANSI.RESET}`);
    terminal.writeln(`${ANSI.FG_BRIGHT_BLACK}Real-time agent reasoning, tool use, and responses${ANSI.RESET}`);
    terminal.writeln('');

    // Handle window resize
    const handleResize = () => {
      try {
        fit.fit();
      } catch (e) {
        console.warn('Xterm fit addon error:', e);
      }
    };
    window.addEventListener('resize', handleResize);

    // Add ResizeObserver for container size changes
    const resizeObserver = new ResizeObserver(() => {
      try {
        fit.fit();
      } catch (e) {
        console.warn('Xterm fit addon error:', e);
      }
    });
    if (terminalRef.current?.parentElement) {
      resizeObserver.observe(terminalRef.current.parentElement);
    }

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      terminal.dispose();
    };
  }, []);

  // Render new conversation logs as they arrive
  useEffect(() => {
    const terminal = terminalInstance.current;
    if (!terminal) return;

    // Only process new logs
    const newLogs = conversationLogs.slice(lastLogCount.current);
    lastLogCount.current = conversationLogs.length;

    newLogs.forEach((log) => {
      const lines = formatConversationLog(log);
      lines.forEach((line) => {
        terminal.writeln(line);
      });
      terminal.scrollToBottom();
    });
  }, [conversationLogs]);

  // Extract tool uses from conversation logs for the details panel
  useEffect(() => {
    const allToolUses: ToolUse[] = [];
    // Get tool uses from the most recent assistant messages (last 10)
    const recentLogs = conversationLogs.slice(-10);
    recentLogs.forEach((log) => {
      if (log.entry_type === 'assistant_message' && log.tool_uses) {
        log.tool_uses.forEach((tool) => {
          allToolUses.push({ name: tool.name, input: tool.input });
        });
      }
    });
    // Keep only the most recent 20 tool uses
    setRecentToolUses(allToolUses.slice(-20));
  }, [conversationLogs]);

  return (
    <div className="flex flex-col h-full">
      {/* Terminal display */}
      <div
        ref={terminalRef}
        className="flex-1 min-h-0"
        style={{ padding: 0, margin: 0 }}
      />

      {/* Expandable tool details panel */}
      {recentToolUses.length > 0 && (
        <div className="border-t border-zinc-800 bg-zinc-950">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-3 py-2 text-left text-sm text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300 transition-colors flex items-center gap-2"
          >
            <span className="text-xs">{showDetails ? '▼' : '▶'}</span>
            <span>Tool Details ({recentToolUses.length} recent)</span>
          </button>
          {showDetails && (
            <div className="px-3 pb-3 max-h-64 overflow-auto">
              {recentToolUses.map((tool, i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="text-cyan-400 font-mono text-sm mb-1">
                    → {tool.name}
                  </div>
                  <pre className="text-xs text-zinc-400 bg-zinc-900 p-2 rounded overflow-x-auto whitespace-pre-wrap font-mono">
                    {JSON.stringify(tool.input, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
