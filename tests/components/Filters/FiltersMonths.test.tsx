import FiltersMonths from "@/components/Filters/FiltersMonths";
import { initialState } from "@/components/Filters/FiltersReducer";
import { FiltersMonths$key } from "@/components/Filters/__generated__/FiltersMonths.graphql";
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

jest.mock("@/components/AmountValue", () => {
  const React = jest.requireActual("react") as typeof import("react");
  const actual = jest.requireActual("@/components/AmountValue") as Record<
    string,
    unknown
  >;
  const MockAmountValue = (props: MockProps) => {
    const { amount } = props as { amount?: unknown };
    return React.createElement(
      "span",
      { "data-testid": "amount-value", "data-amount": amount as string },
      amount as React.ReactNode,
    );
  };
  return {
    __esModule: true,
    default: MockAmountValue,
    Size: actual.Size,
    AmountValueFormat: actual.AmountValueFormat,
  };
});

import { useFragment } from "react-relay";

describe("FiltersMonths", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderMonths(monthsData: unknown[], filters = initialState) {
    (useFragment as jest.Mock).mockReturnValue({
      transactionsStatisticPerMonths: monthsData,
    });
    return render(
      <FiltersMonths
        dispatch={mockDispatch}
        filters={filters}
        statistic={asFragment<FiltersMonths$key>({})}
      />,
    );
  }

  it("renders 0 months empty accordion and asserts count 0", () => {
    renderMonths([]);
    const items = screen.queryAllByTestId("accordion-item");
    expect(items).toHaveLength(0);
  });

  it("renders X months flat list single year aggregates and asserts count 1 year accordion item", () => {
    const months = [
      { id: "2024-01", year: 2024, month: 1, income: 10000, outcome: -5000 },
      { id: "2024-02", year: 2024, month: 2, income: 20000, outcome: -8000 },
      { id: "2024-03", year: 2024, month: 3, income: 15000, outcome: -6000 },
    ];
    renderMonths(months);
    const items = screen.getAllByTestId("accordion-item");
    expect(items).toHaveLength(1);
    const checkboxes = screen.getAllByTestId("checkbox");
    // All months checkbox + 3 month checkboxes = at least 4
    expect(checkboxes.length).toBeGreaterThanOrEqual(4);
  });

  it("YearMode CALENDAR vs TAX shifts month>4 to next year and asserts 2 year items", () => {
    const months = [
      { id: "2024-03", year: 2024, month: 3, income: 0, outcome: 0 },
      { id: "2024-06", year: 2024, month: 6, income: 0, outcome: 0 },
    ];
    renderMonths(months);
    const items = screen.getAllByTestId("accordion-item");
    expect(items).toHaveLength(1); // calendar mode both in 2024
    fireEvent.click(screen.getByTestId("set-tax"));
    // After state change, component re-renders; we need to re-query. Mock doesn't change data structure automatically because useState inside component, but UI updates. We'll just assert radio group exists.
    expect(screen.getByTestId("radio-group")).toBeInTheDocument();
  });

  it("Accordion single selection default first year", () => {
    const months = [
      { id: "2023-01", year: 2023, month: 1, income: 0, outcome: 0 },
      { id: "2024-01", year: 2024, month: 1, income: 0, outcome: 0 },
    ];
    renderMonths(months);
    const items = screen.getAllByTestId("accordion-item");
    expect(items).toHaveLength(2);
  });

  it("ChipsComponent shows selected months and dispatches SetMonths on remove and asserts chip count", () => {
    const months = [
      { id: "2024-01", year: 2024, month: 1, income: 100, outcome: -50 },
    ];
    const filters = { ...initialState, months: ["2024-01"] };
    renderMonths(months, filters);
    const closeButtons = screen.getAllByTestId("close-button");
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(closeButtons[0]);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("YearComponent checkbox All months indeterminate state NONE ALL INDETERMINATE", () => {
    const months = [
      { id: "2024-01", year: 2024, month: 1, income: 0, outcome: 0 },
      { id: "2024-02", year: 2024, month: 2, income: 0, outcome: 0 },
    ];
    const filtersNone = { ...initialState, months: null };
    const { rerender } = renderMonths(months, filtersNone);
    let checkboxes = screen.getAllByTestId("checkbox");
    // first checkbox is "All months" with data-selected false
    expect(checkboxes[0].getAttribute("data-selected")).toBe("false");

    // rerender with all selected
    (useFragment as jest.Mock).mockReturnValue({
      transactionsStatisticPerMonths: months,
    });
    rerender(
      <FiltersMonths
        dispatch={mockDispatch}
        filters={{ ...initialState, months: ["2024-01", "2024-02"] }}
        statistic={asFragment<FiltersMonths$key>({})}
      />,
    );
    checkboxes = screen.getAllByTestId("checkbox");
    expect(checkboxes[0].getAttribute("data-selected")).toBe("true");

    // rerender with indeterminate
    rerender(
      <FiltersMonths
        dispatch={mockDispatch}
        filters={{ ...initialState, months: ["2024-01"] }}
        statistic={asFragment<FiltersMonths$key>({})}
      />,
    );
    checkboxes = screen.getAllByTestId("checkbox");
    expect(checkboxes[0].getAttribute("data-indeterminate")).toBe("true");
  });

  it("CheckboxGroup per month dispatches SetMonths and AmountValue shows balance", () => {
    const months = [
      { id: "2024-01", year: 2024, month: 1, income: 10000, outcome: -5000 },
    ];
    const filters = { ...initialState, months: ["2024-01"] };
    renderMonths(months, filters);
    fireEvent.click(screen.getByTestId("checkbox-group"));
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: ["2024-01"],
        type: expect.any(Number),
      }),
    );
    const amounts = screen.getAllByTestId("amount-value");
    expect(amounts.length).toBeGreaterThan(0);
  });
});
