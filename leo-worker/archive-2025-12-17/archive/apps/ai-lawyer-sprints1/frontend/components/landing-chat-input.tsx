"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { MessageSquare, Send } from 'lucide-react';
import { useNextAuth } from '@/contexts/nextauth-context';

export function LandingChatInput() {
  const [question, setQuestion] = useState('');
  const router = useRouter();
  const { setPendingQuestion } = useNextAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    // Save question to localStorage and context
    localStorage.setItem('pendingQuestion', question);
    setPendingQuestion(question);
    
    // Redirect to sign up
    router.push('/sign-up');
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Ask Your Legal Question</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Type your tenant rights question below. You'll need to create a free account to get your answer.
        </p>
        <div className="space-y-4">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Example: What are my rights if my landlord refuses to return my security deposit?"
            className="min-h-[100px]"
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {question.length}/500 characters
            </p>
            <Button type="submit" disabled={!question.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Get Answer
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}