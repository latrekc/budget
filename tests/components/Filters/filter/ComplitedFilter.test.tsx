import ComplitedFilter from "@/components/Filters/filter/ComplitedFilter";
import { initialState } from "@/components/Filters/FiltersReducer";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

describe("ComplitedFilter", () => {
  it("renders Switch toggles ToggleOnlyUncomplited label Only uncategorised and asserts 1 switch", () => {
    const dispatch = jest.fn();
    render(<ComplitedFilter dispatch={dispatch} filters={initialState} />);
    const switches = screen.getAllByTestId("switch");
    expect(switches).toHaveLength(1);
    expect(screen.getByText("Only uncategorised")).toBeInTheDocument();
  });

  it("dispatches ToggleOnlyUncomplited on click", () => {
    const dispatch = jest.fn();
    render(<ComplitedFilter dispatch={dispatch} filters={initialState} />);
    fireEvent.click(screen.getByTestId("switch-control"));
    expect(dispatch).toHaveBeenCalled();
  });

  it("shows selected when onlyUncomplited true", () => {
    const dispatch = jest.fn();
    render(
      <ComplitedFilter
        dispatch={dispatch}
        filters={{ ...initialState, onlyUncomplited: true }}
      />,
    );
    const sw = screen.getByTestId("switch");
    expect(sw.getAttribute("data-selected")).toBe("true");
  });
});
