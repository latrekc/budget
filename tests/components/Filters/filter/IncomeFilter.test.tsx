import IncomeFilter from "@/components/Filters/filter/IncomeFilter";
import { initialState } from "@/components/Filters/FiltersReducer";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

describe("IncomeFilter", () => {
  it("renders Switch ToggleOnlyIncome and asserts 1 switch", () => {
    const dispatch = jest.fn();
    render(<IncomeFilter dispatch={dispatch} filters={initialState} />);
    expect(screen.getAllByTestId("switch")).toHaveLength(1);
    expect(screen.getByText("Only income")).toBeInTheDocument();
  });

  it("dispatches on toggle", () => {
    const dispatch = jest.fn();
    render(<IncomeFilter dispatch={dispatch} filters={initialState} />);
    fireEvent.click(screen.getByTestId("switch-control"));
    expect(dispatch).toHaveBeenCalled();
  });

  it("shows selected when onlyIncome true", () => {
    const dispatch = jest.fn();
    render(
      <IncomeFilter
        dispatch={dispatch}
        filters={{ ...initialState, onlyIncome: true }}
      />,
    );
    expect(screen.getByTestId("switch").getAttribute("data-selected")).toBe(
      "true",
    );
  });
});
