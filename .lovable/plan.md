

# Snake-Shaped Board Path

## What changes
Replace the current flat grid layout with a snake/serpentine path where:
- Rows alternate direction (left-to-right, then right-to-left, then left-to-right...)
- This creates the classic board game winding path feel, like Snakes & Ladders or Monopoly edges
- Optional: add connector lines between squares to visualize the path

## How it works

Using a fixed number of columns (e.g. 5 on desktop, 3 on mobile), the quests are laid out row by row. Even rows go left-to-right, odd rows go right-to-left. CSS Grid with explicit `order` styling on each square handles the reversal.

```text
Row 0:  [1] [2] [3] [4] [5]
                            |
Row 1:  [10] [9] [8] [7] [6]
        |
Row 2:  [11] [12] [13] [14] [15]
```

## Technical details

**File: `src/pages/QuestBoard.tsx`**
- Replace the simple grid with a snake-layout grid
- Compute each quest's grid column based on its index and which row it falls in
- Even rows: columns 1-5 normally; odd rows: columns reversed (5 down to 1)
- Use CSS Grid with `grid-column` and `grid-row` on each square
- Add small SVG/CSS connector lines between adjacent squares to show the path direction

**File: `src/components/quest-board/BoardSquare.tsx`**
- No major changes needed; may add a small visual connector arrow/line prop

The columns will be responsive: 5 columns on large screens, 4 on medium, 3 on small, 2 on mobile -- with the snake logic adapting to whichever column count is active. To keep it simple and reliable, we'll use a fixed 5-column layout inside a horizontally scrollable container on small screens, ensuring the snake path always looks correct.

