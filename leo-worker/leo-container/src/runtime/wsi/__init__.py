"""
WSI - WebSocket Interface for Leo App Generator

Implements WSI Protocol v2.1 for remote control of AppGeneratorAgent.
Contains both client and protocol definitions.
"""

__version__ = "2.1.0"

from .protocol import (
    MessageParser,
    MessageSerializer,
    WSIMessage,
    ReadyMessage,
    StartGenerationMessage,
    LogMessage,
    ProgressMessage,
    DecisionPromptMessage,
    DecisionFollowUpMessage,
    DecisionResponseMessage,
    UserInputMessage,
    SessionLoadedMessage,
    SessionSavedMessage,
    SessionClearedMessage,
    ContextDisplayMessage,
    IterationCompleteMessage,
    AllWorkCompleteMessage,
    TaskInterruptedMessage,
    ErrorMessage,
)
from .state_machine import ConnectionState, StateMachine
from .client import WSIClient
from .log_streamer import log_streamer

__all__ = [
    # Protocol
    "MessageParser",
    "MessageSerializer",
    "WSIMessage",
    "ReadyMessage",
    "StartGenerationMessage",
    "LogMessage",
    "ProgressMessage",
    "DecisionPromptMessage",
    "DecisionFollowUpMessage",
    "DecisionResponseMessage",
    "UserInputMessage",
    "SessionLoadedMessage",
    "SessionSavedMessage",
    "SessionClearedMessage",
    "ContextDisplayMessage",
    "IterationCompleteMessage",
    "AllWorkCompleteMessage",
    "TaskInterruptedMessage",
    "ErrorMessage",
    # State Machine
    "ConnectionState",
    "StateMachine",
    # Client
    "WSIClient",
    "log_streamer",
]
