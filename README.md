# Emoji Memory Match

A browser-based memory card game with difficulty levels, a live timer, scoring, and personal best tracking. Built entirely with vanilla HTML, CSS, and JavaScript.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-F26A8D?style=for-the-badge&logo=google-chrome&logoColor=white)](https://sophiaarfan.github.io/memory-match/)

## Overview

Players get 5 seconds to memorize a grid of emoji cards before they're flipped face-down. Select pairs one at a time to find all matches — wrong guesses flash red and add a 2-second time penalty. Scores factor in both moves and time, with a star rating at the end and per-difficulty personal bests saved across sessions.

## Stack

| Layer | Tech |
|---|---|
| Frontend | HTML, CSS, vanilla JS |
| Animation | Canvas API (`requestAnimationFrame`) |
| Persistence | `localStorage` |

## Features

- Three difficulty levels — Easy (4 pairs), Medium (8 pairs), Hard (12 pairs)
- 5-second peek phase to memorize cards before play begins
- Live timer with 2-second penalty on wrong matches
- Star rating system scored on moves + time, calibrated per difficulty
- Personal best tracking and round history (last 5 games) via `localStorage`
- Animated splash screen with bouncing emoji canvas animation
- Give up option that reveals all cards and records the round as 0 pts
- Visual feedback — wrong pairs flash red, already-selected cards shake on re-click

## Project Structure

```
js_assignment/
├── index.html
├── css/
│   └── style.css
└── js/
    └── script.js
```

## How to Run

Download and open `index.html` in any modern browser. No build step or dependencies required. Or use the GitHub pages link.

---

> **Academic Integrity Notice**
> This project was submitted as coursework for McMaster University (CS 1XD3). It is shared here for portfolio purposes only and is **not open source** — this repository does not grant permission to copy, use, redistribute, or submit any part of this code.