Primary action control — use for any button or link styled as a button; sentence-case verb labels.

```jsx
<Button variant="primary" size="lg" onClick={scan}>Scan a letter</Button>
<Button variant="secondary" iconLeft={<PhoneIcon/>}>Call the clinic</Button>
<Button variant="ghost" size="sm">Show original</Button>
```

Variants: `primary` (main action), `secondary` (outlined), `ghost` (low-emphasis), `danger` (destructive). Sizes: `sm` / `md` (default, 48px) / `lg`. Props: `fullWidth`, `iconLeft`, `iconRight`, `as="a"`. Never use Title Case or ALL CAPS labels.
