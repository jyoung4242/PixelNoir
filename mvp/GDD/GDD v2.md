# Pixel Noir - Game Design Document

## Working Title

**Pixel Noir**

---

# Vision Statement

A cozy, top-down pixel art detective adventure where every mystery is logically constructed, every clue tells the truth, and every
playthrough presents a unique case to solve.

Unlike traditional detective games with fixed narratives, the long-term goal is to create a procedural mystery engine capable of
generating replayable investigations while preserving logical consistency and satisfying deductions.

The player is not becoming stronger through combat.

The player becomes stronger through knowledge, refined investigative skill, and deductive reasoning.

---

# Design Pillars

## Investigation Over Combat

There are no battles, weapons, or violence. Conflict is resolved through observation, conversation, deduction, persuasion, and
understanding people.

## Every Clue Is True

The game never lies. Clues may be misleading, incomplete, or misunderstood, but every piece of evidence exists for a logical reason.

## Knowledge & Skill Evolution As Progression

Progression stems from expanding facts on the Logic Grid and naturally sharpening investigative capabilities through direct action.

## Every NPC Has Something To Hide

Every character has history, secrets, and motives. Some secrets relate to the crime; many serve as natural red herrings.

## Deduction Is Gameplay

The player actively reasons using a dynamic Logic Grid rather than collecting items to trigger automated story events.

## Replayability Through Logic

The long-term goal is solving a new, logically generated mystery every time in a familiar setting.

---

# Core Gameplay Loop

```

Explore Environment & Inspect Clues (Passes Time) │ ▼ Interview / Interrogate NPCs (Passes Time) │ ▼ Unlock Clue Cards & Dynamically
Expand Logic Grid Slots │ ▼ Cross-Reference World Facts vs. NPC Claims (Flag Contradictions) │ ▼ Apply Deductions & Process of
Elimination to Matrix │ ▼ Gated Access Opens via Time / Day-Night Schedule Shift │ ▼ Complete Required Category Row on Logic Grid │ ▼
Execute Accusation / Arrest (Before Case Duration Deadline Expires)

```

---

# Time, Schedule & World Systems

## Time-Budget Economy

Actions consume time from an overall Case Duration deadline (e.g., 72 hours total to solve a case before the trail goes cold). Time
moves forward only when performing active choices:

| Action Category   | Action Executed                                | Time Cost  |
| :---------------- | :--------------------------------------------- | :--------- |
| **Movement**      | Travel between town districts / buildings      | 15 Minutes |
| **Exploration**   | Deep room search / Inspecting object details   | 30 Minutes |
| **Dialogue**      | Casual interview / General questioning         | 30 Minutes |
| **Interrogation** | Structured interrogation / Presenting evidence | 60 Minutes |
| **Resting**       | Intentionally waiting / Skipping time          | Adjustable |

## Day/Night Schedule & Lighting

- **Lighting Engine:** Smoothly transitions ambient light through Dawn, Day, Dusk, and Night.
- **World Gating:** Daytime opens public shops and municipal buildings. Nighttime locks private residences, clears active crime scenes,
  and opens illicit alleyways or hidden meetup spots.
- **NPC Schedules:** NPCs shift locations based on the time of day, changing witness availability.

---

# The Logic Grid System (Deduction & Accusation)

The Logic Grid is the primary visual workspace for tracking facts, making deductions, and executing arrests.

## Progressive Schema Expansion

- **Dynamic Grid:** Grid categories (Suspects, Locations, Crime Scenes, Items, Timelines) start hidden. Discovering facts appends new
  rows and columns (e.g., discovering a kidnapping reveals the unknown _Crime Scene_ category).
- **Attribute Filling:** Slots expand as details are uncovered (_Unknown Male_ $\rightarrow$ _Arthur Vance_ $\rightarrow$ _Alibi
  Unverified_).

## Clue Engine & Matrix Operations

Uncovered facts yield discrete **Clue Cards** applied directly to matrix cells:

- **Direct Affirmation (A = B):** Confirms an intersection **[ ✓ ]**.
- **Direct Negation (A ≠ B):** Eliminates an intersection **[ ✗ ]**.
- **Relational Clues:** Constrains sequences or spatial locations (e.g., "Left before bakery closed").
- **Process of Elimination:** When all options in a row/column except one are marked **[ ✗ ]**, the remaining cell automatically
  resolves to **[ ✓ ]**.

## Accusation Gate

An arrest cannot be made until a primary suspect's horizontal row on the Logic Grid is completely filled with confirmed links across
all required categories (Suspect + Crime Scene + Motive + Means).

---

# Deception & Contradiction System

To preserve the pillar **"Every Clue Is True"** while allowing suspects to lie, the system strictly separates physical facts from
personal claims:

- **World Clues (Absolute Truths):** Forensics, documents, and physical items apply permanent **[ ✓ ]** or **[ ✗ ]** locks to the
  matrix.
- **NPC Claims (Subjective Statements):** Information gained from dialogue enters the Logic Grid as **Unverified [ ? ]**.
  - _Truthful Claim:_ Aligns with the World Graph.
  - _Lies & Alibis:_ Contradicts a World Fact or another suspect's claim, triggering a **[ Conflict Alert ]**.
- **Exposing Deception:** Presenting contradicting evidence shatters the lie, dealing massive **Resolve** damage during interrogations
  and converting the **[ ? ]** cell into a verified truth.

---

# Skill Evolution & Mastery

Using systems organically sharpens the detective's capabilities, unlocking operational efficiencies without abstract level-up grinding:

| Skill Discipline               | Key Progression Perks                                              | Impact on Gameplay                                                                   |
| :----------------------------- | :----------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| **Interrogation & Persuasion** | _Active Listening, Steel Nerve, Pressing Insight_                  | Reduces composure loss, increases resolve damage, highlights pauses.                 |
| **Deception Sensitivity**      | _Micro-Expressions, Inconsistency Detection, Tell ID, Truth Sense_ | Passively flags lies, highlights grid contradictions, and identifies weakness types. |
| **Perception & Field Search**  | _Eagle Eye, Keen Insight, Forensic Efficiency_                     | Passively highlights clues, lowers room search time from 30m to 15m.                 |
| **Navigation & Time**          | _Street Smarts, Schedule Sense, Night Owl_                         | Drops travel time from 15m to 10m, displays NPC schedules 1hr ahead.                 |
| **Deductive Reasoning**        | _Epiphany, Cross-Examination, Hypothesis Testing_                  | Auto-highlights remaining grid options and allows non-destructive theory modeling.   |

---

# Interrogation System

Interrogations are structured encounters focused on breaking down suspect resistance:

- **Suspect Resolve:** Reduced by presenting valid Clue Cards, pointing out contradictions, and using empathy.
- **Detective Composure:** Player's health bar; reduced by presenting false accusations or making poor dialogue choices.
- **Actions:** Question, Present Evidence, Observe, Empathize, Press, and Stay Silent.

---

# MVP Scope

- **Setting:** Small town environment with 8–12 NPCs, basic schedules, and dynamic lighting.
- **Case:** One complete handcrafted case (Kidnapping / Mystery) to validate time management, progressive Logic Grid expansion, clue
  cards, deception mechanics, and skill evolution.
- **Systems:** Interactive Logic Grid matrix, Time-cost tracker, Clue engine, NPC schedules, Interrogation system, and Accusation
  system.

---

# Final Design Principle

> The generator may mislead the player, but it should never cheat them.

A satisfying mystery means the clues existed, the clock was fair, the grid was resolvable through logic, and the player succeeded
through pure deduction.
