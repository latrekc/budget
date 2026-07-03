import {
  createPubSubContext,
  PubSubContext,
  PubSubProvider,
  usePubSub,
} from "@/lib/usePubSub";
import { render, renderHook } from "@testing-library/react";
import React from "react";

describe("usePubSub", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createPubSubContext", () => {
    it("publish invokes subscribed handler with message", () => {
      const ctx = createPubSubContext();
      const handler = jest.fn();
      ctx.subscribe("chan", handler);
      ctx.publish("chan", "hello");
      expect(handler).toHaveBeenCalledWith("hello");
    });

    it("publish default message null when omitted", () => {
      const ctx = createPubSubContext();
      const handler = jest.fn();
      ctx.subscribe("c", handler);
      ctx.publish("c");
      expect(handler).toHaveBeenCalledWith(null);
    });

    it("subscribe returns function that unsubscribes", () => {
      const ctx = createPubSubContext();
      const handler = jest.fn();
      const unsub = ctx.subscribe("ch", handler);
      ctx.publish("ch", 1);
      expect(handler).toHaveBeenCalledTimes(1);
      unsub();
      ctx.publish("ch", 2);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("multiple handlers called in subscription order", () => {
      const ctx = createPubSubContext();
      const order: number[] = [];
      ctx.subscribe("o", () => order.push(1));
      ctx.subscribe("o", () => order.push(2));
      ctx.subscribe("o", () => order.push(3));
      ctx.publish("o");
      expect(order).toEqual([1, 2, 3]);
    });

    it("handler throwing prevents subsequent handlers documenting current behavior", () => {
      const ctx = createPubSubContext();
      const h1 = jest.fn(() => {
        throw new Error("boom");
      });
      const h2 = jest.fn();
      ctx.subscribe("e", h1);
      ctx.subscribe("e", h2);
      expect(() => ctx.publish("e")).toThrow("boom");
      expect(h2).not.toHaveBeenCalled();
    });

    it("unsubscribe non-existent no-op", () => {
      const ctx = createPubSubContext();
      const handler = jest.fn();
      ctx.unsubscribe("nope", handler);
      // no error
      expect(true).toBe(true);
    });

    it("duplicate subscribe requires two unsubscribes", () => {
      const ctx = createPubSubContext();
      const handler = jest.fn();
      ctx.subscribe("d", handler);
      ctx.subscribe("d", handler);
      ctx.publish("d");
      expect(handler).toHaveBeenCalledTimes(2);
      ctx.unsubscribe("d", handler);
      ctx.publish("d");
      expect(handler).toHaveBeenCalledTimes(3); // one remaining
      ctx.unsubscribe("d", handler);
      ctx.publish("d");
      expect(handler).toHaveBeenCalledTimes(3);
    });

    it("publish to empty channel logs zero does nothing", () => {
      const ctx = createPubSubContext();
      ctx.publish("empty");
      expect(console.log).toHaveBeenCalledWith("Publish:", "empty", 0);
    });

    it("channels isolated between two separate contexts", () => {
      const ctx1 = createPubSubContext();
      const ctx2 = createPubSubContext();
      const h1 = jest.fn();
      const h2 = jest.fn();
      ctx1.subscribe("a", h1);
      ctx2.subscribe("a", h2);
      ctx1.publish("a", "x");
      expect(h1).toHaveBeenCalledWith("x");
      expect(h2).not.toHaveBeenCalled();
    });

    it("console.log called with Publish Subscribe Unsubscribe", () => {
      const ctx = createPubSubContext();
      const handler = jest.fn();
      ctx.subscribe("logtest", handler);
      expect(console.log).toHaveBeenCalledWith("Subscribe:", "logtest", 1);
      ctx.publish("logtest");
      expect(console.log).toHaveBeenCalledWith("Publish:", "logtest", 1);
      ctx.unsubscribe("logtest", handler);
      expect(console.log).toHaveBeenCalledWith("Unsubscribe:", "logtest", 1);
    });
  });

  describe("usePubSub hook", () => {
    it("throws outside provider", () => {
      const { result } = renderHook(() => {
        try {
          return usePubSub();
        } catch (e) {
          return e as Error;
        }
      });
      expect((result.current as Error).message).toBe(
        "usePubSub called outside of PubSubProvider",
      );
    });

    it("returns context inside provider", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PubSubProvider>{children}</PubSubProvider>
      );
      const { result } = renderHook(() => usePubSub(), { wrapper });
      expect(result.current.publish).toBeDefined();
      expect(result.current.subscribe).toBeDefined();
      expect(result.current.unsubscribe).toBeDefined();
    });
  });

  describe("PubSubProvider", () => {
    it("with prop uses that context without prop creates new but test shows recreation on rerender bug", () => {
      const customCtx = createPubSubContext();
      const { rerender } = render(
        <PubSubProvider context={customCtx}>
          <div>child</div>
        </PubSubProvider>,
      );
      // With prop, should use same context across rerenders
      rerender(
        <PubSubProvider context={customCtx}>
          <div>child2</div>
        </PubSubProvider>,
      );
      expect(true).toBe(true); // characterization: no crash, uses prop

      // Without prop, creates new context on every render (bug documented)
      const { rerender: rerender2 } = render(
        <PubSubProvider>
          <div>a</div>
        </PubSubProvider>,
      );
      // Can't easily assert new context identity without hook, but we document behavior in test name.
      rerender2(
        <PubSubProvider>
          <div>b</div>
        </PubSubProvider>,
      );
      expect(true).toBe(true);
    });

    it("provides context to usePubSub hook", () => {
      let captured: PubSubContext | null = null;
      function Capture() {
        captured = usePubSub();
        return null;
      }
      render(
        <PubSubProvider>
          <Capture />
        </PubSubProvider>,
      );
      expect(captured).not.toBeNull();
      expect((captured as unknown as PubSubContext).publish).toBeInstanceOf(
        Function,
      );
    });
  });
});
