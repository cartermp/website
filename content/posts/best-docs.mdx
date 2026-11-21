---
title: The best docs are the docs you don't need
description: My opinion on the intersection of docs, developer tool ergonomics, and building things deliberately.
date: "2024-01-14"
tags: product-management, devex
---

If a developer product is self-consistent and intuitive, it can get by with surprisingly little documentation.

Some (perhaps obvious) examples come to mind:

- RESTful conventions in a web API
- Common flags and verbs in a command-line app (e.g., `-v` controls verbosity)
- Descriptive error messages with unique error codes
- Objectives developers have (e.g., get shopping cart data) have a single command or gesture
- But it can get much deeper than this:

Source compatability – specifically, not changing requirements around inputs or handling of outputs – is a feature that pays dividends in the long run. If a developer has some old code in their codebase that uses your API, and that code still works today, then the developer doesn’t have to go read docs on how to use your API. They can just copy-paste and move on. In contrast, making incompatible changes over time greatly increases the cost of using your API, especially if you maintain different versions of it. For example, a v1 and v2 of an API means that a developer needs to keep multiple different ways to interact with things in their head.

The right defaults for a given operation can eliminate the need to read documentation for most cases. For example, consider a tool that has a verb called “publish” or something indicating that an artifact for general consumption gets built by running that command. If the default behavior is to package everything up and spend a little up-front time to optimize the package/bundle for general consumption, then developers can associate building a release artifact with a single verb. In contrast, if a default is not right, or there are options that are required in practice, the tool doesn’t have a good developer experience and necessitates documentation or Q&A to understand it. Consider the dotnet publish command defaulting to debug builds, or how tar requires you to pass in at least two options (`-xf`) to unzip an archive. Both are examples where you can’t simply use a command, but need to remember or look up behavior about the commands to use them correctly or even at all.

Intuitive key commands let developers quickly describe how you perform an operation in a tool with their peers and without abstract terminology like “find and click the button with the weird doohickey on it”. For example, the `ctrl+k`/`cmd+k` chord commonly maps to a search function in a tool, especially if it’s web-based. Using this key command to invoke that functionality lets people familiar with other tools bring up search functionality without looking up how to do it, and provides an easy way for them to tell their peers how to do the same. The need to document where in the UI the search button is, what it looks like, keep screenshots up to date over the years, etc. diminishes significantly.

## Take time building things

I think a good way (but not the only way) to achieve a lack of need for docs is:

- Really, truly, deeply understand user scenarios for a tool and **write them all down**
- Design and **write down** expected user inputs and outputs for these scenarios
- Identify all pieces of an experience where you can’t change things without breaking consumers
- Identify things you can add on later without breaking things
- Carefully evaluate the things you can/can’t change before releasing things
- Roll something out as a preview wherein you reserve the right to make breaking changes based on feedback
- Identify everything that does require documentation such as configuration options and non-default switches and plan what the docs and samples for those should look like
- **Don’t jump to release something as GA**

You’ll note that I twice highlighted **writing things down**. That’s because writing is one of the best tools for thought, and anything you’ll want to remember later or communicate to someone else should be written down. That doesn’t mean you need a big fat PRD or RFC to write code, but it does force you to vet your design decisions through pen and paper before you commit to them. It’s surprising how often you’ll realize you’re making something unintuitive and difficult to use if you need to write down how it works and how people use it.

These things are easy to follow in theory, but hard to follow in practice when you’ve got deadlines and users hungry for functionality. But generally speaking, it’s far better to take a little longer to really iron out details than to release with something that needs serious work after the fact. Don’t be afraid to push back against parties who want stuff ASAP. They’ll usually be happier with something complete and a month late than on time but janky as fuck.

Docs are a tax to pay for both parties. Good technical documentation is hard to write an expensive to maintain, so toolmakers are incentivized to write as little as they can get away with. Documentation, no matter how good, is hard to search through and comprehend as an end-user. There are strategies to make it easier for consumers, but it’s a lot easier to not necessitate reading them in the first place.
