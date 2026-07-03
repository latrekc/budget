import SortFilter from "@/components/Filters/filter/SortFilter";
import { initialState } from "@/components/Filters/FiltersReducer";
import { SortBy } from "@/lib/types";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

describe("SortFilter", () => {
  it("renders Switch ToggleSortBy isSelected filters.sortBy===SortBy.Amount and asserts 1", () => {
    const dispatch = jest.fn();
    render(<SortFilter dispatch={dispatch} filters={initialState} />);
    expect(screen.getAllByTestId("switch")).toHaveLength(1);
    expect(screen.getByText("Sort by amount")).toBeInTheDocument();
  });

  it("dispatches ToggleSortBy on click", () => {
    const dispatch = jest.fn();
    render(<SortFilter dispatch={dispatch} filters={initialState} />);
    fireEvent.click(screen.getByTestId("switch-control"));
    expect(dispatch).toHaveBeenCalled();
  });

  it("shows selected when sortBy Amount", () => {
    const dispatch = jest.fn();
    render(
      <SortFilter
        dispatch={dispatch}
        filters={{ ...initialState, sortBy: SortBy.Amount }}
      />,
    );
    expect(screen.getByTestId("switch").getAttribute("data-selected")).toBe(
      "true",
    );
  });
});
