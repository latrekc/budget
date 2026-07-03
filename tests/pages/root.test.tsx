import nextConfig from "../../next.config.js";

describe("Root redirect", () => {
  it("redirects / to /transactions", async () => {
    const redirects = await nextConfig.redirects();

    expect(redirects).toContainEqual({
      source: "/",
      destination: "/transactions",
      permanent: false,
    });
  });
});
