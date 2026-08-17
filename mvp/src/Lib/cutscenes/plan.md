# Cutscene System Plan

## Vision

The Cutscene System is a generic, data-driven library for ExcaliburJS that orchestrates gameplay, actors, cameras, dialogue, audio, and
scene state through JSON-defined cutscenes.

The system should leverage Excalibur's existing Action system wherever possible rather than replacing it.

The goal is to provide a reusable library that can be dropped into any Excalibur project while remaining easily extensible through
custom commands.

---

# Design Goals

- Fully data-driven JSON format
- Generic Excalibur library
- No game-specific logic
- Extensible command system
- Uses Excalibur Actions whenever possible
- Scene-wide orchestration
- ECS friendly
- Async execution model
- Easy editor integration
- Deterministic execution
- Unit testable

---

# Philosophy

The Cutscene System is **not** an animation system.

The Cutscene System is **not** a timeline editor.

The Cutscene System is a **director**.

Its responsibility is to orchestrate multiple engine systems in a predictable sequence.

Examples:

- Move actors
- Play animations
- Follow paths
- Start dialogue
- Wait for dialogue
- Pause gameplay
- Pan cameras
- Zoom cameras
- Shake cameras
- Spawn actors
- Remove actors
- Play sounds
- Trigger custom game logic

---

# High-Level Architecture

```
Scene
│
├── CutsceneDirector (Actor)
│      │
│      ├── CutsceneRunner
│      ├── Action Queue
│      ├── Execution State
│      └── Current Cutscene
│
└── CutsceneSystem (ECS System)
       │
       ├── Query<CutsceneParticipantComponent>
       ├── Scene
       ├── Camera
       ├── Audio Manager
       ├── Dialogue System
       └── Other engine services
```

---

# Responsibilities

## CutsceneDirector

Owns:

- Current cutscene
- Execution state
- Play
- Pause
- Resume
- Stop
- Skip
- Action queue

The Director is never rendered.

It exists only to execute cutscenes.

---

## CutsceneSystem

Owns access to the game world.

Provides:

- ECS queries
- Participant resolution
- Scene access
- Camera access
- Audio access
- Dialogue access
- Other engine services

The runner should never manually search the scene.

---

# ECS Participation

Actors participate in cutscenes by adding a component.

Example:

```ts
new CutsceneParticipantComponent({
  id: "hero",
});
```

The CutsceneSystem owns an ECS Query that automatically tracks all participating entities.

Benefits:

- No manual registration
- Automatic cleanup
- Spawned actors automatically become available
- Destroyed actors automatically disappear
- ECS-native workflow

---

# Participant Resolution

Commands never hold Actor references.

Instead they resolve participants through the CutsceneSystem.

Example JSON:

```json
{
  "actor": "hero"
}
```

The system resolves the matching entity from its ECS query.

---

# JSON Philosophy

JSON describes **intent**, not implementation.

Example:

```json
{
  "type": "moveActor",
  "actor": "hero",
  "x": 320,
  "y": 128,
  "speed": 120
}
```

The command implementation determines how this maps to Excalibur Actions.

---

# Excalibur Actions

The system should leverage Excalibur Actions whenever possible.

Examples:

- Move
- Rotate
- Scale
- Blink
- Fade
- Delay
- Repeat
- Sequence
- Parallel
- Follow Path

The Cutscene library should not reimplement existing Action behavior.

---

# Custom Commands

The library should expose a command registry.

Example:

```ts
registry.register("raiseBridge", RaiseBridgeCommand);
```

No runner modifications should be required to add commands.

---

# Core Command Categories

## Actor

- Move
- Rotate
- Scale
- Face Direction
- Face Target
- Play Animation
- Follow Path
- Show
- Hide
- Enable
- Disable

---

## Scene

- Pause
- Resume
- Freeze Input
- Restore Input

---

## Camera

- Pan
- Zoom
- Shake
- Follow
- Stop Following
- Fade
- Letterbox

---

## Dialogue

- Start Dialogue
- Wait For Dialogue
- End Dialogue

---

## Audio

- Play Music
- Stop Music
- Fade Music
- Play Sound
- Stop Sound

---

## World

- Spawn Actor
- Remove Actor
- Set Flag
- Clear Flag
- Fire Event

---

## Flow

- Wait
- Wait For Event
- Wait For Flag
- Wait Until

---

# Async Execution

Every command executes asynchronously.

The runner waits until a command completes before executing the next command.

Commands may internally:

- Queue Excalibur Actions
- Await dialogue
- Await camera movement
- Await timers
- Await custom game logic

---

# Parallel Execution

Parallel behavior should use Excalibur's built-in Parallel Action support whenever applicable.

The Cutscene System should not implement its own parallel scheduler.

---

# Runtime Context

Commands receive a shared execution context.

Example:

- Scene
- Camera
- Audio
- Dialogue
- CutsceneSystem
- Resource Manager
- World State

Commands should never access globals.

---

# Save/Load Considerations

Future support:

- Resume cutscene
- Restart cutscene
- Skip completed cutscenes
- Serialize execution state

---

# Future Visual Editor

A separate editor project should support:

- Visual command list
- Import JSON
- Export JSON
- Validation
- Property inspector
- Command palette
- Live preview

The editor should generate only JSON.

It should not contain runtime logic.

---

# Proposed Development Order

## Phase 1

- JSON schema
- Runtime interfaces
- Director
- System
- Participant component

---

## Phase 2

- Loader
- Runner
- Command registry
- Context

---

## Phase 3

Implement core commands:

- Move Actor
- Wait
- Camera
- Dialogue
- Audio
- Spawn

---

## Phase 4

Scene commands

Pause

Resume

Input

---

## Phase 5

Schema validation

Testing

Documentation

---

## Phase 6

Visual editor

---

# Library Goals

The finished library should feel like a natural extension of Excalibur.

It should embrace:

- ECS
- Components
- Systems
- Actions
- Async workflows

rather than replacing them.
