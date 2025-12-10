---
title: "AI Observability is Just Application Observability"
description: "AI Observability is just application observability with a few added concerns."
date: "2025-12-8"
tags: ai, llms, observability
---

There's a million AI Observability startups and every existing Observability vendor has some solution they want you to try. Those are all fine and dandy, but I'll offer you a different perspective on how to get started with this shit.

The first and most important thing to do is is recognize what work you're actually doing here.

In my opinion, AI Observability is not particularly special. That's because AI is integrated into an application, usually as an API call. This makes it no different than calling another service in your codebae, or a database, or an auth endpoint, or anything else. You typically have something like this:

1. A trigger that kicks off a workflow or agent
2. A workflow or agent that goes through some number of iterations
3. Some intermediate steps, especially with an agent, perhaps to display something useful to a user
4. Some end condition and a final result or set of results produced during iteration

At the end of the day, this is all just basic stuff you can represent in application traces or logs. You will also need to employ _manual_ or _custom_ instrumentation -- that is, create a Span in your code and add custom attributes to it -- but this is also not that big of a deal for developers to add.

The biggest difference in workflow is that Evals come into play for AI Observability than testing does for Application Observability. This is because Evals are funky tests that operate on data rather than contrived scenarios, and eventually require you to capture some real-world data about your AI feature(s). Most teams aren't clear on how to bootstrap an eval, let alone update it with data from production in a virtuous cycle. But then again, most teams also aren't clear on how to best leverage the data they already have for all kinds of concerns in applications.

That said, it _can_ get more complicated over time:

- If you truly have a high volume of users and log every interaction, your telemetry pipeline will get costly because the sheer amount of data will be large if you capture enough raw inputs and outputs
- Consider using a backend or tool that can shunt off all traces and/or logs to cold storage, easily sample useful ones for hot storage alongside tracing, and be merry
- Don't just throw 100k tokens on a span attribute or log line and expect things to make sense. "Context Engineer" your data!
- Consider not logging the text of every document you yeet into context uncritically (this is really a sign of poor context engineering)
- SLOs, if you can do them, are ultimatley how you should quantify effectiveness of a solution in production
- Incorporating user feedback with other signals in your data isn't easy

But, again, this is really no different from application Observability either. The more subject to constraints, creative usage patterns, and intricate your application is, the harder application Observability gets. So to reiterate: **AI Observability is just Application Observability**.

Now, go instrument some things with OpenTelemetry and be merry!