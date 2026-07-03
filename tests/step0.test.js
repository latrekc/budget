const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

describe("Step 0: Jest Installation", () => {
  test("jest is installed and configured", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(ROOT, "package.json"), "utf-8"),
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
    expect(fs.existsSync(path.join(ROOT, "jest.config.js"))).toBe(true);
  });

  test("jest setup file exists", () => {
    expect(fs.existsSync(path.join(ROOT, "jest.setup.js"))).toBe(true);
  });

  test("test script is configured in package.json", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(ROOT, "package.json"), "utf-8"),
    );
    expect(packageJson.scripts).toHaveProperty("test");
    expect(packageJson.scripts.test).toContain("jest");
  });
});
