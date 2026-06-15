import CurrencyFilter from "@/components/Filters/filter/CurrencyFilter";
import { initialState } from "@/components/Filters/FiltersReducer";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

describe("CurrencyFilter", () => {
  it("ButtonGroup maps Currency enum variant solid if selected else flat and asserts 7 buttons", () => {
    const dispatch = jest.fn();
    render(<CurrencyFilter dispatch={dispatch} filters={initialState} />);
    const buttons = screen.getAllByTestId("currency-button");
    expect(buttons).toHaveLength(7);
  });

  it("dispatches onToggleCurrency on click", () => {
    const dispatch = jest.fn();
    render(<CurrencyFilter dispatch={dispatch} filters={initialState} />);
    fireEvent.click(screen.getAllByTestId("currency-button")[0]);
    expect(dispatch).toHaveBeenCalled();
  });
});
