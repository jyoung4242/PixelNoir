# Details

Date : 2026-08-12 00:34:25

Directory c:\\programming\\PixelNoir\\mvp\\src

Total : 47 files,  4390 codes, 353 comments, 778 blanks, all 5521 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [mvp/src/Actions/FollowPath.ts](/mvp/src/Actions/FollowPath.ts) | TypeScript | 114 | 3 | 29 | 146 |
| [mvp/src/Actions/MoveActor.ts](/mvp/src/Actions/MoveActor.ts) | TypeScript | 97 | 9 | 21 | 127 |
| [mvp/src/Actions/SwitchScene.ts](/mvp/src/Actions/SwitchScene.ts) | TypeScript | 45 | 3 | 11 | 59 |
| [mvp/src/Actions/Wait.ts](/mvp/src/Actions/Wait.ts) | TypeScript | 48 | 0 | 9 | 57 |
| [mvp/src/Actions/actionRegistry.ts](/mvp/src/Actions/actionRegistry.ts) | TypeScript | 80 | 1 | 12 | 93 |
| [mvp/src/Actors/detective.ts](/mvp/src/Actors/detective.ts) | TypeScript | 109 | 7 | 20 | 136 |
| [mvp/src/Actors/staticMap.ts](/mvp/src/Actors/staticMap.ts) | TypeScript | 74 | 0 | 10 | 84 |
| [mvp/src/Animations/Chef.ts](/mvp/src/Animations/Chef.ts) | TypeScript | 101 | 3 | 22 | 126 |
| [mvp/src/Animations/Detective.ts](/mvp/src/Animations/Detective.ts) | TypeScript | 103 | 3 | 22 | 128 |
| [mvp/src/Components/animation.ts](/mvp/src/Components/animation.ts) | TypeScript | 65 | 4 | 19 | 88 |
| [mvp/src/Content/NPCs/chef.ts](/mvp/src/Content/NPCs/chef.ts) | TypeScript | 22 | 46 | 3 | 71 |
| [mvp/src/Graphs/PIOffice.ts](/mvp/src/Graphs/PIOffice.ts) | TypeScript | 145 | 5 | 6 | 156 |
| [mvp/src/Graphs/bar.ts](/mvp/src/Graphs/bar.ts) | TypeScript | 116 | 5 | 6 | 127 |
| [mvp/src/Graphs/overworld.ts](/mvp/src/Graphs/overworld.ts) | TypeScript | 828 | 5 | 6 | 839 |
| [mvp/src/Graphs/warehouse.ts](/mvp/src/Graphs/warehouse.ts) | TypeScript | 98 | 5 | 6 | 109 |
| [mvp/src/Lib/ClockManager.ts](/mvp/src/Lib/ClockManager.ts) | TypeScript | 29 | 3 | 7 | 39 |
| [mvp/src/Lib/GlobalEvents.ts](/mvp/src/Lib/GlobalEvents.ts) | TypeScript | 7 | 1 | 3 | 11 |
| [mvp/src/Lib/InputMapper.ts](/mvp/src/Lib/InputMapper.ts) | TypeScript | 27 | 3 | 6 | 36 |
| [mvp/src/Lib/Lighting/FlickerSystem.ts](/mvp/src/Lib/Lighting/FlickerSystem.ts) | TypeScript | 53 | 4 | 13 | 70 |
| [mvp/src/Lib/Lighting/LightingComponents.ts](/mvp/src/Lib/Lighting/LightingComponents.ts) | TypeScript | 84 | 32 | 16 | 132 |
| [mvp/src/Lib/Lighting/LightingSystem.ts](/mvp/src/Lib/Lighting/LightingSystem.ts) | TypeScript | 418 | 14 | 89 | 521 |
| [mvp/src/Lib/Lighting/index.ts](/mvp/src/Lib/Lighting/index.ts) | TypeScript | 6 | 4 | 1 | 11 |
| [mvp/src/Lib/Lighting/lighting-system-spect.ts](/mvp/src/Lib/Lighting/lighting-system-spect.ts) | TypeScript | 69 | 6 | 21 | 96 |
| [mvp/src/Lib/NPCManager.ts](/mvp/src/Lib/NPCManager.ts) | TypeScript | 245 | 48 | 52 | 345 |
| [mvp/src/Lib/WorldClock.ts](/mvp/src/Lib/WorldClock.ts) | TypeScript | 54 | 18 | 16 | 88 |
| [mvp/src/Lib/cutscenes/CutScenes.ts](/mvp/src/Lib/cutscenes/CutScenes.ts) | TypeScript | 185 | 42 | 52 | 279 |
| [mvp/src/Lib/cutscenes/actions/AnimateAction.ts](/mvp/src/Lib/cutscenes/actions/AnimateAction.ts) | TypeScript | 31 | 9 | 8 | 48 |
| [mvp/src/Lib/cutscenes/actions/CameraAction.ts](/mvp/src/Lib/cutscenes/actions/CameraAction.ts) | TypeScript | 54 | 8 | 9 | 71 |
| [mvp/src/Lib/cutscenes/actions/DialogAction.ts](/mvp/src/Lib/cutscenes/actions/DialogAction.ts) | TypeScript | 30 | 7 | 9 | 46 |
| [mvp/src/Lib/cutscenes/actions/FlagAction.ts](/mvp/src/Lib/cutscenes/actions/FlagAction.ts) | TypeScript | 18 | 6 | 7 | 31 |
| [mvp/src/Lib/cutscenes/actions/MoveAction.ts](/mvp/src/Lib/cutscenes/actions/MoveAction.ts) | TypeScript | 30 | 11 | 8 | 49 |
| [mvp/src/Lib/cutscenes/actions/QuestCompleteAction.ts](/mvp/src/Lib/cutscenes/actions/QuestCompleteAction.ts) | TypeScript | 18 | 1 | 7 | 26 |
| [mvp/src/Lib/cutscenes/actions/QuestStartAction.ts](/mvp/src/Lib/cutscenes/actions/QuestStartAction.ts) | TypeScript | 18 | 11 | 7 | 36 |
| [mvp/src/Lib/cutscenes/actions/SpawnAction.ts](/mvp/src/Lib/cutscenes/actions/SpawnAction.ts) | TypeScript | 23 | 6 | 8 | 37 |
| [mvp/src/Lib/cutscenes/actions/WaitAction.ts](/mvp/src/Lib/cutscenes/actions/WaitAction.ts) | TypeScript | 15 | 0 | 7 | 22 |
| [mvp/src/Lib/cutscenes/plan.md](/mvp/src/Lib/cutscenes/plan.md) | Markdown | 297 | 0 | 144 | 441 |
| [mvp/src/Lib/utils.ts](/mvp/src/Lib/utils.ts) | TypeScript | 43 | 0 | 7 | 50 |
| [mvp/src/Lib/worldState.ts](/mvp/src/Lib/worldState.ts) | TypeScript | 24 | 2 | 9 | 35 |
| [mvp/src/Scenes/Bar.ts](/mvp/src/Scenes/Bar.ts) | TypeScript | 79 | 1 | 8 | 88 |
| [mvp/src/Scenes/Overworld.ts](/mvp/src/Scenes/Overworld.ts) | TypeScript | 123 | 1 | 14 | 138 |
| [mvp/src/Scenes/PIOffice.ts](/mvp/src/Scenes/PIOffice.ts) | TypeScript | 77 | 1 | 7 | 85 |
| [mvp/src/Scenes/Warehouse.ts](/mvp/src/Scenes/Warehouse.ts) | TypeScript | 74 | 1 | 7 | 82 |
| [mvp/src/main.ts](/mvp/src/main.ts) | TypeScript | 67 | 2 | 9 | 78 |
| [mvp/src/resources.ts](/mvp/src/resources.ts) | TypeScript | 27 | 1 | 4 | 32 |
| [mvp/src/style.css](/mvp/src/style.css) | PostCSS | 49 | 4 | 4 | 57 |
| [mvp/src/types.d.ts](/mvp/src/types.d.ts) | TypeScript | 36 | 2 | 10 | 48 |
| [mvp/src/types.ts](/mvp/src/types.ts) | TypeScript | 35 | 5 | 7 | 47 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)