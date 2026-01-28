# Discovering Language Model Behaviors with Model-Written Evaluations

**Published:** EvaluationsDec 19, 2022
**Source:** https://www.anthropic.com/research/discovering-language-model-behaviors-with-model-written-evaluations

AlignmentResearchDec 19, 2022Read Paper
## Abstract

As language models (LMs) scale, they develop many novel behaviors, good and bad, exacerbating the need to evaluate how they behave. Prior work creates evaluations with crowdwork (which is time-consuming and expensive) or existing data sources (which are not always available). Here, we automatically generate evaluations with LMs. We explore approaches with varying amounts of human effort, from instructing LMs to write yes/no questions to making complex Winogender schemas with multiple stages of LM-based generation and filtering. Crowdworkers rate the examples as highly relevant and agree with 90-100% of labels, sometimes more so than corresponding human-written datasets. We generate 154 datasets and discover new cases of inverse scaling where LMs get worse with size. Larger LMs repeat back a dialog user's preferred answer ("sycophancy") and express greater desire to pursue concerning goals like resource acquisition and goal preservation. We also find some of the first examples of inverse scaling in RL from Human Feedback (RLHF), where more RLHF makes LMs worse. For example, RLHF makes LMs express stronger political views (on gun rights and immigration) and a greater desire to avoid shut down. Overall, LM-written evaluations are high-quality and let us quickly discover many novel LM behaviors.

Research

### Project Vend: Can Claude run a small shop? (And why does that matter?)

Jun 27, 2025

Research

### Agentic Misalignment: How LLMs could be insider threats

Jun 20, 2025

Research

### Confidential Inference via Trusted Virtual Machines

Jun 18, 2025