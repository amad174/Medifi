Medifi's signature admin-risk alert — the thing that makes the product feel smarter than a summary. Always pairs the problem with the next step.

```jsx
<RiskFlag level="risk" title="This date may have already passed"
  action={<Button variant="danger" size="sm">Call the clinic</Button>}>
  The letter says 2 June, which is before today. Check your letter and call the number below.
</RiskFlag>
<RiskFlag level="caution" title="No fasting time given">
  It says to fast but not for how long. Ask when you call.
</RiskFlag>
<RiskFlag level="safe" title="All key details found">Date, place, and contact number are all present.</RiskFlag>
```

Levels: `safe` (green), `caution` (amber), `risk` (red). Keep copy calm and kind — never alarmist.
