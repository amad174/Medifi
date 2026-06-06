Labelled text input or textarea with hint and error states.

```jsx
<Input label="Paste your letter" multiline placeholder="Paste the text from your NHS letter…" />
<Input label="NHS number" hint="It's on your letter, 10 digits." />
<Input label="Phone" error="Please enter a valid number." />
```

Props: `label`, `hint`, `error` (turns field red), `multiline` (textarea). All standard input attributes pass through.
