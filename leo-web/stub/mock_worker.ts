#!/usr/bin/env npx tsx
/**
 * WSI Stub - Fake leo-worker CLIENT for rapid leo-web development
 *
 * Speaks WSI Protocol v2.1 as a CLIENT (just like real leo-worker).
 * Connects to leo-web's WSI server and sends fake generation responses.
 * Enables rapid iteration on leo-web without waiting for real generation.
 *
 * PROTOCOL SOURCE OF TRUTH: Python leo-container (app-factory/leo-container/src/runtime/wsi/protocol.py)
 *
 * Key message formats (from Python, NOT the TypeScript interfaces in leo-web):
 *
 * decision_prompt (worker → server):
 *   - id: string           (correlation ID)
 *   - prompt: string       (the question to ask user)
 *   - suggested_task: string (suggested next task)
 *   - allow_editor: boolean (allow custom input)
 *   - iteration: number
 *   - max_iterations: number
 *   - options: string[]    (e.g., ["yes", "add", "redirect", "done"])
 *
 * decision_response (server → worker):
 *   - id: string           (matches decision_prompt.id)
 *   - choice: string       ("yes", "add", "redirect", "done", or custom)
 *   - input: string        (optional additional input)
 *
 * NOTE: leo-web TypeScript currently uses WRONG field names (prompt_id, question, response).
 * This stub uses the CORRECT Python protocol. leo-web needs to be fixed to match.
 *
 * Architecture:
 *     leo-web (WSI Server) <--- wsi-stub (this client) connects to it
 *
 * Usage:
 *     # Process mode (how leo-web launches it via ProcessContainerManager):
 *     WS_URL=ws://localhost:5013/wsi npx tsx stub/mock_worker.ts
 *
 *     # With options:
 *     WS_URL=ws://localhost:5013/wsi STUB_DELAY=0.1 npx tsx stub/mock_worker.ts
 */

import WebSocket from 'ws';

// ============================================================================
// TYPES
// ============================================================================

interface WSIMessage {
  type: string;
  [key: string]: unknown;
}

interface PendingDecision {
  decisionId: string;
  appPath: string;
  sessionId: string;
  maxIterations: number;
  currentIteration: number;
}

// ============================================================================
// WSI STUB CLIENT
// ============================================================================

class WSIStubClient {
  private wsUrl: string;
  private iterationDelay: number;
  private verbose: boolean;

  private websocket: WebSocket | null = null;
  private connected = false;
  private running = true;

  private containerId: string;
  private pendingDecisions: Map<string, PendingDecision> = new Map();

  constructor(wsUrl: string, iterationDelay = 0.5, verbose = true) {
    this.wsUrl = wsUrl;
    this.iterationDelay = iterationDelay;
    this.verbose = verbose;
    this.containerId = `stub-${this.generateId()}`;
  }

  private log(msg: string): void {
    if (this.verbose) {
      const ts = new Date().toISOString().substring(11, 19);
      console.log(`[${ts}] ${msg}`);
    }
  }

  private generateId(prefix = '', length = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let rand = '';
    for (let i = 0; i < length; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix ? `${prefix}${rand}` : rand;
  }

  private sleep(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }

  async connect(): Promise<void> {
    this.log(`Connecting to ${this.wsUrl}...`);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 30000);

      this.websocket = new WebSocket(this.wsUrl);

      this.websocket.on('open', async () => {
        clearTimeout(timeout);
        this.connected = true;
        this.log('Connected successfully');
        await this.sendReady();
        resolve();
      });

      this.websocket.on('error', (err) => {
        clearTimeout(timeout);
        this.log(`ERROR: Connection failed: ${err.message}`);
        reject(err);
      });

      this.websocket.on('close', () => {
        this.connected = false;
        this.log('Connection closed');
      });

      this.websocket.on('message', (data) => {
        this.handleMessage(data.toString());
      });
    });
  }

  private async sendReady(): Promise<void> {
    await this.send({
      type: 'ready',
      container_id: this.containerId,
      workspace: '/workspace',
      generator_mode: 'stub',
    });
    this.log('Sent ready message');
  }

  private async send(msg: WSIMessage): Promise<void> {
    if (!this.websocket || !this.connected) {
      this.log('WARNING: Not connected, cannot send');
      return;
    }

    const msgType = msg.type || 'unknown';
    if (this.verbose) {
      let preview = JSON.stringify(msg);
      if (preview.length > 100) {
        preview = preview.substring(0, 100) + '...';
      }
      this.log(`  -> ${msgType}: ${preview}`);
    }

    this.websocket.send(JSON.stringify(msg));
  }

  private handleMessage(raw: string): void {
    try {
      const msg = JSON.parse(raw) as WSIMessage;
      const msgType = msg.type || 'unknown';
      this.log(`  <- ${msgType}`);

      if (msgType === 'start_generation') {
        this.handleStartGeneration(msg);
      } else if (msgType === 'decision_response') {
        this.handleDecisionResponse(msg);
      } else if (msgType === 'control_command') {
        this.handleControlCommand(msg);
      } else {
        this.log(`  Unknown message type: ${msgType}`);
      }
    } catch (e) {
      this.log(`ERROR: Invalid JSON: ${e}`);
    }
  }

  private async handleStartGeneration(msg: WSIMessage): Promise<void> {
    const prompt = (msg.prompt as string) || 'Create an app';
    const appName = (msg.app_name as string) || 'stub-app';
    const mode = (msg.mode as string) || 'autonomous';
    const maxIterations = (msg.max_iterations as number) || 5;
    let appPath = msg.app_path as string | undefined;
    const resumeSessionId = msg.resume_session_id as string | undefined;

    const isResume = !!appPath || !!resumeSessionId;
    if (!appPath) {
      appPath = `/workspace/${appName}`;
    }

    // For resume, use provided session or generate new
    const sessionId = resumeSessionId || this.generateId('session-');
    // For resume, simulate having completed some iterations already
    const priorIterations = isResume ? 3 : 0;

    this.log(`\n  ${isResume ? 'Resuming' : 'Starting'}: ${appName}`);
    this.log(`  Mode: ${mode}, Max iterations: ${maxIterations}`);
    if (isResume) {
      this.log(`  Prior iterations: ${priorIterations}`);
    }
    this.log(`  Prompt: ${prompt.substring(0, 60)}${prompt.length > 60 ? '...' : ''}`);

    // Send session_loaded
    await this.send({
      type: 'session_loaded',
      session_id: sessionId,
      app_path: appPath,
      resumed: isResume,
      features: isResume ? ['stub feature 1', 'stub feature 2'] : [],
      iterations: priorIterations,
    });

    // Send log message
    await this.send({
      type: 'log',
      line: `[STUB] ${isResume ? 'Resuming' : 'Starting'} generation: ${prompt.substring(0, 50)}...`,
      level: 'info',
    });

    if (mode === 'confirm_first') {
      await this.runConfirmMode(appPath, sessionId, maxIterations, priorIterations);
    } else {
      await this.runAutonomousMode(appPath, sessionId, maxIterations, priorIterations);
    }
  }

  private async runSingleIteration(
    appPath: string,
    sessionId: string,
    iteration: number,
    maxIterations: number
  ): Promise<number> {
    const fakeTasks = [
      'Setting up project structure and dependencies',
      'Creating database schema and models',
      'Implementing authentication system',
      'Building API endpoints',
      'Creating frontend components',
      'Adding styling and responsive design',
      'Implementing business logic',
      'Adding error handling and validation',
      'Writing tests',
      'Final polish and documentation',
    ];

    const task = fakeTasks[(iteration - 1) % fakeTasks.length];

    // Log: iteration starting
    await this.send({
      type: 'log',
      line: `[STUB] Iteration ${iteration}/${maxIterations}: ${task}`,
      level: 'info',
    });

    // Simulate work
    await this.sleep(this.iterationDelay);

    // Progress update
    await this.send({
      type: 'progress',
      iteration,
      total_iterations: maxIterations,
      stage: 'generating',
      step: task,
    });

    // More work
    await this.sleep(this.iterationDelay);

    // Iteration cost
    const iterationCost = Math.round((0.03 + Math.random() * 0.05) * 10000) / 10000;
    const durationMs = Math.floor(this.iterationDelay * 2 * 1000);

    // Iteration complete
    await this.send({
      type: 'iteration_complete',
      iteration,
      app_path: appPath,
      session_id: sessionId,
      session_saved: true,
      duration: durationMs,
      iteration_cost: iterationCost,
    });

    // Log: completed
    await this.send({
      type: 'log',
      line: `[STUB] Completed iteration ${iteration}`,
      level: 'info',
    });

    return iterationCost;
  }

  private async runAutonomousMode(
    appPath: string,
    sessionId: string,
    maxIterations: number,
    startIteration: number = 0
  ): Promise<void> {
    let totalCost = 0;

    // Start from after prior iterations
    for (let i = startIteration + 1; i <= maxIterations; i++) {
      const cost = await this.runSingleIteration(appPath, sessionId, i, maxIterations);
      totalCost += cost;
    }

    // All work complete
    await this.send({
      type: 'all_work_complete',
      completion_reason: 'max_iterations',
      app_path: appPath,
      session_id: sessionId,
      github_url: `https://github.com/app-gen-bot/${appPath.split('/').pop()}`,
      total_iterations: maxIterations,
      total_duration: Math.floor(this.iterationDelay * 2 * maxIterations * 1000),
      total_cost: Math.round(totalCost * 10000) / 10000,
    });
  }

  private async runConfirmMode(
    appPath: string,
    sessionId: string,
    maxIterations: number,
    startIteration: number = 0
  ): Promise<void> {
    const decisionId = this.generateId('decision-');

    this.pendingDecisions.set(decisionId, {
      decisionId,
      appPath,
      sessionId,
      maxIterations,
      currentIteration: startIteration,  // Start from prior iterations
    });

    const isResume = startIteration > 0;
    const nextIteration = startIteration + 1;

    // Use Python protocol field names (source of truth)
    await this.send({
      type: 'decision_prompt',
      id: decisionId,
      prompt: isResume
        ? `Resuming from iteration ${startIteration}. Ready to continue with iteration ${nextIteration}?`
        : 'Ready to start the first iteration?',
      suggested_task: '[STUB] Set up project structure',
      options: ['yes', 'add', 'redirect', 'done'],
      allow_editor: true,
      iteration: nextIteration,
      max_iterations: maxIterations,
    });
  }

  private async handleDecisionResponse(msg: WSIMessage): Promise<void> {
    // Python protocol uses: id, choice, input
    const decisionId = msg.id as string;
    const choice = (msg.choice as string) || 'yes';
    const input = msg.input as string | undefined;

    const pending = this.pendingDecisions.get(decisionId);
    if (!pending) {
      await this.send({
        type: 'error',
        message: `No pending decision for ${decisionId}`,
        error_code: 'INVALID_DECISION',
        fatal: false,
      });
      return;
    }

    this.pendingDecisions.delete(decisionId);
    this.log(`  Decision: choice=${choice}${input ? `, input=${input.substring(0, 40)}...` : ''}`);

    // Handle choice (matches Python client.py _handle_decision_response)
    if (choice === 'done') {
      await this.send({
        type: 'all_work_complete',
        completion_reason: 'user_done',
        app_path: pending.appPath,
        session_id: pending.sessionId,
        total_iterations: pending.currentIteration,
        total_cost: 0,
      });
      return;
    }

    // Log the decision
    await this.send({
      type: 'log',
      line: `[STUB] User choice: ${choice}${input ? ` with input: ${input.substring(0, 30)}...` : ''}`,
      level: 'info',
    });

    // Run one iteration
    pending.currentIteration += 1;
    const cost = await this.runSingleIteration(
      pending.appPath,
      pending.sessionId,
      pending.currentIteration,
      pending.maxIterations
    );

    // Check if more iterations
    if (pending.currentIteration < pending.maxIterations) {
      const newDecisionId = this.generateId('decision-');
      pending.decisionId = newDecisionId;
      this.pendingDecisions.set(newDecisionId, pending);

      // Use Python protocol field names (source of truth)
      await this.send({
        type: 'decision_prompt',
        id: newDecisionId,
        prompt: `Iteration ${pending.currentIteration} complete. Continue with iteration ${pending.currentIteration + 1}?`,
        suggested_task: `[STUB] Continue development - iteration ${pending.currentIteration + 1}`,
        options: ['yes', 'add', 'redirect', 'done'],
        allow_editor: true,
        iteration: pending.currentIteration + 1,
        max_iterations: pending.maxIterations,
      });
    } else {
      await this.send({
        type: 'all_work_complete',
        completion_reason: 'max_iterations',
        app_path: pending.appPath,
        session_id: pending.sessionId,
        total_iterations: pending.currentIteration,
        total_cost: Math.round(cost * pending.currentIteration * 10000) / 10000,
      });
    }
  }

  private async handleControlCommand(msg: WSIMessage): Promise<void> {
    const command = msg.command as string;

    if (command === 'cancel') {
      this.log('  Control: cancel requested');
      await this.send({
        type: 'log',
        line: '[STUB] Cancellation requested',
        level: 'warning',
      });
      await this.send({
        type: 'all_work_complete',
        completion_reason: 'user_cancelled',
        app_path: '/workspace/app',
        total_iterations: 0,
        total_cost: 0,
      });
    } else if (command === 'prepare_shutdown') {
      this.log('  Control: prepare_shutdown requested');
      await this.send({
        type: 'shutdown_ready',
        message: '[STUB] Ready to shutdown',
      });
      this.running = false;
    } else {
      this.log(`  Control: unknown command ${command}`);
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.running = false;
    if (this.websocket) {
      this.websocket.close();
    }
    this.log('Disconnected');
  }

  async run(): Promise<void> {
    try {
      await this.connect();
      // Keep running until signaled to stop
      while (this.running && this.connected) {
        await this.sleep(0.1);
      }
    } catch (e) {
      this.log(`ERROR: ${e}`);
    } finally {
      await this.disconnect();
    }
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  const wsUrl = process.env.WS_URL;
  if (!wsUrl) {
    console.error('ERROR: WS_URL environment variable not set');
    console.error('');
    console.error('Usage:');
    console.error('  WS_URL=ws://localhost:5013/wsi npx tsx stub/mock_worker.ts');
    console.error('');
    console.error('The WS_URL is normally set by leo-web when launching the stub.');
    process.exit(1);
  }

  const delay = parseFloat(process.env.STUB_DELAY || '0.3');
  const quiet = process.env.STUB_QUIET === 'true';

  console.log('='.repeat(60));
  console.log('WSI Stub - Fake leo-worker CLIENT (TypeScript)');
  console.log('='.repeat(60));
  console.log(`  Target: ${wsUrl}`);
  console.log(`  Delay: ${delay}s per step`);
  console.log('');
  console.log('  Connecting to leo-web...');
  console.log('  Press Ctrl+C to stop');
  console.log('='.repeat(60));

  const client = new WSIStubClient(wsUrl, delay, !quiet);
  await client.run();
}

main().catch(console.error);
