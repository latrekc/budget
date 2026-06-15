describe("Step 0: Jest Installation", () => {
  test("jest is installed and configured", () => {
    const fs = require("fs");
    const packageJson = JSON.parse(
      fs.readFileSync("/Users/latrekc/Code/budget/package.json", "utf-8"),
    );

    // Check jest is in devDependencies
    expect(packageJson.devDependencies).toHaveProperty("jest");
    expect(packageJson.devDependencies).toHaveProperty(
      "@testing-library/react",
    );
    expect(packageJson.devDependencies).toHaveProperty(
      "@testing-library/jest-dom",
    );
    expect(packageJson.devDependencies).toHaveProperty(
      "jest-environment-jsdom",
    );
  });

  test("jest config file exists", () => {
    const fs = require("fs");
    expect(fs.existsSync("/Users/latrekc/Code/budget/jest.config.js")).toBe(
      true,
    );
  });

  test("jest setup file exists", () => {
    const fs = require("fs");
    expect(fs.existsSync("/Users/latrekc/Code/budget/jest.setup.js")).toBe(
      true,
    );
  });

  test("test script is configured in package.json", () => {
    const fs = require("fs");
    const packageJson = JSON.parse(
      fs.readFileSync("/Users/latrekc/Code/budget/package.json", "utf-8"),
    );
    expect(packageJson.scripts).toHaveProperty("test");
    expect(packageJson.scripts.test).toContain("jest");
  });
});
