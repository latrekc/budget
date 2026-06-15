import RateClaimDateCell from "@/components/Currencies/cell/RateClaimDateCell";
import { RateClaimDateCell$key } from "@/components/Currencies/cell/__generated__/RateClaimDateCell.graphql";
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

describe("RateClaimDateCell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders date formatted D MMMM YYYY dddd text-xs", () => {
    mockUseFragment.mockReturnValue({ date: "2024-03-10" });
    const mockKey = asFragment<RateClaimDateCell$key>({});
    render(<RateClaimDateCell claim={mockKey} />);
    expect(screen.getByText("formatted-2024-03-10")).toBeInTheDocument();
    expect(screen.getByText("formatted-2024-03-10")).toHaveClass("text-xs");
  });

  it("edge dates covered leap year", () => {
    mockUseFragment.mockReturnValue({ date: "2024-02-29" });
    const mockKey = asFragment<RateClaimDateCell$key>({});
    render(<RateClaimDateCell claim={mockKey} />);
    expect(screen.getByText("formatted-2024-02-29")).toBeInTheDocument();
  });

  it("useFragment called", () => {
    mockUseFragment.mockReturnValue({ date: "2024-01-01" });
    const mockKey = asFragment<RateClaimDateCell$key>({});
    render(<RateClaimDateCell claim={mockKey} />);
    expect(mockUseFragment).toHaveBeenCalled();
  });
});
