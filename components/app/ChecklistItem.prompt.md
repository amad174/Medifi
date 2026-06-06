A single tickable task in the patient's action plan — verb-phrase label, optional detail and trailing icon.

```jsx
<ChecklistItem label="Add to your calendar" meta="Tue 12 Jun, 10:30am" done={done} onToggle={toggle} />
<ChecklistItem label="Bring your medication list" />
```

Props: `label`, `meta`, `icon`, `done`, `onToggle`. Renders as a full-width button; checked state strikes through and turns green.
