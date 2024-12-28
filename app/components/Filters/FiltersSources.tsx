import { Checkbox, CheckboxGroup, Chip } from "@nextui-org/react";
import { Dispatch, useCallback, useMemo } from "react";

import { Currency } from "@/lib/types";
import { graphql, useFragment } from "react-relay";
import AmountValue from "../AmountValue";
import SourceImage from "../SourceImage";
import {
  FiltersReducerAction,
  FiltersReducerActionType,
  FiltersState,
} from "./FiltersReducer";
import { FiltersSources$key } from "./__generated__/FiltersSources.graphql";

export default function FiltersSources({
  dispatch,
  filters,
  statistic: statistic$key,
}: {
  dispatch: Dispatch<FiltersReducerAction>;
  filters: FiltersState;
  statistic: FiltersSources$key;
}) {
  const data = useFragment(
    graphql`
      fragment FiltersSources on Query {
        transactionsStatisticPerSource {
          id @required(action: THROW)
          income @required(action: THROW)
          outcome @required(action: THROW)
          source @required(action: THROW)
        }
      }
    `,
    statistic$key,
  );

  const sources = useMemo(
    () => data.transactionsStatisticPerSource ?? [],
    [data.transactionsStatisticPerSource],
  );

  const setSelected = useCallback(
    (value: string[]) => {
      dispatch({
        payload:
          value.length > 0 && value.length < sources.length ? value : null,
        type: FiltersReducerActionType.SetSources,
      });
    },
    [dispatch, sources.length],
  );

  const value = useMemo(
    () => (filters.sources != null ? [...filters.sources] : []),
    [filters.sources],
  );

  const onRemove = useCallback(
    (toRemove: string) => {
      const newValue = filters.sources!.filter((item) => item !== toRemove);

      dispatch({
        payload: newValue.length ? newValue : null,
        type: FiltersReducerActionType.SetSources,
      });
    },
    [dispatch, filters.sources],
  );

  return (
    <>
      {filters.sources && (
        <div className="inline-flex flex-wrap items-center justify-start gap-2 pb-3">
          {filters.sources?.map((source) => (
            <Chip key={source} onClose={() => onRemove(source)} variant="flat">
              {source}
            </Chip>
          ))}
        </div>
      )}

      <CheckboxGroup
        classNames={{
          wrapper: "gap-1",
        }}
        onValueChange={setSelected}
        value={value}
      >
        {sources.map(({ income, outcome, source }) => (
          <Checkbox
            className="m-0 min-w-[100%] flex-none cursor-pointer gap-2 rounded-lg border-2 border-white p-4 hover:bg-content2 data-[selected=true]:border-primary"
            key={source}
            value={source}
          >
            <div className="flex flex-row items-center gap-4 text-xl">
              <SourceImage source={source} />
              <span>{source}</span>
              {income !== 0 && (
                <AmountValue amount={income} currency={Currency.GBP} round />
              )}
              {income !== 0 && outcome !== 0 && " / "}
              {outcome !== 0 && (
                <AmountValue amount={outcome} currency={Currency.GBP} round />
              )}
            </div>
          </Checkbox>
        ))}
      </CheckboxGroup>
    </>
  );
}
