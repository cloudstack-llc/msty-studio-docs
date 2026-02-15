---
title: Knowledge Stacks Next Gen
description: Explore the next generation of Knowledge Stacks in Msty Studio — new source types, smarter retrieval, and a much better experience.
---

Next Gen is a big step forward for Knowledge Stacks. We've added new ways to bring content into your stacks, made retrieval smarter, introduced new chunking option, and polished up the whole experience.

::alert{type="info" icon="tabler:info-circle"}
**Already using classic Knowledge Stacks?** No worries — If you're currently using classic Knowledge Stacks, you can switch to Next Gen directly from the Knowledge Stacks section in Msty Studio. Your existing stacks will continue to work, and you can start creating new Next Gen stacks alongside them. We do recommend making the switch though — once you try it, you probably won't want to go back!
::

---

## What's new?

### More ways to add content to your stack

One of the biggest changes in Next Gen is that you're no longer limited to just files and folders. You can now bring in:

- **Conversation Projects** — Upload entire Msty Studio project folders into your stack. Msty will process and index everything so it's ready for retrieval.

- **Chats** — This one's really handy. You can add past conversations into your stack, so your AI can reference things you've already discussed. Great for building up context over time.

- **Web Links** — Add Webpages to a Knowledge Stack using Jina API key. Found a helpful article or docs page? Just paste the URL and Msty will fetch the content and add it to your stack. No copy-pasting needed.

These join all the existing sources you're already familiar with (files, folders, text, etc.), so you've got a lot of flexibility in how you build your knowledge base.

---

### Rerank Model — get better results from your queries

This is one of those features that sounds simple but makes a big difference.

Here's the idea: when you query your stack, Msty pulls back the most relevant chunks using similarity search. That works well most of the time, but sometimes the results aren't perfectly ordered — a chunk that's *pretty close* might show up above one that's actually a*better fit*.

That's where the **Rerank Model** comes in. It takes those initial results and runs them through a specialized ranking model that **re-scores and reorders** them. The end result? The chunks that actually matter most for your specific question get pushed to the top.

**To turn it on:** Head to your stack's **Query Settings** and pick a Rerank Model from the dropdown. That's it — Msty handles the rest behind the scenes.

---

### File (Single Chunk) — a new way to chunk your content

We've added a new chunking method called **File (Single Chunk)**, and it does exactly what it sounds like — it treats each file or item as one whole chunk instead of splitting it into smaller pieces.

**Why would you want this?**

- Some documents are short enough that breaking them up doesn't make sense (think FAQs, short notes, or individual reference docs).
- Sometimes splitting a file can break important context — if a paragraph only makes sense when you read it together with the rest of the document, keeping it whole is the way to go.
- It gives you more predictable retrieval since the entire file content always comes back as one unit.

**How to use it:** When you're composing your stack, just select **File (Single Chunk)** as your chunking method in the Compose Options.

---

### Knowledge Stack Preset for Local Models

If you're running local models, you might have noticed that the default context window (`num_ctx`) on most local models can be a bit low for Knowledge Stack use cases. When your stack pulls in a bunch of relevant chunks but the model's context window is too small to fit them all, you end up losing valuable context — and your responses suffer.

To fix that, we've implemented **Knowledge Stack preset** specifically designed for local models. When you apply it, the preset automatically bumps `num_ctx` to a higher value (around 20,000 tokens), so your local model has enough room to actually work with all the context your stack provides.

**Why this matters:**

- **Better responses from local models** — More context means the model can see more of your retrieved chunks at once, leading to more informed and complete answers.
- **No manual tweaking needed** — Just apply the preset and you're good to go.
- **Optimized for RAG workflows** — The preset is tuned specifically for Knowledge Stack usage, so it strikes a good balance between context size and performance.

**How to use it:**

When starting a conversation with a Knowledge Stack attached and a local model selected, apply the **Knowledge Stack preset** from the model parameters settings. The context window and relevant parameters will be configured automatically.

---

### Right-Click Context Menu in Tree View

We've added a context menu to the Knowledge Stacks tree view navigation panel, so you can now perform compose actions directly with a right-click — no need to navigate away from where you are.

**Available actions:**

- **Compose** — Kick off composing for a stack or an entire folder
- **Pause Compose** — Temporarily pause an in-progress compose operation
- **Resume Compose** — Pick up right where you left off after pausing
- **Abort Compose** — Cancel an in-progress compose operation entirely
- **Force Compose** — Re-compose from scratch, even if the stack has already been composed

**How it works:**

- **Right-click on an individual stack** — The action applies only to that specific stack.
- **Right-click on a folder** — The action applies to all stacks inside that folder. Msty will show a confirmation dialog letting you know how many stacks will be affected before anything runs, so there are no surprises.

This is one of those workflow improvements that saves you more time than you'd expect. Instead of clicking into each stack individually to manage composing, you can handle it all right from the tree view — including pausing, resuming, and bulk operations across entire folders. If you're managing a workspace with a lot of stacks, you'll definitely feel the difference.

### A cleaner, more polished experience

Beyond the big feature additions, we've also put a lot of work into making the overall experience feel better:

- **Composing is smoother** — Adding sources, tweaking settings, and managing what's in your stack just feels more natural now.
- **It's more adaptive** — The interface responds better to how you actually use it.
- **Visual composing progress** — You can now see the real-time progress of your files and folders as they're being composed.

---

## How to Get Started

Getting up and running with Next Gen is pretty straightforward:

::steps
1. Open **Msty Studio** and navigate to the **Knowledge Stacks** section
2. In the bottom-left corner of the Knowledge Stacks panel, click the dropdown and select **Switch to Next Gen Knowledge Stack**
3. That's it — you're now using the Next Gen version of Knowledge Stacks
4. **Configure your settings** — Choose your preferred chunking method (try File Single Chunk if it fits your use case) and consider enabling a Rerank Model for better retrieval results
5. If you're using a local model, apply the **Knowledge Stack preset** for an optimized context window
6. **Start chatting** — Attach your stack to a conversation and see the difference
::
