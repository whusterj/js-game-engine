JS Game Engine
==============

My sandbox for implementing game engine concepts in JavaScript.

Log
---

12/6/2014 - The game so far consists of a "PlayerShip" and "EnemyShips" that all look alike and have different types of "Engines" that power them. The EnemyShips travel autonomously in a way that resembles fish, and the PlayerShip is of course controlled by the user using the keyboard.

I've started by leveraging svg.js as the primary rendering engine, but it does not scale well, because each invocation of `.move()` on an svg element forces a layout recalculation which is a HUGE waste of resources.

In `src/layoutUpdateTest.js`, I have started to test the manipulation of 'raw' SVG, with which the browser seems much happier and more performant.