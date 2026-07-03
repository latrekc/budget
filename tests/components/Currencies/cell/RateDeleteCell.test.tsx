import RateDeleteCell from "@/components/Currencies/cell/RateDeleteCell";
import { RateDeleteCell$key } from "@/components/Currencies/cell/__generated__/RateDeleteCell.graphql";
import { PubSubChannels } from "@/lib/types";
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

jest.mock("react-icons/ti", () => ({
  TiDelete: () => <span data-testid="delete-icon" />,
}));

jest.mock("date-format-parse", () => ({
  format: jest.fn(() => "formatted-date"),
}));

describe("RateDeleteCell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFragment.mockReturnValue({
      base: "GBP",
      date: "2024-01-01",
      id: "GBP-USD-2024-01-01",
      target: "USD",
    });
    mockCommit.mockImplementation(
      ({ onCompleted }: { onCompleted: (arg?: unknown) => void }) => {
        onCompleted({});
      },
    );
    global.alert = jest.fn();
  });

  it("renders delete button with Popover trigger", () => {
    const mockKey = asFragment<RateDeleteCell$key>({});
    render(<RateDeleteCell rate={mockKey} />);
    expect(screen.getByTestId("delete-icon")).toBeInTheDocument();
    expect(screen.getAllByTestId("button").length).toBeGreaterThanOrEqual(1);
  });

  it("Popover confirm UI shows on click with confirm action", () => {
    const mockKey = asFragment<RateDeleteCell$key>({});
    render(<RateDeleteCell rate={mockKey} />);
    expect(
      screen.getByText(/Are sure you want to remove exchange rate/),
    ).toBeInTheDocument();
    expect(screen.getByText("Yes, remove")).toBeInTheDocument();
  });

  it("on delete commit mutation with correct id variable", () => {
    const mockKey = asFragment<RateDeleteCell$key>({});
    render(<RateDeleteCell rate={mockKey} />);
    fireEvent.click(screen.getByText("Yes, remove"));
    expect(mockCommit).toHaveBeenCalled();
    const callArg = mockCommit.mock.calls[0][0] as {
      variables: { id: string };
    };
    expect(callArg.variables).toEqual({ id: "GBP-USD-2024-01-01" });
  });

  it("on success publishes PubSubChannels CurrencyExchangeRates", async () => {
    const mockKey = asFragment<RateDeleteCell$key>({});
    render(<RateDeleteCell rate={mockKey} />);
    fireEvent.click(screen.getByText("Yes, remove"));
    await waitFor(() => {
      expect(mockPublish).toHaveBeenCalledWith(
        PubSubChannels.CurrencyExchangeRates,
      );
    });
  });

  it("on error shows alert with message", async () => {
    mockCommit.mockImplementation(
      ({ onCompleted }: { onCompleted: (arg: unknown) => void }) => {
        onCompleted({ deleteCurrencyExhangeRate: { error: "Failed" } });
      },
    );
    const mockKey = asFragment<RateDeleteCell$key>({});
    render(<RateDeleteCell rate={mockKey} />);
    fireEvent.click(screen.getByText("Yes, remove"));
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Failed");
    });
  });

  it("useFragment and useMutation mocked via react-relay test utils no empty object cast use asFragment", () => {
    const mockKey = asFragment<RateDeleteCell$key>({
      base: "GBP",
      date: "2024-01-01",
      id: "1",
      target: "USD",
    });
    render(<RateDeleteCell rate={mockKey} />);
    expect(mockUseFragment).toHaveBeenCalledWith(expect.anything(), mockKey);
  });
});
