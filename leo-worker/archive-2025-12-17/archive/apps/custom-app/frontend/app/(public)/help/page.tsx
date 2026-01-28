"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Heart, Search, MessageSquare, Users, Target, Trophy, Settings, Shield } from "lucide-react"

const helpCategories = [
  {
    icon: Heart,
    title: "Getting Started",
    description: "Learn the basics of LoveyTasks",
    faqs: [
      {
        question: "What is LoveyTasks?",
        answer: "LoveyTasks is a family task management app that transforms mundane chores into expressions of love. When you create a task, our AI transforms it into a loving message that makes family members feel appreciated while getting things done."
      },
      {
        question: "How do I create my first task?",
        answer: "Click the 'New Task' button from your dashboard or tasks page. Enter what needs to be done, select who should do it, and choose a transformation style. Our AI will instantly transform your task into a loving message!"
      },
      {
        question: "What are Love Points?",
        answer: "Love Points are earned by creating tasks, completing them, and spreading positivity in your family. They track your contribution to family harmony and unlock achievements as you reach milestones."
      }
    ]
  },
  {
    icon: MessageSquare,
    title: "Message Transformation",
    description: "Understanding AI message styles",
    faqs: [
      {
        question: "What message styles are available?",
        answer: "We offer 5 styles: Romantic (heart-filled and sweet), Funny (dad jokes and puns), Gen-Z (trendy slang and emojis), Encouraging (motivational and uplifting), and Professional (clear and respectful). You can also choose 'Mix It Up' for variety!"
      },
      {
        question: "Can I customize how messages are transformed?",
        answer: "Yes! Go to Settings > Message Preferences to select your preferred styles, adjust emoji levels, set formality, and even block specific words you don't want to appear in transformed messages."
      },
      {
        question: "What if I don't like a transformation?",
        answer: "You can always click 'Try Another Version' to get a different transformation, or switch to a different style. You can also view the original message at any time."
      }
    ]
  },
  {
    icon: Users,
    title: "Family Management",
    description: "Adding and managing family members",
    faqs: [
      {
        question: "How do I add family members?",
        answer: "Go to the Family page and click 'Invite Members'. You can send email invitations or share your 6-character family code. New members can join using this code during registration."
      },
      {
        question: "What is a family code?",
        answer: "A family code is a unique 6-character code (like ABC-123) that allows family members to join your family group. It expires after 7 days for security, but admins can generate a new one anytime."
      },
      {
        question: "Can I be part of multiple families?",
        answer: "Yes! You can join multiple families (like immediate family and extended family). Use the 'Switch Family' option in your profile menu to move between different family groups."
      }
    ]
  },
  {
    icon: Target,
    title: "Tasks & Assignments",
    description: "Creating and managing tasks",
    faqs: [
      {
        question: "How do task responses work?",
        answer: "When assigned a task, you can: Accept it (with an optional loving message), Negotiate (propose changes), or Decline (with a kind explanation). All responses are transformed to maintain positivity!"
      },
      {
        question: "Can I edit or delete tasks?",
        answer: "Task creators and family admins can edit or delete tasks. Click the three-dot menu on any task or use the Edit button on the task detail page."
      },
      {
        question: "What happens when I complete a task?",
        answer: "You'll see a celebration animation, earn Love Points, and the task creator is notified. You might also unlock achievements for streaks or milestones!"
      }
    ]
  },
  {
    icon: Trophy,
    title: "Achievements & Stats",
    description: "Tracking progress and rewards",
    faqs: [
      {
        question: "How do achievements work?",
        answer: "Achievements are earned by completing tasks, sending love messages, maintaining streaks, and helping family members. Each achievement comes with Love Points and a special badge."
      },
      {
        question: "What is a task streak?",
        answer: "A streak counts consecutive days where you complete at least one task. Longer streaks earn bonus Love Points and special achievements like 'Week Warrior' (7 days) or 'Unstoppable' (30 days)."
      },
      {
        question: "Can I see family statistics?",
        answer: "Yes! The Stats page shows both personal and family statistics, including total Love Score, completion rates, popular message styles, and who's the current family MVP."
      }
    ]
  },
  {
    icon: Settings,
    title: "Settings & Preferences",
    description: "Customizing your experience",
    faqs: [
      {
        question: "How do I change notification settings?",
        answer: "Go to Settings > Notifications to control push and email notifications. You can choose which events to be notified about and set quiet hours when you don't want to be disturbed."
      },
      {
        question: "Can I change my message style preferences?",
        answer: "Yes! Visit Settings > Message Preferences to select your favorite transformation styles, adjust emoji and formality levels, and add words to block from appearing in messages."
      },
      {
        question: "How do I update my profile?",
        answer: "Go to Settings > Profile to update your name, email, bio, timezone, and avatar. Changes are reflected immediately across your family."
      }
    ]
  },
  {
    icon: Shield,
    title: "Privacy & Security",
    description: "Keeping your family safe",
    faqs: [
      {
        question: "Is my family data private?",
        answer: "Absolutely! Family data is completely isolated - no one outside your family can see your tasks, messages, or statistics. We use enterprise-grade encryption to protect your information."
      },
      {
        question: "Can I export my data?",
        answer: "Yes! Go to Settings > Security and click 'Export My Data'. You'll receive an email within 24 hours with all your LoveyTasks data in a downloadable format."
      },
      {
        question: "How do I delete my account?",
        answer: "While we'd hate to see you go, you can delete your account in Settings > Security. This action is permanent and will remove all your data from our servers."
      }
    ]
  }
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredCategories = helpCategories.filter(category => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    return (
      category.title.toLowerCase().includes(query) ||
      category.description.toLowerCase().includes(query) ||
      category.faqs.some(faq => 
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      )
    )
  })

  const filteredFAQs = selectedCategory
    ? filteredCategories.find(c => c.title === selectedCategory)?.faqs || []
    : filteredCategories.flatMap(c => c.faqs)

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">How can we help?</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find answers to common questions about LoveyTasks
          </p>
          
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {!selectedCategory && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {filteredCategories.map((category) => (
              <Card
                key={category.title}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedCategory(category.title)}
              >
                <CardHeader>
                  <category.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {category.faqs.length} articles
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedCategory && (
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setSelectedCategory(null)}
            >
              ← Back to categories
            </Button>
          </div>
        )}

        {(selectedCategory || searchQuery) && (
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedCategory || "Search Results"}
              </CardTitle>
              {selectedCategory && (
                <CardDescription>
                  {filteredCategories.find(c => c.title === selectedCategory)?.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {filteredFAQs.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No results found. Try a different search term.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mt-12 text-center">
          <Card>
            <CardHeader>
              <CardTitle>Still need help?</CardTitle>
              <CardDescription>
                Our support team is here to spread the love and help you out!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </Link>
                <Button variant="outline" asChild>
                  <a href="mailto:support@loveytasks.com">
                    Email us at support@loveytasks.com
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}