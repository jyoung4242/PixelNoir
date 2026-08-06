# Detective Mystery Game - Game Design Document

## Working Title

**Detective Mystery**

---

# Vision Statement

A cozy, top-down detective adventure where every mystery is logically constructed, every clue tells the truth, and every playthrough
presents a unique case to solve.

Unlike traditional detective games with fixed narratives, the long-term goal is to create a procedural mystery engine capable of
generating replayable investigations while preserving logical consistency and satisfying deductions.

The player is not becoming stronger through combat.

The player becomes stronger through knowledge.

---

# Design Pillars

## Investigation Over Combat

There are no battles, weapons, or violence.

Conflict is resolved through:

- observation
- conversation
- deduction
- persuasion
- understanding people

The core challenge is uncovering the truth.

---

## Every Clue Is True

The game never lies to the player.

A clue may be:

- relevant
- misleading
- incomplete
- misunderstood
- unrelated

But every clue exists for a logical reason.

The player should be able to look back after solving a case and understand how all pieces fit together.

---

## Knowledge Is Progression

Traditional RPGs use:

- weapons
- armor
- experience
- levels

This game uses:

- facts
- relationships
- discoveries
- deductions

The player's power comes from understanding the world.

---

## Every NPC Has Something To Hide

NPCs are not simply suspects.

Every character has:

- personal history
- relationships
- secrets
- opinions
- fears
- motivations

Some secrets relate to the case.

Many do not.

This creates believable suspects and natural red herrings.

---

## Deduction Is Gameplay

The player should actively reason about the mystery.

The game should reward:

- noticing contradictions
- forming theories
- testing assumptions
- connecting evidence

The player should feel like a detective, not an item collector.

---

## Replayability Through Logic

The long-term goal is not replaying the same story.

The goal is solving a new mystery every time.

The town may remain familiar.

The truth changes.

---

# MVP Scope

The MVP is a handcrafted proof-of-concept.

The purpose is validating:

- exploration
- dialogue
- interrogation
- evidence collection
- deduction gameplay

The MVP is NOT focused on procedural generation.

---

## MVP Features

### World

- Small town environment
- 8-12 NPCs
- Multiple explorable buildings
- Interactive objects
- Basic NPC schedules

---

### Mystery

One complete handcrafted case.

Contains:

- victim
- culprit
- motive
- timeline
- evidence
- witnesses
- false leads

---

### Investigation Systems

- Evidence notebook
- Investigation board
- Dialogue system
- Interrogation system
- Final accusation system

---

# Core Gameplay Loop

Explore

↓

Discover Clues

↓

Interview NPCs

↓

Collect Knowledge

↓

Update Investigation Board

↓

Develop Theory

↓

Interrogate Suspects

↓

Accuse Culprit

↓

Case Resolution

---

# Exploration System

The game uses a top-down 2D adventure structure.

Inspired by classic adventure games.

The player explores:

- streets
- homes
- businesses
- public areas

Environmental clues may include:

- objects
- documents
- footprints
- unusual locations
- environmental changes

---

# NPC System

NPCs are the heart of the game.

Each NPC has:

- identity
- personality
- schedule
- relationships
- knowledge
- secrets

---

## NPC Knowledge Model

NPC information is divided into categories.

### Truths

Things they actually know.

Example:

Saw someone leave the bakery at 9 PM

---

### Lies

Intentional false statements.

Example:

I was home all night

---

### Assumptions

Things they believe are true.

Example:

I think Bob dislikes the victim

---

### Rumors

Information heard from others.

Example:

Someone said the mayor was angry

---

### Secrets

Personal information unrelated to the crime.

Example:

They owe money to the shopkeeper

---

# Interrogation System

Interrogations are structured encounters inspired by RPG battles.

The goal is not to defeat an opponent.

The goal is to break through their resistance and uncover information.

---

# Interrogation Stats

## Suspect Resolve

Represents their willingness to maintain their story.

Resolve

██████████

Reduce resolve through:

- evidence
- contradictions
- observation
- empathy

---

## Detective Composure

Represents the player's control over the conversation.

Poor choices can damage credibility.

Composure

███████░░░

---

# Interrogation Actions

## Question

Ask for information.

---

## Present Evidence

Challenge statements using collected clues.

High reward when correct.

High risk when incorrect.

---

## Observe

Look for behavioral clues.

Examples:

- avoiding eye contact
- nervous gestures
- hesitation

---

## Empathize

Build trust with emotional suspects.

---

## Press

Apply pressure.

Useful against defensive suspects.

Risky if used incorrectly.

---

## Stay Silent

Allow the suspect to reveal information.

---

# Interrogation Events

Potential mechanics:

- quick time events
- timed deductions
- observation moments
- contradiction windows

Example:

"I have never been there."

FLASH:

You remember the footprint.

PRESS BUTTON

"You said you never visited. Then explain this."

---

# Evidence System

Evidence is not automatically meaningful.

The player must interpret it.

Examples:

Broken Window

Possible meanings:

- forced entry
- accident
- unrelated damage

---

# Investigation Board

The player maintains their own theory.

Connections include:

- suspects
- locations
- evidence
- timelines
- motives

Incorrect theories remain until disproven.

---

# Mystery Graph System

## Long-Term Goal

After MVP, replace handcrafted cases with a procedural mystery engine.

Every mystery is represented as a graph.

---

# Mystery Graph Components

Nodes:

- Crime
- Victim
- Culprit
- Motive
- Opportunity
- Timeline
- Location
- Evidence
- Witnesses
- Secrets
- Red Herrings

---

# Procedural Generation Pipeline

Select Crime Template

↓

Generate Victim

↓

Generate Culprit

↓

Generate Motive

↓

Generate Timeline

↓

Generate Evidence

↓

Generate Witness Knowledge

↓

Generate NPC Secrets

↓

Generate Dialogue

↓

Place Clues

---

# Crime Templates

Examples:

## Theft

Requires:

- victim
- stolen object
- motive
- opportunity
- evidence

---

## Missing Person

Requires:

- missing person
- last known location
- witnesses
- false lead
- discovery location

---

## Sabotage

Requires:

- target
- method
- motive
- evidence

---

# Red Herring System

Red herrings are generated from truthful information.

The game does not create fake evidence.

Instead:

- NPC secrets
- unrelated crimes
- misunderstandings
- rumors
- suspicious behavior

create alternate theories.

---

# Red Herring Examples

Blood stain

Truth: Paint from renovation

---

Threatening letter

Truth: Five years old

---

Missing knife

Truth: Cooking club borrowed it

---

# World Graph vs Player Graph

The game maintains two separate graphs.

---

## World Graph

The actual truth.

Hidden from the player.

Example:

Crime

↓

Culprit

↓

Motive

↓

Evidence

↓

Timeline

---

## Player Graph

The detective's current understanding.

Example:

Possible Culprit:

Bob ???

Evidence:

Footprint ???

Timeline:

8 PM ???

The player updates this graph through investigation.

---

# Long-Term Replayability Goals

Each playthrough changes:

- culprit
- motive
- timeline
- evidence
- witness knowledge
- NPC secrets
- red herrings

The player cannot memorize solutions.

They must investigate.

---

# Technical Architecture Goals

Systems should be data-driven.

Major modules:

- Dialogue Engine
- NPC System
- Evidence System
- Investigation Board
- Interrogation Engine
- Mystery Graph
- Procedural Generator
- Save System

---

# Final Design Principle

> The generator may mislead the player, but it should never cheat them.

A satisfying mystery means:

- the clues existed
- the truth was discoverable
- the solution was logical
- the player simply had to connect the dots

The goal is to make players feel like detectives.
