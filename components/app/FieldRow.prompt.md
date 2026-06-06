One extracted structured field from a letter — uppercase key, monospaced value, with a "missing" state.

```jsx
<FieldRow label="Date & time" value="Tue 12 Jun 2026, 10:30am" />
<FieldRow label="Phone" missing />
```

Props: `label`, `value`, `missing` (shows italic "Not found in letter" in caution colour). Stack several inside a `Card`.
