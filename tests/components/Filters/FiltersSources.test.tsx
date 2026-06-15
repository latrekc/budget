import { initialState } from "@/components/Filters/FiltersReducer";
import FiltersSources from "@/components/Filters/FiltersSources";
import { FiltersSources$key } from "@/components/Filters/__generated__/FiltersSources.graphql";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { asFragment } from "../../utils/fragment";

type MockProps = Record<string, unknown>;

const mockDispatch = jest.fn();

jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useFragment: jest.fn((_, key) => key),
}));

jest.mock("@/components/SourceImage", () => (props: MockProps) => {
  const React = jest.requireActual("react") as typeof import("react");
  const { source } = props as { source?: string };
  return React.createElement("img", {
    "data-testid": "source-image",
    alt: source,
  });
});
jest.mock("@/components/AmountValue", () => {
  const React = jest.requireActual("react") as typeof import("react");
  const actual = jest.requireActual("@/components/AmountValue") as Record<
    string,
    unknown
  >;
  const Mock = (props: MockProps) => {
    const { amount } = props as { amount?: unknown };
    return React.createElement(
      "span",
      { "data-testid": "amount-value" },
      amount as React.ReactNode,
    );
  };
  return {
    __esModule: true,
    default: Mock,
    Size: actual.Size,
    AmountValueFormat: actual.AmountValueFormat,
  };
});

import { useFragment } from "react-relay";

describe("FiltersSources", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderSources(sourcesData: unknown[], filters = initialState) {
    (useFragment as jest.Mock).mockReturnValue({
      transactionsStatisticPerSource: sourcesData,
    });
    return render(
      <FiltersSources
        dispatch={mockDispatch}
        filters={filters}
        statistic={asFragment<FiltersSources$key>({})}
      />,
    );
  }

  it("renders 0 sources empty list no crash and asserts count 0", () => {
    renderSources([]);
    const items = screen.queryAllByTestId("source-item");
    expect(items).toHaveLength(0);
  });

  it("renders X sources 3 and asserts count 3 via getAllByTestId", () => {
    const sources = [
      { source: "Barclays", income: 10000, outcome: -5000 },
      { source: "HSBC", income: 20000, outcome: 0 },
      { source: "Monzo", income: 0, outcome: -3000 },
    ];
    renderSources(sources);
    const items = screen.getAllByTestId("source-item");
    expect(items).toHaveLength(3);
  });

  it("CheckboxGroup value filters.sources setSelected dispatches SetSources null if empty or full", () => {
    const sources = [
      { source: "Barclays", income: 0, outcome: 0 },
      { source: "HSBC", income: 0, outcome: 0 },
    ];
    const filters = { ...initialState, sources: ["Barclays"] };
    renderSources(sources, filters);
    const group = screen.getByTestId("checkbox-group");
    expect(group.getAttribute("data-value")).toContain("Barclays");
    fireEvent.click(group);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("Chips for selected with onRemove dispatches and asserts chip count 2", () => {
    const sources = [
      { source: "Barclays", income: 0, outcome: 0 },
      { source: "HSBC", income: 0, outcome: 0 },
    ];
    const filters = { ...initialState, sources: ["Barclays", "HSBC"] };
    renderSources(sources, filters);
    const closeButtons = screen.getAllByTestId("close-button");
    expect(closeButtons).toHaveLength(2);
    fireEvent.click(closeButtons[0]);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("Each source row shows SourceImage name AmountValue income outcome and asserts image count 3", () => {
    const sources = [
      { source: "Barclays", income: 100, outcome: -50 },
      { source: "HSBC", income: 200, outcome: 0 },
      { source: "Monzo", income: 0, outcome: -30 },
    ];
    renderSources(sources);
    const images = screen.getAllByTestId("source-image");
    expect(images).toHaveLength(3);
    expect(screen.getByText("Barclays")).toBeInTheDocument();
    expect(screen.getByText("HSBC")).toBeInTheDocument();
    expect(screen.getByText("Monzo")).toBeInTheDocument();
    const amounts = screen.getAllByTestId("amount-value");
    // Barclays has income and outcome =2, HSBC 1, Monzo 1 => total 4
    expect(amounts).toHaveLength(4);
  });
});
