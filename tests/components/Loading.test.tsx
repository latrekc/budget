import Loading from "@/components/Loading";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

describe("Loading", () => {
  it("renders full-screen loading indicator", () => {
    const { container } = render(<Loading />);

    const wrapper = container.querySelector("div");
    expect(wrapper).toHaveClass("flex");
    expect(wrapper).toHaveClass("min-h-screen");
    expect(wrapper).toHaveClass("w-full");
    expect(wrapper).toHaveClass("items-center");
    expect(wrapper).toHaveClass("justify-center");
  });

  it("shows indeterminate progress bar", () => {
    render(<Loading />);

    const progress = screen.getByLabelText("Loading...");
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveAttribute("role", "progressbar");
  });

  it("has correct accessibility attributes", () => {
    render(<Loading />);

    const progress = screen.getByLabelText("Loading...");
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveAttribute("aria-busy", "true");
    expect(progress).toHaveAttribute("role", "progressbar");
  });

  it("progress bar has correct props", () => {
    render(<Loading />);

    const progress = screen.getByTestId("progress-bar");
    expect(progress).toHaveAttribute("data-indeterminate", "true");
    expect(progress).toHaveAttribute("data-size", "lg");
    expect(progress).toHaveClass("max-w-md");
    expect(progress).toHaveAttribute("aria-label", "Loading...");
  });
});
