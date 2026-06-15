import AmountFilter from "@/components/Filters/filter/AmountFilter";
import { initialState } from "@/components/Filters/FiltersReducer";
import { AmountRelation } from "@/lib/types";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

type MockProps = Record<string, unknown>;

jest.mock("usehooks-ts", () => ({
  useDebounceValue: (v: MockProps) => [v],
}));

jest.mock("react-icons/fa", () => ({
  FaEquals: () =>
    jest
      .requireActual("react")
      .createElement("span", { "data-testid": "icon-equals" }),
  FaGreaterThan: () =>
    jest
      .requireActual("react")
      .createElement("span", { "data-testid": "icon-greater" }),
  FaLessThan: () =>
    jest
      .requireActual("react")
      .createElement("span", { "data-testid": "icon-less" }),
}));

describe("AmountFilter", () => {
  it("renders input number clearable with label and asserts 1 input", () => {
    const dispatch = jest.fn();
    render(<AmountFilter dispatch={dispatch} filters={initialState} />);
    const inputs = screen.getAllByTestId("amount-input");
    expect(inputs.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Search by amount")).toBeInTheDocument();
  });

  it("debounced dispatch SetAmount on value change", () => {
    const dispatch = jest.fn();
    render(<AmountFilter dispatch={dispatch} filters={initialState} />);
    const input =
      screen.getAllByTestId("amount-input")[1] ||
      screen.getAllByTestId("amount-input")[0];
    fireEvent.change(input, { target: { value: "123" } });
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: expect.any(Number), payload: "123" }),
    );
  });

  it("dispatches null when empty string", () => {
    const dispatch = jest.fn();
    render(
      <AmountFilter
        dispatch={dispatch}
        filters={{ ...initialState, amount: "10" }}
      />,
    );
    const input =
      screen.getAllByTestId("amount-input")[1] ||
      screen.getAllByTestId("amount-input")[0];
    fireEvent.change(input, { target: { value: "" } });
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ payload: null }),
    );
  });

  it("dropdown AmountRelation EQUAL GREATER LESS icons rendered and asserts 3 options", () => {
    const dispatch = jest.fn();
    render(<AmountFilter dispatch={dispatch} filters={initialState} />);
    expect(screen.getAllByTestId("icon-equals").length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getAllByTestId("icon-greater").length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getAllByTestId("icon-less").length).toBeGreaterThanOrEqual(1);
    // NOTE: selecting a relation (onSelectionChange -> dispatch) goes through
    // react-aria's Dropdown overlay, which jsdom can't drive (the compound is
    // stubbed in jest.setup.js). That interaction is covered by the planned E2E.
  });

  it("does not crash and defaults to EQUAL when the relation selection is cleared", () => {
    // Regression for the `undefined.toString()` crash: react-aria fires
    // onSelectionChange with an empty Set on deselect. The mock's Dropdown.Menu
    // models that by firing an empty Set on click.
    const dispatch = jest.fn();
    render(<AmountFilter dispatch={dispatch} filters={initialState} />);
    expect(() =>
      fireEvent.click(screen.getByTestId("dropdown-menu")),
    ).not.toThrow();
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ payload: AmountRelation.EQUAL }),
    );
  });
});
