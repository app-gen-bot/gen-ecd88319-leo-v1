"""
Connection State Machine for WSI Protocol

Manages connection state transitions and validates state changes according to
WSI Protocol v2.1 specifications.
"""

import logging
from enum import Enum
from typing import Optional, Set

logger = logging.getLogger(__name__)


# ============================================================================
# Connection States
# ============================================================================

class ConnectionState(Enum):
    """
    Connection states for WSI Protocol connections.

    State Flow:
        CONNECTING  READY  ACTIVE  PROMPTING  COMPLETED  DISCONNECTED
                                  
                               ERROR  DISCONNECTED
    """
    CONNECTING = "connecting"       # Initial state, connection being established
    READY = "ready"                 # Sent ready message, awaiting start_generation
    ACTIVE = "active"               # Generation in progress
    PROMPTING = "prompting"         # Awaiting decision_response (interactive modes)
    COMPLETED = "completed"         # All work done, ready for disconnect
    ERROR = "error"                 # Fatal error occurred
    DISCONNECTED = "disconnected"   # Connection closed


# ============================================================================
# State Machine
# ============================================================================

class StateMachine:
    """
    Manages state transitions for a WSI Protocol connection.

    Validates that state transitions follow the protocol specification and
    raises errors on invalid transitions.
    """

    # Valid transitions: current_state -> set of allowed next states
    VALID_TRANSITIONS = {
        ConnectionState.CONNECTING: {
            ConnectionState.READY,
            ConnectionState.ERROR,
            ConnectionState.DISCONNECTED,
        },
        ConnectionState.READY: {
            ConnectionState.ACTIVE,
            ConnectionState.ERROR,
            ConnectionState.DISCONNECTED,
        },
        ConnectionState.ACTIVE: {
            ConnectionState.PROMPTING,  # For interactive/confirm_first modes
            ConnectionState.ACTIVE,     # Stay in active (for autonomous mode iterations)
            ConnectionState.COMPLETED,
            ConnectionState.ERROR,
            ConnectionState.DISCONNECTED,
        },
        ConnectionState.PROMPTING: {
            ConnectionState.ACTIVE,     # After receiving decision_response
            ConnectionState.COMPLETED,  # If user says "done"
            ConnectionState.ERROR,
            ConnectionState.DISCONNECTED,
        },
        ConnectionState.COMPLETED: {
            ConnectionState.READY,      # Can reuse connection for another job
            ConnectionState.DISCONNECTED,
        },
        ConnectionState.ERROR: {
            ConnectionState.DISCONNECTED,
        },
        ConnectionState.DISCONNECTED: set(),  # Terminal state, no transitions
    }

    def __init__(self, initial_state: ConnectionState = ConnectionState.CONNECTING):
        """
        Initialize state machine.

        Args:
            initial_state: Starting state (default: CONNECTING)
        """
        self._state = initial_state
        self._state_history = [initial_state]
        logger.debug(f"State machine initialized: {initial_state.value}")

    @property
    def state(self) -> ConnectionState:
        """Get current state"""
        return self._state

    @property
    def state_history(self) -> list:
        """Get state transition history"""
        return self._state_history.copy()

    def can_transition_to(self, new_state: ConnectionState) -> bool:
        """
        Check if transition to new state is valid.

        Args:
            new_state: Target state

        Returns:
            True if transition is allowed, False otherwise
        """
        return new_state in self.VALID_TRANSITIONS.get(self._state, set())

    def transition_to(self, new_state: ConnectionState, reason: Optional[str] = None) -> None:
        """
        Transition to a new state.

        Args:
            new_state: Target state
            reason: Optional reason for transition (for logging)

        Raises:
            ValueError: If transition is invalid
        """
        if not self.can_transition_to(new_state):
            raise ValueError(
                f"Invalid state transition: {self._state.value}  {new_state.value}. "
                f"Allowed transitions from {self._state.value}: "
                f"{', '.join(s.value for s in self.VALID_TRANSITIONS.get(self._state, set()))}"
            )

        old_state = self._state
        self._state = new_state
        self._state_history.append(new_state)

        log_msg = f"State transition: {old_state.value}  {new_state.value}"
        if reason:
            log_msg += f" ({reason})"
        logger.info(log_msg)

    def is_terminal(self) -> bool:
        """
        Check if current state is terminal (no further transitions possible).

        Returns:
            True if in terminal state (DISCONNECTED)
        """
        return self._state == ConnectionState.DISCONNECTED

    def is_active(self) -> bool:
        """
        Check if connection is in active generation state.

        Returns:
            True if in ACTIVE or PROMPTING state
        """
        return self._state in {ConnectionState.ACTIVE, ConnectionState.PROMPTING}

    def is_ready_for_work(self) -> bool:
        """
        Check if connection is ready to accept start_generation.

        Returns:
            True if in READY state
        """
        return self._state == ConnectionState.READY

    def is_prompting(self) -> bool:
        """
        Check if currently waiting for user decision.

        Returns:
            True if in PROMPTING state
        """
        return self._state == ConnectionState.PROMPTING

    def is_completed(self) -> bool:
        """
        Check if work is completed.

        Returns:
            True if in COMPLETED state
        """
        return self._state == ConnectionState.COMPLETED

    def is_error(self) -> bool:
        """
        Check if in error state.

        Returns:
            True if in ERROR state
        """
        return self._state == ConnectionState.ERROR

    def reset(self) -> None:
        """
        Reset to CONNECTING state (for connection reuse).

        This is useful when reusing a connection for multiple jobs.
        """
        if self._state not in {ConnectionState.COMPLETED, ConnectionState.READY}:
            raise ValueError(
                f"Cannot reset from {self._state.value}. "
                "Reset only allowed from COMPLETED or READY states."
            )

        logger.info(f"Resetting state machine from {self._state.value} to READY")
        self._state = ConnectionState.READY
        self._state_history.append(ConnectionState.READY)

    def __repr__(self) -> str:
        """String representation"""
        return f"<StateMachine state={self._state.value} history_length={len(self._state_history)}>"

    def __str__(self) -> str:
        """Human-readable string"""
        return self._state.value


# ============================================================================
# Convenience Functions
# ============================================================================

def validate_transition(
    current_state: ConnectionState,
    new_state: ConnectionState
) -> bool:
    """
    Validate a state transition without modifying state.

    Args:
        current_state: Current state
        new_state: Target state

    Returns:
        True if transition is valid
    """
    return new_state in StateMachine.VALID_TRANSITIONS.get(current_state, set())


def get_valid_next_states(current_state: ConnectionState) -> Set[ConnectionState]:
    """
    Get set of valid next states from current state.

    Args:
        current_state: Current state

    Returns:
        Set of allowed next states
    """
    return StateMachine.VALID_TRANSITIONS.get(current_state, set())
