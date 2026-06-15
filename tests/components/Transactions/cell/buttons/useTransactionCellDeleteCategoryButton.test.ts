import { useTransactionCellDeleteCategoryButton$key } from "@/components/Transactions/cell/buttons/__generated__/useTransactionCellDeleteCategoryButton.graphql";
import useTransactionCellDeleteCategoryButton from "@/components/Transactions/cell/buttons/useTransactionCellDeleteCategoryButton";
import { PubSubChannels } from "@/lib/types";
import { act, renderHook } from "@testing-library/react";
import { asFragment } from "../../../../utils/fragment";

const mockPublish = jest.fn();
const mockCommit = jest.fn();

jest.mock("@/lib/usePubSub", () => ({
  usePubSub: () => ({ publish: mockPublish }),
}));

jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useFragment: jest.fn((_: unknown, key) => key),
  useMutation: jest.fn(() => [mockCommit, false]),
}));

import { useFragment, useMutation } from "react-relay";

describe("useTransactionCellDeleteCategoryButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFragment as jest.Mock).mockImplementation((_: unknown, key) => key);
    (useMutation as jest.Mock).mockReturnValue([mockCommit, false]);
  });

  const recordKey = asFragment<useTransactionCellDeleteCategoryButton$key>({
    category: { id: "cat1" },
    transaction: { id: "tx1" },
  });

  it("returns isDisabledDelete false initially and onDelete commits mutation", () => {
    const { result } = renderHook(() =>
      useTransactionCellDeleteCategoryButton(recordKey),
    );
    expect(result.current.isDisabledDelete).toBe(false);
    act(() => result.current.onDelete());
    expect(mockCommit).toHaveBeenCalled();
    const arg = mockCommit.mock.calls[0][0];
    expect(arg.variables).toEqual({
      transactions: [{ amount: 0, category: "cat1", transaction: "tx1" }],
    });
    act(() => arg.onCompleted());
    expect(mockPublish).toHaveBeenCalledWith(PubSubChannels.Transactions);
  });

  it("isDisabledDelete true when mutation in flight", () => {
    (useMutation as jest.Mock).mockReturnValue([mockCommit, true]);
    const { result } = renderHook(() =>
      useTransactionCellDeleteCategoryButton(recordKey),
    );
    expect(result.current.isDisabledDelete).toBe(true);
  });
});
