import DescriptionFilter from "@/components/Filters/filter/DescriptionFilter";
import { initialState } from "@/components/Filters/FiltersReducer";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("usehooks-ts", () => ({
  useDebounceValue: (v: Record<string, unknown>) => [v],
}));

describe("DescriptionFilter", () => {
  it("renders Input clearable debounced and asserts 1 input", () => {
    const dispatch = jest.fn();
    render(<DescriptionFilter dispatch={dispatch} filters={initialState} />);
    expect(screen.getAllByTestId("filter-input")).toHaveLength(1);
    expect(
      screen.getByPlaceholderText("Search by description"),
    ).toBeInTheDocument();
  });

  it("dispatches SetSearch on value change", () => {
    const dispatch = jest.fn();
    render(<DescriptionFilter dispatch={dispatch} filters={initialState} />);
    fireEvent.change(screen.getByTestId("filter-input"), {
      target: { value: "coffee" },
    });
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ payload: "coffee" }),
    );
  });

  it("dispatches null on empty", () => {
    const dispatch = jest.fn();
    render(
      <DescriptionFilter
        dispatch={dispatch}
        filters={{ ...initialState, search: "x" }}
      />,
    );
    fireEvent.change(screen.getByTestId("filter-input"), {
      target: { value: "" },
    });
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ payload: null }),
    );
  });
});
