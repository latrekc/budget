import TransactionSourceCell from "@/components/Transactions/cell/TransactionSourceCell";
import { TransactionSourceCell$key } from "@/components/Transactions/cell/__generated__/TransactionSourceCell.graphql";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { asFragment } from "../../../utils/fragment";

jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useFragment: jest.fn((_, data) => data),
}));

jest.mock("@/components/SourceImage", () => {
  const React = jest.requireActual("react") as typeof import("react");
  return function MockSourceImage(props: Record<string, unknown>) {
    return React.createElement("img", {
      alt: props.source,
      "data-testid": "source-image",
      src: `/assets/sources/${props.source}.svg`,
    });
  };
});

import { useFragment } from "react-relay";

describe("TransactionSourceCell", () => {
  it("renders SourceImage with source prop", () => {
    (useFragment as jest.Mock).mockReturnValue({ source: "Barclays" });
    render(
      <TransactionSourceCell
        transaction={asFragment<TransactionSourceCell$key>({})}
      />,
    );
    const img = screen.getByTestId("source-image");
    expect(img).toHaveAttribute("alt", "Barclays");
    expect(img).toHaveAttribute("src", "/assets/sources/Barclays.svg");
  });

  it("handles all 8 source values correctly", () => {
    const sources = [
      "Barclays",
      "HSBC",
      "Monzo",
      "Raiffeisen",
      "Revolut",
      "Sberbank",
      "Tinkoff",
      "Wise",
    ];
    sources.forEach((src, _idx) => {
      (useFragment as jest.Mock).mockReturnValue({ source: src });
      const { unmount } = render(
        <TransactionSourceCell
          transaction={asFragment<TransactionSourceCell$key>({})}
        />,
      );
      expect(screen.getByTestId("source-image")).toHaveAttribute(
        "src",
        `/assets/sources/${src}.svg`,
      );
      unmount();
    });
  });
});
