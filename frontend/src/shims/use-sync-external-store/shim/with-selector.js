import * as React from 'react';

const { useSyncExternalStore, useRef, useEffect, useMemo, useDebugValue } = React;

function is(x, y) {
  return (x === y && (0 !== x || 1 / x === 1 / y)) || (x !== x && y !== y);
}
const objectIs = typeof Object.is === 'function' ? Object.is : is;

export function useSyncExternalStoreWithSelector(
  subscribe,
  getSnapshot,
  getServerSnapshot,
  selector,
  isEqual
) {
  const instRef = useRef(null);
  let inst;
  if (null === instRef.current) {
    inst = { hasValue: false, value: null };
    instRef.current = inst;
  } else {
    inst = instRef.current;
  }

  const [getSelection, getServerSelection] = useMemo(
    function () {
      let hasMemo = false;
      let memoizedSnapshot;
      let memoizedSelection;

      function memoizedSelector(nextSnapshot) {
        if (!hasMemo) {
          hasMemo = true;
          memoizedSnapshot = nextSnapshot;
          const nextSelection = selector(nextSnapshot);
          if (undefined !== isEqual && inst.hasValue) {
            const currentSelection = inst.value;
            if (isEqual(currentSelection, nextSelection)) {
              return (memoizedSelection = currentSelection);
            }
          }
          return (memoizedSelection = nextSelection);
        }

        const currentSelection = memoizedSelection;
        if (objectIs(memoizedSnapshot, nextSnapshot)) {
          return currentSelection;
        }

        const nextSelection = selector(nextSnapshot);
        if (undefined !== isEqual && isEqual(currentSelection, nextSelection)) {
          memoizedSnapshot = nextSnapshot;
          return currentSelection;
        }

        memoizedSnapshot = nextSnapshot;
        return (memoizedSelection = nextSelection);
      }

      const maybeGetServerSnapshot =
        undefined === getServerSnapshot ? null : getServerSnapshot;

      return [
        function () {
          return memoizedSelector(getSnapshot());
        },
        null === maybeGetServerSnapshot
          ? undefined
          : function () {
              return memoizedSelector(maybeGetServerSnapshot());
            }
      ];
    },
    [getSnapshot, getServerSnapshot, selector, isEqual]
  );

  const value = useSyncExternalStore(subscribe, getSelection, getServerSelection);

  useEffect(
    function () {
      inst.hasValue = true;
      inst.value = value;
    },
    [value]
  );

  useDebugValue(value);
  return value;
}

export default useSyncExternalStoreWithSelector;