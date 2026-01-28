# Advanced AI features

**Source:** https://docs.replit.com/tutorials/advanced-ai-features  
**Section:** tutorials  
**Scraped:** 2025-09-08 20:18:06

---

Vibe Coding & PromptingAdvanced AI featuresCopy pageLearn when and how to use Dynamic Intelligence (Extended Thinking and High Power) and Web Search to maximize Agent’s capabilities for complex builds and accessing current information.Copy page

[Matt PalmerHead of Developer Relations](https://youtube.com/@mattpalmer)

Agent has three advanced features that can significantly improve your development workflow: Extended Thinking, High Power mode, and Web Search. These features work together as part of Dynamic Intelligence to help you tackle complex builds with better results.

Here’s how to use them strategically while managing costs.

## ​What each feature does

Dynamic Intelligence enhances Agent’s reasoning in two ways:

- Extended Thinking - Agent analyzes your request more thoroughly before coding
- High Power mode - Upgrades Agent to Claude Opus for maximum capability

Web Search lets Agent access current information from the internet, overcoming knowledge cutoffs.

## ​When to use what

FeaturePerfect forSkip forCostExtended ThinkingComplex architecture, unfamiliar APIs, edge casesSimple bug fixes, style changes the costHigh Power modeLarge codebases, critical business logic, complex algorithmsBasic features, quick fixes the costWeb SearchLatest packages, current docs, real-time dataWell-known tech, static contentStandard pricing

## ​Extended Thinking

Extended Thinking makes Agent pause and think through your request before jumping into code. It’s great when you need Agent to consider multiple approaches or handle complex requirements.

Try it for:

- Planning app architecture and database design
- Implementing authentication or payment systems
- Building features with lots of edge cases
- Working with APIs you haven’t used before

Example:

Copy

Ask AI

```
Build a web app with user login, a dashboard, and basic user management. Plan how to structure the code for easy maintenance and think about the best data structure for scalability.
```

Skip it for simple requests:

Copy

Ask AI

```
Change the button color from blue to green.
```

## ​High Power mode

High Power upgrades Agent to Claude Opus, Anthropic’s most capable model. It costs about 5× more but handles complex tasks that standard Agent might struggle with.

Reserve it for:

- Analyzing large codebases (500+ files)
- Building complex recommendation engines
- Financial or healthcare apps requiring high accuracy
- Advanced data processing pipelines

The extra cost is usually worth it when precision matters more than speed.

## ​Web Search

Web Search lets Agent research current information while helping you build. It’s particularly valuable for discovering the latest tools and best practices.

Use it when you need:

- The newest React animation libraries
- Current API documentation
- Latest security best practices
- Real-time market data for your app

Example:

Copy

Ask AI

```
Research the best animation libraries for smooth transitions. Implement the most practical one into my application.
```

## ​Combining features

The real power comes from using these features together. For complex projects, try combining all three:

Copy

Ask AI

```
Help me build an app that pixelates images and allows exporting them to vector graphics. Do research on the best libraries for image canvas manipulation, vectorization, and exporting. Create the app in a scalable, maintainable way.
```

Enable: Extended Thinking + High Power + Web Search

This gives you:

1. Web Search finds the best current libraries
1. Extended Thinking plans solid architecture
1. High Power ensures accurate implementation

## ​Smart cost management

- Plan first: Agent’s initial planning is free, so review the approach before implementing
- Be selective: Use Web Search for research, Extended Thinking for complexity, High Power for critical tasks
- Test and learn: Try different combinations to see what works for your workflow
- Monitor value: Compare results with and without features

## ​Common scenarios

Building an MVP?
Web Search + Extended Thinking gives you current best practices with solid architecture.

Modernizing legacy code?
High Power + Extended Thinking can analyze large codebases and plan migrations effectively.

Learning new tech?
Web Search finds current tutorials while Extended Thinking helps you understand concepts.

Mission-critical system?
Use all three features for research, analysis, and maximum accuracy.

## ​Getting started

1. Pick a moderately complex task in your current project
1. Enable Extended Thinking and see how the analysis differs
1. Try High Power on something that stumped standard Agent
1. Use Web Search when you need current information
1. Experiment with combinations as you get comfortable

Start small, measure the value, and gradually use these features for your most challenging builds.

## ​Learn more

- Dynamic Intelligence - Complete guide to Extended Thinking and High Power
- Web Search - Full documentation on Web Search capabilities
- Agent billing - Pricing and cost management

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/tutorials/how-to-vibe-code)

[Notion-powered websiteLearn how to build a website that uses Notion as a Content Management System (CMS) with Replit Agent.Next](https://docs.replit.com/tutorials/build-a-notion-powered-website)
