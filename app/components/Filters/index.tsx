import { Accordion, AccordionItem, Badge } from "@nextui-org/react";
import { graphql, useFragment } from "react-relay";
import FiltersCategories from "./FiltersCategories";
import FiltersMonths from "./FiltersMonths";
import { useFilters } from "./FiltersProvider";
import FiltersSources from "./FiltersSources";
import { Filters$key } from "./__generated__/Filters.graphql";

export default function Filters({ data: data$key }: { data: Filters$key }) {
  const data = useFragment(
    graphql`
      fragment Filters on Query {
        ...FiltersCategories
        ...FiltersMonths
      }
    `,
    data$key,
  );

  const { dispatch, filtersState } = useFilters();

  return (
    <Accordion defaultSelectedKeys={["categories"]} variant="shadow">
      <AccordionItem
        key="categories"
        title={
          <AccordionItemTitle
            list={[
              ...(filtersState.categories ?? []),
              ...(filtersState.ignoreCategories ?? []),
            ]}
            name="Categories"
          />
        }
      >
        <FiltersCategories
          categories={data}
          dispatch={dispatch}
          filters={filtersState}
        />
      </AccordionItem>

      <AccordionItem
        key="months"
        title={<AccordionItemTitle list={filtersState.months} name="Months" />}
      >
        <FiltersMonths
          dispatch={dispatch}
          filters={filtersState}
          statistic={data}
        />
      </AccordionItem>
      <AccordionItem
        key="sources"
        title={
          <AccordionItemTitle list={filtersState.sources} name="Sources" />
        }
      >
        <FiltersSources dispatch={dispatch} filters={filtersState} />
      </AccordionItem>
    </Accordion>
  );
}

function AccordionItemTitle({
  list,
  name,
}: {
  list: null | readonly string[];
  name: string;
}) {
  return (
    <Badge
      color="primary"
      content={(list ?? []).length > 0 ? list?.length : null}
      placement="top-right"
      shape="rectangle"
      showOutline={false}
      size="sm"
      variant="solid"
    >
      <div className="pr-2">{name}</div>
    </Badge>
  );
}
