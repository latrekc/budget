import RateDateCell from "@/components/Currencies/cell/RateDateCell";
import { RateDateCell$key } from "@/components/Currencies/cell/__generated__/RateDateCell.graphql";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { asFragment } from "../../../utils/fragment";

jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useFragment: jest.fn(),
}));

jest.mock("date-format-parse", () => ({
  format: jest.fn((date: string) => `formatted-${date}`),
}));

const mockUseFragment = jest.requireMock("react-relay")
  .useFragment as jest.Mock;

describe("RateDateCell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders date formatted D MMMM YYYY dddd with text-xs class", () => {
    mockUseFragment.mockReturnValue({ date: "2024-01-15" });
    const mockKey = asFragment<RateDateCell$key>({});
    render(<RateDateCell rate={mockKey} />);
    expect(mockUseFragment).toHaveBeenCalled();
    expect(screen.getByText("formatted-2024-01-15")).toBeInTheDocument();
    expect(screen.getByText("formatted-2024-01-15").closest("div")).toHaveClass(
      "text-xs",
    );
  });

  it("handles edge date values leap year", () => {
    mockUseFragment.mockReturnValue({ date: "2024-02-29" });
    const mockKey = asFragment<RateDateCell$key>({});
    render(<RateDateCell rate={mockKey} />);
    expect(screen.getByText("formatted-2024-02-29")).toBeInTheDocument();
  });

  it("handles year boundary", () => {
    mockUseFragment.mockReturnValue({ date: "2023-12-31" });
    const mockKey = asFragment<RateDateCell$key>({});
    render(<RateDateCell rate={mockKey} />);
    expect(screen.getByText("formatted-2023-12-31")).toBeInTheDocument();
  });

  it("useFragment called with proper fragment key via asFragment helper no empty object cast", () => {
    mockUseFragment.mockReturnValue({ date: "2024-06-19" });
    const data = { date: "2024-06-19" };
    const mockKey = asFragment<RateDateCell$key>(data);
    render(<RateDateCell rate={mockKey} />);
    expect(mockUseFragment).toHaveBeenCalledWith(expect.anything(), mockKey);
  });
});
