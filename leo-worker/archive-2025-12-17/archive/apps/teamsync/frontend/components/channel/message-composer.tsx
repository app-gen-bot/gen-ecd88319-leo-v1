import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Send, Paperclip, Smile, AtSign, Bold, Italic, Code, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { wsService } from "@/lib/websocket";

interface MessageComposerProps {
  channelName: string;
  channelId?: string;
  onSend: (content: string, alsoCreateTask?: boolean) => void;
  onAttach?: () => void;
  placeholder?: string;
}

export function MessageComposer({
  channelName,
  channelId,
  onSend,
  onAttach,
  placeholder,
}: MessageComposerProps) {
  const [message, setMessage] = useState("");
  const [alsoCreateTask, setAlsoCreateTask] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle typing indicator
  useEffect(() => {
    if (channelId && message.length > 0 && !isTyping) {
      setIsTyping(true);
      wsService.startTyping(channelId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 3 seconds
    if (channelId && message.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        wsService.stopTyping(channelId);
      }, 3000);
    } else if (channelId && message.length === 0 && isTyping) {
      setIsTyping(false);
      wsService.stopTyping(channelId);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, channelId, isTyping]);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim(), alsoCreateTask);
      setMessage("");
      setAlsoCreateTask(false);
      textareaRef.current?.focus();
      
      // Stop typing indicator
      if (channelId && isTyping) {
        setIsTyping(false);
        wsService.stopTyping(channelId);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertFormatting = (before: string, after: string = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = message.substring(start, end);
    const newText =
      message.substring(0, start) +
      before +
      selectedText +
      after +
      message.substring(end);

    setMessage(newText);
    
    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-2">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder={placeholder || `Message #${channelName}`}
              className="min-h-[80px] pr-12 resize-none"
              rows={3}
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={onAttach}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Attach file</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Formatting toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => insertFormatting("**")}
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bold (Ctrl+B)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => insertFormatting("*")}
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Italic (Ctrl+I)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => insertFormatting("`")}
                    >
                      <Code className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Code</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Link</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="w-px h-5 bg-border mx-1" />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                    >
                      <AtSign className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mention someone</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                    >
                      <Smile className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Emoji</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Also create task checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="create-task"
                checked={alsoCreateTask}
                onCheckedChange={(checked) => setAlsoCreateTask(checked as boolean)}
              />
              <Label
                htmlFor="create-task"
                className="text-sm font-normal cursor-pointer"
              >
                Also create task
              </Label>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={!message.trim()}
          size="icon"
          className="h-[80px] w-12"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">
        Press <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Enter</kbd> to send,{" "}
        <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Shift + Enter</kbd> for new line
      </div>
    </div>
  );
}