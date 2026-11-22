---
title: My favorite F# code I've written
description: The one time I was actually pretty dang clever with this coding thing
date: 2026-03-07
tags: F#
---

Most code I've written isn't particularly special, let alone something to be proud of, but I'm perhaps unreasonably proud of this one.

![Tracking the next parameter](/img/tracking-next-parameter.png)

## Tracking the "next" parameter in a tooltip

The code is what powers which parameter in a tooltip gets bolded.

Basically, when you're calling in F# function, there's (now, after many years!) a tooltip that will pop up and tell you a few things:

* The full signature of the function you're calling
* Any documentation for the function, sourced from XML docs
* Which parameter you're "on"

You can see that last bit manifest in two ways, because there's two different ways that the last bullet point _should_ work:

1. You're actively calling the function and you want the parameter that's "next up"
2. You're cycling back and forth between parameters already-applied to a function and editing them

In other words, the tooltip needs to display the parameter that comes next OR the parameter most relevant to where your cursor is at.

## The code that finds the argument to show

Here's the code that calculates the "correct" argument to display:

```fsharp
(*
    Calculate the argument index for fun and profit! It's a doozy...

    Firstly, we need to use the caret position unlike before.

    If the caret position is exactly in range of an existing argument, pick its index.

    The rest answers the question of, "what is the NEXT index to show?", because
    when you're not cycling through parameters with the caret, you're typing,
    and you want to know what the next argument should be.

    A possibility is you've deleted a parameter and want to enter a new one that
    corresponds to the argument you're "at". We need to find the correct next index.
    This could also correspond to an existing argument application. Buuuuuut that's okay.
    If you want the "used to be 3rd arg, but is now 2nd arg" to remain, when you cycle
    past the "now 2nd arg", it will calculate the 3rd arg as the next argument.

    If none of that applies, then we apply the magic of arithmetic
    to find the next index if we're not at the max defined args for the application.
    Otherwise, we're outa here!
*)
let! argumentIndex =
    let caretTextLinePos = sourceText.Lines.GetLinePosition(caretPosition)
    let caretPos = mkPos (Line.fromZ caretTextLinePos.Line) caretTextLinePos.Character

    let possibleExactIndex =
        curriedArgsInSource
        |> Array.tryFindIndex(fun argRange -> rangeContainsPos argRange caretPos)

    match possibleExactIndex with
    | Some index -> Some index
    | None ->
        let possibleNextIndex =
            curriedArgsInSource
            |> Array.tryFindIndex(fun argRange -> Position.posGeq argRange.Start caretPos)

        match possibleNextIndex with
        | Some index -> Some index
        | None ->
            if numDefinedArgs - numArgsAlreadyAppliedViaPipeline > curriedArgsInSource.Length then
                Some (numDefinedArgs - (numDefinedArgs - curriedArgsInSource.Length))
            else
                None
```

Nothing like the comment being just as long as the code itself.

## Scenario examplanation

There's several things at play here:

* The number of arguments that a function has defined in its signature
* The number of arguments the user has applied _so far_
* The current position of the editor caret in Visual Studio

Consder the following code, where `|` represents an editor caret:

```fsharp
let add2 x y = x + y

add2 | // Tooltip should show 'x' as highlighted when editing code here

add2 1 | // Tooltip should show 'y' as highlighted when editing code here

add2 1 |2 // Tooltip should show 'y' as highlighted

add2 1| 2 // Tooltip should show 'x' as highlighted
```

If the caret is in the range of an existing argument in source that's been applied to the function, it will report that as the argument to bold in the UI. That's pretty straightforward - if you cycle through parameters with your caret, you'd expect to see those parameters highlighted.

Where it gets more interesting is the case when you're editing source code. You may not have applied every parameter to a function yet! So Visual Studio needs to display the _next_ parameter to apply.

In fact, this exact scenario is why the feature is called "Signature Help". Using the signature of a function, it _helps_ you by informing you of the next parameter you're on - its name and its type - so that you can pass the right thing with less guessing. It's a productivity feature!

If you're simply working left-to-right and applying parameters as you go, it's pretty easy to find the next parameter to display in the tooltip. It's just whatever comes next!

But let's say you wanted to apply a different parameter to something you've already applied ... as you cycle through existing parameters with the caret, it will highlight them.

### Re-adding a deleted parameter

But now let's say you delete a parameter you've already applied:

```fsharp
let add2 x y = x + y

add2 | 2 // What should the tooltip display at '|'?
```

Here I've only applied 1 parameter, so from the F# compiler's perspective, I've passed `2` as the parameter to `x`. But that's not what I'm doing! I deleted my `x` parameter and I want to re-type it. Can Visual Studio help me with that?

Yes!

![Tracking the best next parameter](/img/tracking-best-next-parameter.png)

But..how? I just said that as far as the F# compiler is concerned, `2` has been passed as the parameter to `x`.

First, there's no argument at the caret position, so this is all a game of trying to find the right "next" parameter.

Perhaps unintuitively, it's this line of code that gives the answer this time around:

```fsharp
let possibleNextIndex =
    curriedArgsInSource
    |> Array.tryFindIndex(fun argRange -> Position.posGeq argRange.Start caretPos)
```

This says, "try to find the _index_ of the argument already applied whose position in source is greater than or equal to the caret position".

Since there's one other argument at index 0, but it's greater than the caret position, this index is going to actually be the "next" parameter to apply! And it works out.

### Adding the next parameter at the end

So what about this code?

```fsharp
match possibleNextIndex with
| Some index -> Some index
| None ->
    if numDefinedArgs - numArgsAlreadyAppliedViaPipeline > curriedArgsInSource.Length then
        Some (numDefinedArgs - (numDefinedArgs - curriedArgsInSource.Length))
    else
        None
```

This is actually the most common case - when you're applying the next parameter but it's not in between pre-existing parameters:

![Tracking the next parameter](/img/tracking-next-parameter.png)

Using this scenario:

```fsharp
let add2 x y = x + y

add2 1 | // caret should show 'y' here
```

If you plug it in, the code is:

```fsharp
if 2 - 0 > 1 then // true
    Some (2 - (2 - 1)) // index 1 (2nd parameter)
else
    None
```

And thus we get index `1`, the 2nd defined parameter to display in the pipeline.

But! What the fuck is up with that `numArgsAlreadyAppliedViaPipeline` value? This is where it's even more interesting.

### Adding the next parameter in a pipelined function

Consider the following scenario:

```fsharp
[1..10]
|> List.map | // 'map' takes two parameters, but the LAST one is implicitly applied
```

The full signature of `List.map` has two parameters, in order: a function to do the mapping, and the list to apply the mapping to. But the list is already applied via `|>`! Showing it in a tooltip, especially as something that could be highlighted, would be pretty damn confusing. So we chop off that parameter for the purposes of the tooltip entirely!

However, chopping off that tooltip isn't enough. We need to account for the fact that there may already have been a number of previously-defined arguments (1-3 to be exact, matching `|>`, `||>`, and `|||>`). That's done in the code snippet!

```fsharp
match possibleNextIndex with
| Some index -> Some index
| None ->
    if numDefinedArgs - numArgsAlreadyAppliedViaPipeline > curriedArgsInSource.Length then
        Some (numDefinedArgs - (numDefinedArgs - curriedArgsInSource.Length))
    else
        None
```

For the following code:

```fsharp
[1..10]
|> List.map | // 'map' takes two parameters, but the LAST one is implicitly applied
```

Let's plug it in:

```fsharp
if 2 - 1 > 0 then // true
    Some (2 - (2 - 0)) // 0 - the first argument
else
    None
```

And here we have it, we compute the 1st argument for `List.map`, which is the mapping function - exactly what we wanted.

![Tracking the next pipeline parameter](/img/tracking-next-pipeline-parameter.png)

You can find all my other code crimes for Signature Help [in this file](https://github.com/dotnet/fsharp/blob/main/vsintegration/src/FSharp.Editor/Completion/SignatureHelp.fs).

## What's the point of this post?

Simple: I wrote this code and it makes me smile. It handles several scenarios to deliver the right developer experience, and is detailed enough to cover all the "little things" that make something pleasant. I've written a lot of features for the F# tools in VS, but this is easily my favorite one. And the code that powers it is my favorite F# code that I've written.

I guess another point of this post is that writing **detailed** editor tooling can be really, really fucking hard. There's an enormous amount of time and care poured into even "basic" experiences in editor tooling. If you're using an IDE with stuff like this, you're benefiting from countless hours of hard work. But that work is worth it.

Cheers, and if you're not using F# today, [give it a whirl](https://dotnet.microsoft.com/en-us/learn/fsharp)!