async function testOrder() {
  console.log("Testing POST /api/orders");
  try {
    const res = await fetch("http://localhost:3000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "user-42", items: [{ id: "item-1", qty: 1, price: 89.99 }] })
    });
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Body: ${text}`);
  } catch(e) {
    console.log("Error:", e);
  }
}

testOrder();
