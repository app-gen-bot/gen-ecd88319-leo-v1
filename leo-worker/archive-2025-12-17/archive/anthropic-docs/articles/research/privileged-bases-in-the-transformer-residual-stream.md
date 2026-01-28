# Privileged Bases in the Transformer Residual Stream

**Published:** StreamMar 16, 2023
**Source:** https://www.anthropic.com/research/privileged-bases-in-the-transformer-residual-stream

InterpretabilityResearchMar 16, 2023Read Paper
## Abstract

Our mathematical theories of the Transformer architecture suggest that individual coordinates in the residual stream should have no special significance (that is, the basis directions should be in some sense "arbitrary" and no more likely to encode information than random directions). Recent work has shown that this observation is false in practice. We investigate this phenomenon and provisionally conclude that the per-dimension normalizers in the Adam optimizer are to blame for the effect.We explore two other obvious sources of basis dependency in a Transformer: Layer normalization, and finite-precision floating-point calculations. We confidently rule these out as being the source of the observed basis-alignment.

Research

### Project Vend: Can Claude run a small shop? (And why does that matter?)

Jun 27, 2025

Research

### Agentic Misalignment: How LLMs could be insider threats

Jun 20, 2025

Research

### Confidential Inference via Trusted Virtual Machines

Jun 18, 2025