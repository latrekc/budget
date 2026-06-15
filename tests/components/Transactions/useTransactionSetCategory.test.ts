import { FiltersState } from "@/components/Filters/FiltersReducer";
import useTransactionSetCategory from "@/components/Transactions/useTransactionSetCategory";
import { PubSubChannels } from "@/lib/types";
import { act, renderHook } from "@testing-library/react";

const mockPublish = jest.fn();
const mockCommitMutation = jest.fn();
const mockCommitAllMutation = jest.fn();

jest.mock("@/lib/usePubSub", () => ({
  usePubSub: () => ({ publish: mockPublish }),
}));

jest.mock("react-relay", () => ({
  graphql: (strings: TemplateStringsArray) => strings.join(""),
  useMutation: jest.fn(),
}));

import { useMutation } from "react-relay";
const mockedUseMutation = useMutation as jest.Mock;

describe("useTransactionSetCategory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    let callIndex = 0;
    mockedUseMutation.mockImplementation(() => {
      callIndex += 1;
      // Hook calls useMutation twice: first for single, second for all. Odd => single, even => all
      if (callIndex % 2 === 1) {
        return [mockCommitMutation, false];
      }
      return [mockCommitAllMutation, false];
    });
  });

  it("transactions all requires filters else throw", () => {
    const { result } = renderHook(() =>
      useTransactionSetCategory({
        onCompleted: jest.fn(),
        transactions: "all",
      }),
    );
    expect(() => act(() => result.current.onSave("cat1"))).toThrow(
      "Filters state is unknown",
    );
  });

  it("transactions all commits commitAllMutation with category and filters variables", () => {
    const onCompleted = jest.fn();
    const filters = { onlyIncome: false } as unknown as FiltersState;
    const { result } = renderHook(() =>
      useTransactionSetCategory({ filters, onCompleted, transactions: "all" }),
    );
    act(() => result.current.onSave("cat123"));
    expect(mockCommitAllMutation).toHaveBeenCalled();
    const callArg = mockCommitAllMutation.mock.calls[0][0];
    expect(callArg.variables).toEqual({ category: "cat123", filters });
    act(() => callArg.onCompleted({}));
    expect(mockPublish).toHaveBeenCalledWith(PubSubChannels.Transactions);
    expect(onCompleted).toHaveBeenCalled();
  });

  it("transactions all onCompleted with message sets error state", () => {
    const { result } = renderHook(() =>
      useTransactionSetCategory({
        filters: {} as unknown as FiltersState,
        onCompleted: jest.fn(),
        transactions: "all",
      }),
    );
    act(() => result.current.onSave("cat1"));
    const callArg = mockCommitAllMutation.mock.calls[0][0];
    act(() =>
      callArg.onCompleted({
        updateCategoriesForAllTransactions: { message: "Error occurred" },
      }),
    );
    expect(result.current.error).toBe("Error occurred");
    expect(mockPublish).not.toHaveBeenCalled();
  });

  it("else commits commitMutation with mapped transactions variables preserving category override", () => {
    const onCompleted = jest.fn();
    const transactions = [
      { amount: 1000, transaction: "t1" },
      { amount: 2000, category: "existing", transaction: "t2" },
    ];
    const { result } = renderHook(() =>
      useTransactionSetCategory({ onCompleted, transactions }),
    );
    act(() => result.current.onSave("newCat"));
    expect(mockCommitMutation).toHaveBeenCalled();
    const callArg = mockCommitMutation.mock.calls[0][0];
    expect(callArg.variables).toEqual({
      transactions: [
        { amount: 1000, category: "newCat", transaction: "t1" },
        { amount: 2000, category: "existing", transaction: "t2" },
      ],
    });
    act(() => callArg.onCompleted({}));
    expect(mockPublish).toHaveBeenCalledWith(PubSubChannels.Transactions);
    expect(onCompleted).toHaveBeenCalled();
  });

  it("onCompleted with message sets error for single mutation path", () => {
    const { result } = renderHook(() =>
      useTransactionSetCategory({
        onCompleted: jest.fn(),
        transactions: [{ amount: 500, transaction: "t1" }],
      }),
    );
    act(() => result.current.onSave("cat"));
    const callArg = mockCommitMutation.mock.calls[0][0];
    act(() =>
      callArg.onCompleted({
        updateCategoriesForTransactions: { message: "Failed" },
      }),
    );
    expect(result.current.error).toBe("Failed");
  });

  it("returns error null initially and isMutationInFlight ORed", () => {
    mockedUseMutation.mockImplementationOnce(() => [jest.fn(), true]);
    mockedUseMutation.mockImplementationOnce(() => [jest.fn(), false]);
    const { result } = renderHook(() =>
      useTransactionSetCategory({
        onCompleted: jest.fn(),
        transactions: [],
      }),
    );
    expect(result.current.error).toBeNull();
    expect(result.current.isMutationInFlight).toBe(true);
  });

  it("onSave returns early when key null", () => {
    const { result } = renderHook(() =>
      useTransactionSetCategory({
        onCompleted: jest.fn(),
        transactions: [],
      }),
    );
    act(() => result.current.onSave(null));
    expect(mockCommitMutation).not.toHaveBeenCalled();
    expect(mockCommitAllMutation).not.toHaveBeenCalled();
  });
});
