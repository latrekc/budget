import { useRef } from "react";

type DeferredPromise<DeferType> = {
  promise: Promise<DeferType>;
  reject: (value: unknown) => void;
  resolve: (value: DeferType) => void;
};

export function useDeferredPromise<DeferType>() {
  const deferRef = useRef<DeferredPromise<DeferType>>();

  const defer = () => {
    const deferred = {} as DeferredPromise<DeferType>;

    const promise = new Promise<DeferType>((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });

    deferred.promise = promise;
    deferRef.current = deferred;
    return deferRef.current;
  };

  return { defer, deferRef: deferRef.current };
}
