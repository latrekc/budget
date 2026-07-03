import RateValueCell from "@/components/Currencies/cell/RateValueCell";
import { RateValueCell$key } from "@/components/Currencies/cell/__generated__/RateValueCell.graphql";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { asFragment } from "../../../utils/fragment";

jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useFragment: jest.fn(),
}));

const mockUseFragment = jest.requireMock("react-relay")
  .useFragment as jest.Mock;

describe("RateValueCell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders value toFixed 4 for numeric rate", () => {
    mockUseFragment.mockReturnValue({ rate: 1.234567 });
    const mockKey = asFragment<RateValueCell$key>({});
    render(<RateValueCell rate={mockKey} />);
    expect(screen.getByText("1.2346")).toBeInTheDocument();
  });

  it("renders blank string when rate null", () => {
    mockUseFragment.mockReturnValue({ rate: null });
    const mockKey = asFragment<RateValueCell$key>({});
    const { container } = render(<RateValueCell rate={mockKey} />);
    expect(container.textContent).toBe("");
  });

  it("handles 0 value", () => {
    mockUseFragment.mockReturnValue({ rate: 0 });
    const mockKey = asFragment<RateValueCell$key>({});
    render(<RateValueCell rate={mockKey} />);
    expect(screen.getByText("0.0000")).toBeInTheDocument();
  });

  it("handles negative values", () => {
    mockUseFragment.mockReturnValue({ rate: -2.5 });
    const mockKey = asFragment<RateValueCell$key>({});
    render(<RateValueCell rate={mockKey} />);
    expect(screen.getByText("-2.5000")).toBeInTheDocument();
  });

  it("handles large values", () => {
    mockUseFragment.mockReturnValue({ rate: 123456.789 });
    const mockKey = asFragment<RateValueCell$key>({});
    render(<RateValueCell rate={mockKey} />);
    expect(screen.getByText("123456.7890")).toBeInTheDocument();
  });

  it("useFragment called", () => {
    mockUseFragment.mockReturnValue({ rate: 1 });
    const mockKey = asFragment<RateValueCell$key>({});
    render(<RateValueCell rate={mockKey} />);
    expect(mockUseFragment).toHaveBeenCalled();
  });
});
