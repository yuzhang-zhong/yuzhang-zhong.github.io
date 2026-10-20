# Banban web companion sprites

These are original Banban pixel-art frames from the public desktop-pet motion demo:
https://github.com/yuzhang-zhong/banban-desktop-releases/blob/main/media/daily-motion.gif

The PNG strip contains 19 equal 144 × 144 cells. Only the connected exterior backdrop was made transparent; the cat artwork was not redrawn. Feet share a baseline at y = 132.

- Cell 0: idle
- Cells 1–10: walking to the right (mirrored in CSS when walking left)
- Cells 11–12: stretching
- Cells 13–18: blinking

The website renders the strip at 40px (36px on small or touch screens). It is served locally without an external pet service. The only stored preferences are whether the visitor has hidden or paused Banban, in that browser's local storage.
