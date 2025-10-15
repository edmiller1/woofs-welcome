// Test script to verify rate limiting works
async function testRateLimit() {
  const endpoint = "http://localhost:9000/api/auth/sign-in/email-otp";

  console.log("Testing rate limiting...");
  console.log(`Endpoint: ${endpoint}`);
  console.log("Limit: 5 requests per 15 minutes\n");

  for (let i = 1; i <= 10; i++) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      });

      const remaining = response.headers.get("ratelimit-remaining");
      const reset = response.headers.get("ratelimit-reset");

      if (response.status === 429) {
        console.log(`❌ Request ${i}: RATE LIMITED (429)`);
        console.log(`   Remaining: 0`);
        console.log(
          `   Reset at: ${new Date(parseInt(reset!) * 1000).toLocaleTimeString()}`
        );
      } else {
        console.log(`✅ Request ${i}: Success (${response.status})`);
        console.log(`   Remaining: ${remaining}`);
      }
    } catch (error) {
      console.error(`Error on request ${i}:`, error);
    }

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

testRateLimit();
