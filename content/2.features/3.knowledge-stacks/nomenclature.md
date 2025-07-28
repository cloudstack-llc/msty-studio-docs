---
title: Nomenclature
description: Understand the terminology used in Knowledge Stacks
navTruncate: false
resources:
  videos:
  blogs:
---

## Nomenclature

### Chunks
low, medium, high; number of chunks 

Similarity threshold
- low: 0.1
- medium: 0.3
- high: 0.5
- Highest: 0.7

Chunking method
Recursive character
Sentence

Overlapping (available for Recursive character only)
low: 10
medium: 20
High: 40
Highest: 80

Chunk sizes to ignore
low: 25
medium: 50
high: 100
Highest: 200

sitched

### Load Modes
Static Mode 
Uses the cached version from when the file was added. Fast and predictable, but doesn't reflect recent changes.

Dynamic Mode
Loads the latest file content on each composition. Slightly slower but always up-to-date.


Sync Mode
Watches for file changes and automatically recomposes. Best for small, frequently updated files.


### Search type
Semantic, Keyword, Hybrid

Max Full Content contexts
- low: 1
- medium: 3
- high: 5
- Highest: 7

Synthesize query

PII Scrubbing

::Resources