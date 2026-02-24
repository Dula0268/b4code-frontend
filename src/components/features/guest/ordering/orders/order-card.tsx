export default function Placeholder() {
  return (
    <div
      style={{
        padding: 8,
        border: "1px dashed #ccc",
        borderRadius: 8,
        minHeight: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>features/guest/ordering/orders/order-card</h3>
        <p style={{ marginTop: 4, color: "#666", fontSize: 12 }}>
          Compact placeholder — replace with real UI.
        </p>
      </div>
      <div style={{ width: 48, height: 32, background: '#f5f5f5', borderRadius: 6 }} />
    </div>
  );
}
