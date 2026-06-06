Surface container for grouped content — white, hairline border, soft shadow.

```jsx
<Card variant="accent">
  <CardHeader title="Your appointment" subtitle="Dermatology" action={<Badge tone="brand">New</Badge>} />
  <p>Tuesday 12 June, 10:30am at St Thomas' Hospital.</p>
</Card>
```

Variants: `default`, `flush` (no padding for media/lists), `quiet` (no shadow), `accent` (brand left edge). Pair with `CardHeader` for a title/subtitle/action row.
