"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Smile, AtSign, Send, Bold, Italic, Link2, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessages } from "@/hooks/use-messages";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
  channelId: string;
}

export function MessageInput({ channelId }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { sendMessage } = useMessages(channelId);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (message.trim() && !isSending) {
      setIsSending(true);
      try {
        await sendMessage(message.trim());
        setMessage("");
      } catch (error) {
        console.error("Failed to send message:", error);
        // In a real app, show an error toast
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      toast({
        title: "File upload",
        description: `Selected: ${file.name} (${(file.size / 1024).toFixed(1)}KB). File upload not implemented in demo.`,
      });
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="px-4 pb-4">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
      />
      <div
        className={cn(
          "bg-[#222529] rounded-lg border transition-colors",
          isFocused ? "border-[#5865f2]" : "border-[#2c2f33]"
        )}
      >
        {/* Formatting toolbar */}
        <div className="flex items-center px-3 py-2 border-b border-[#2c2f33]">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-[#2c2f33]"
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-[#2c2f33]"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-[#2c2f33]"
              title="Link"
            >
              <Link2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-[#2c2f33]"
              title="Code"
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Message input */}
        <div className="relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={`Message #${channelId}`}
            className="min-h-[80px] resize-none border-0 bg-transparent text-white placeholder:text-gray-500 focus:ring-0 pr-12"
            rows={3}
          />
          
          {/* Action buttons */}
          <div className="absolute bottom-2 right-2 flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-[#2c2f33]"
              title="Attach file"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-[#2c2f33]"
              title="Emoji"
            >
              <Smile className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-[#2c2f33]"
              title="Mention"
            >
              <AtSign className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-[#2c2f33]">
          <div className="text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </div>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isSending}
            className="h-8 px-3 bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4 mr-1" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}