import { PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
import {
  Button,
  ButtonGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spacer,
} from "@nextui-org/react";
import { format } from "date-format-parse";
import { useCallback } from "react";
import { TiDelete } from "react-icons/ti";
import { graphql, useFragment, useMutation } from "react-relay";
import { RateDeleteCell$key } from "./__generated__/RateDeleteCell.graphql";
import { RateDeleteCellMutation } from "./__generated__/RateDeleteCellMutation.graphql";

export default function RateDeleteCell({
  rate: rate$key,
}: {
  rate: RateDeleteCell$key;
}) {
  const { base, date, id, target } = useFragment(
    graphql`
      fragment RateDeleteCell on CurrencyExchangeRate {
        id @required(action: THROW)
        base @required(action: THROW)
        target @required(action: THROW)
        date @required(action: THROW)
      }
    `,
    rate$key,
  );

  const { publish } = usePubSub();

  const [commitDeleteMutation, isDeleteMutationInFlight] =
    useMutation<RateDeleteCellMutation>(graphql`
      mutation RateDeleteCellMutation($id: String!) {
        deleteCurrencyExhangeRate(id: $id) {
          ... on Error {
            error: message
          }
        }
      }
    `);

  const onDelete = useCallback(() => {
    commitDeleteMutation({
      onCompleted(result) {
        if (result?.deleteCurrencyExhangeRate?.error) {
          alert(result.deleteCurrencyExhangeRate.error);
        } else {
          publish(PubSubChannels.CurrencyExchangeRates);
        }
      },
      variables: {
        id,
      },
    });
  }, [commitDeleteMutation, id, publish]);

  return (
    <Popover backdrop="opaque" showArrow>
      <PopoverTrigger>
        <Button
          color="danger"
          isIconOnly
          size="sm"
          title="Remove category"
          variant="solid"
        >
          <TiDelete color="white" size="2em" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px]">
        {() => (
          <div className="w-full p-4">
            <p className="text-small text-foreground">
              Are sure you want to remove exchange rate between {base} and{" "}
              {target} on {format(date, "D MMMM YYYY, dddd")}?
            </p>

            <Spacer />

            <ButtonGroup>
              <Button
                color="danger"
                isDisabled={isDeleteMutationInFlight}
                onClick={onDelete}
              >
                Yes, remove
              </Button>
            </ButtonGroup>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
