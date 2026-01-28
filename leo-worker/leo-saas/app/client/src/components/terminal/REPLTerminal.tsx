/**
 * REPLTerminal Component
 *
 * Read-only terminal display using xterm.js for streaming Leo output.
 * Features:
 * - ANSI color support with dark theme
 * - WSI message rendering
 * - Auto-scroll to bottom as new output arrives
 * - No keyboard input (display-only)
 * - Handles all WSI message types (log, progress, error, decision_prompt, etc.)
 */

import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import type { WSIMessage, LogMessage, ProgressMessage, ErrorMessage, DecisionPromptMessage } from '../../lib/wsi-client';
import '@xterm/xterm/css/xterm.css';

interface REPLTerminalProps {
  messages: WSIMessage[];
  isConnected: boolean;
  containerConnected: boolean;
}

/**
 * ANSI color codes for message formatting
 */
const ANSI = {
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',

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
 * Format WSI message for terminal display
 */
function formatWSIMessage(msg: WSIMessage): string | null {
  switch (msg.type) {
    case 'ready':
      return `${ANSI.FG_BRIGHT_GREEN}${ANSI.BOLD}✓ Container ready${ANSI.RESET}\n${ANSI.FG_BRIGHT_BLACK}  Workspace: ${msg.workspace || 'default'}${ANSI.RESET}`;

    case 'log': {
      const logMsg = msg as LogMessage;
      const line = logMsg.line || '';
      switch (logMsg.level) {
        case 'error':
          return `${ANSI.FG_BRIGHT_RED}${line}${ANSI.RESET}`;
        case 'warn':
          return `${ANSI.FG_BRIGHT_YELLOW}${line}${ANSI.RESET}`;
        case 'debug':
          return `${ANSI.FG_BRIGHT_BLACK}${line}${ANSI.RESET}`;
        default:
          return `${ANSI.FG_WHITE}${line}${ANSI.RESET}`;
      }
    }

    case 'progress': {
      const progMsg = msg as ProgressMessage;
      const parts: string[] = [];
      if (progMsg.stage) parts.push(progMsg.stage);
      if (progMsg.step) parts.push(progMsg.step);
      if (progMsg.percentage !== undefined) parts.push(`${progMsg.percentage}%`);
      if (progMsg.iteration !== undefined && progMsg.total_iterations !== undefined) {
        parts.push(`[${progMsg.iteration}/${progMsg.total_iterations}]`);
      }
      return `${ANSI.FG_BRIGHT_CYAN}[PROGRESS] ${parts.join(' - ')}${ANSI.RESET}`;
    }

    case 'iteration_complete':
      return `${ANSI.FG_BRIGHT_GREEN}✓ Iteration ${msg.iteration} complete${ANSI.RESET}`;

    case 'all_work_complete':
      return `\n${ANSI.FG_BRIGHT_GREEN}${ANSI.BOLD}════════════════════════════════════════${ANSI.RESET}\n` +
        `${ANSI.FG_BRIGHT_GREEN}${ANSI.BOLD}✓ Generation Complete!${ANSI.RESET}\n` +
        `${ANSI.FG_BRIGHT_BLACK}  Reason: ${msg.completion_reason}${ANSI.RESET}\n` +
        `${ANSI.FG_BRIGHT_BLACK}  Total iterations: ${msg.total_iterations}${ANSI.RESET}\n` +
        (msg.github_url ? `${ANSI.FG_BRIGHT_BLUE}  GitHub: ${msg.github_url}${ANSI.RESET}\n` : '') +
        (msg.download_url ? `${ANSI.FG_BRIGHT_BLUE}  Download: ${msg.download_url}${ANSI.RESET}\n` : '') +
        `${ANSI.FG_BRIGHT_GREEN}${ANSI.BOLD}════════════════════════════════════════${ANSI.RESET}`;

    case 'error': {
      const errMsg = msg as ErrorMessage;
      let output = `${ANSI.BOLD}${ANSI.FG_BRIGHT_RED}ERROR: ${errMsg.message}${ANSI.RESET}`;
      if (errMsg.error_code) {
        output += `\n${ANSI.FG_BRIGHT_BLACK}  Code: ${errMsg.error_code}${ANSI.RESET}`;
      }
      if (errMsg.recovery_hint) {
        output += `\n${ANSI.FG_BRIGHT_YELLOW}  Hint: ${errMsg.recovery_hint}${ANSI.RESET}`;
      }
      return output;
    }

    case 'decision_prompt': {
      const promptMsg = msg as DecisionPromptMessage;
      let output = `\n${ANSI.FG_BRIGHT_YELLOW}${ANSI.BOLD}❓ ${promptMsg.question}${ANSI.RESET}`;
      if (promptMsg.options && promptMsg.options.length > 0) {
        output += `\n${ANSI.FG_BRIGHT_BLACK}Options:${ANSI.RESET}`;
        promptMsg.options.forEach((opt, i) => {
          output += `\n  ${ANSI.FG_BRIGHT_CYAN}${i + 1}.${ANSI.RESET} ${opt}`;
        });
      }
      if (promptMsg.allow_custom) {
        output += `\n${ANSI.FG_BRIGHT_BLACK}  (Custom response allowed)${ANSI.RESET}`;
      }
      return output;
    }

    case 'connection_status':
      return `${ANSI.FG_BRIGHT_BLACK}[Status] Browser: ${msg.browser_connected ? '✓' : '✗'} | Container: ${msg.container_connected ? '✓' : '✗'}${ANSI.RESET}`;

    case 'status':
      return `${ANSI.FG_BRIGHT_BLACK}[Status] ${msg.message}${ANSI.RESET}`;

    default:
      // Don't display unknown message types
      return null;
  }
}

/**
 * REPLTerminal Component - Read-only display terminal
 */
export default function REPLTerminal({ messages, isConnected, containerConnected }: REPLTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const lastMessageCount = useRef<number>(0);

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
      fontSize: 14,
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
    terminal.writeln(`${ANSI.FG_BRIGHT_CYAN}${ANSI.BOLD}Leo Console${ANSI.RESET}`);
    terminal.writeln(`${ANSI.FG_BRIGHT_BLACK}WSI Protocol v2.1 - Direct container communication${ANSI.RESET}`);
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

  // Render new messages as they arrive
  useEffect(() => {
    const terminal = terminalInstance.current;
    if (!terminal) return;

    // Only process new messages
    const newMessages = messages.slice(lastMessageCount.current);
    lastMessageCount.current = messages.length;

    newMessages.forEach((msg) => {
      const formatted = formatWSIMessage(msg);
      if (formatted) {
        terminal.writeln(formatted);
        terminal.scrollToBottom();
      }
    });
  }, [messages]);

  // Show connection status changes
  useEffect(() => {
    const terminal = terminalInstance.current;
    if (!terminal) return;

    if (isConnected && !containerConnected) {
      terminal.writeln(`${ANSI.FG_BRIGHT_YELLOW}Waiting for container...${ANSI.RESET}`);
    }
  }, [isConnected, containerConnected]);

  return (
    <div
      ref={terminalRef}
      className="w-full h-full"
      style={{ padding: 0, margin: 0 }}
    />
  );
}
