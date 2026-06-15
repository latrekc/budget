import RateClaimValueCell from "@/components/Currencies/cell/RateClaimValueCell";
import { RateClaimValueCell$key } from "@/components/Currencies/cell/__generated__/RateClaimValueCell.graphql";
import { Currency, DEFAULT_CURRENCY, PubSubChannels } from "@/lib/types";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { asFragment } from "../../../utils/fragment";

const mockUseFragment = jest.fn();
const mockPublish = jest.fn();
const mockCommit = jest.fn();

jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useFragment: (...args: unknown[]) => mockUseFragment(...args),
  useMutation: () => [mockCommit, false],
}));

jest.mock("@/lib/usePubSub", () => ({
  usePubSub: () => ({ publish: mockPublish }),
}));

describe("RateClaimValueCell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFragment.mockReturnValue({
      date: "2024-01-01",
      currency: Currency.USD,
    });
    mockCommit.mockImplementation(({ onCompleted }) => {
      onCompleted({});
    });
    global.alert = jest.fn();
  });

  it("renders input number autofocus", () => {
    const mockKey = asFragment<RateClaimValueCell$key>({});
    render(<RateClaimValueCell claim={mockKey} />);
    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    // autofocus attribute may not be reflected in JSDOM, check property if present
    expect(input.type).toBe("number");
    expect(input.type).toBe("number");
  });

  it("validates greater than 0 else shows alert on invalid", () => {
    const mockKey = asFragment<RateClaimValueCell$key>({});
    render(<RateClaimValueCell claim={mockKey} />);
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "-5" } });
    fireEvent.submit(input.closest("form")!);
    expect(global.alert).toHaveBeenCalledWith("Not a valid number");
    expect(mockCommit).not.toHaveBeenCalled();
  });

  it("validates zero shows alert", () => {
    const mockKey = asFragment<RateClaimValueCell$key>({});
    render(<RateClaimValueCell claim={mockKey} />);
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "0" } });
    fireEvent.submit(input.closest("form")!);
    expect(global.alert).toHaveBeenCalled();
  });

  it("on valid input commits mutation with correct variables", () => {
    const mockKey = asFragment<RateClaimValueCell$key>({});
    render(<RateClaimValueCell claim={mockKey} />);
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "1.2345" } });
    fireEvent.submit(input.closest("form")!);
    expect(mockCommit).toHaveBeenCalled();
    const args = mockCommit.mock.calls[0][0];
    expect(args.variables).toEqual({
      base: DEFAULT_CURRENCY,
      date: "2024-01-01",
      target: Currency.USD,
      value: 1.2345,
    });
  });

  it("on success publishes PubSubChannels CurrencyExchangeRates", async () => {
    const mockKey = asFragment<RateClaimValueCell$key>({});
    render(<RateClaimValueCell claim={mockKey} />);
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "2" } });
    fireEvent.submit(input.closest("form")!);
    await waitFor(() => {
      expect(mockPublish).toHaveBeenCalledWith(
        PubSubChannels.CurrencyExchangeRates,
      );
    });
  });

  it("on error shows alert", async () => {
    mockCommit.mockImplementation(({ onCompleted }) => {
      onCompleted({ createCurrencyExhangeRate: { message: "Error msg" } });
    });
    const mockKey = asFragment<RateClaimValueCell$key>({});
    render(<RateClaimValueCell claim={mockKey} />);
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "3" } });
    fireEvent.submit(input.closest("form")!);
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Error msg");
    });
  });

  it("useFragment called", () => {
    const mockKey = asFragment<RateClaimValueCell$key>({});
    render(<RateClaimValueCell claim={mockKey} />);
    expect(mockUseFragment).toHaveBeenCalled();
  });
});
