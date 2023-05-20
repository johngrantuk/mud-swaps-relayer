import { useComponentValue, useRows } from "@latticexyz/react";
import { useMUD } from "./MUDContext";

export const App = () => {
  const {
    components: { Counter, AddressBook },
    systemCalls: { increment },
    network: { singletonEntity, storeCache },
  } = useMUD();

  const counter = useComponentValue(Counter, singletonEntity);
  const addressBook = useComponentValue(AddressBook, singletonEntity);
  const swaps = useRows(storeCache, { table: "Swap" });
  console.log(swaps.length);
  
  return (
    <>
      <div>
        Counter: <span>{counter?.value ?? "??"}</span>
      </div>
      <button
        type="button"
        onClick={async (event) => {
          event.preventDefault();
          console.log("new counter value:", await increment());
        }}
      >
        Increment
      </button>
      <div>
        Addr: <span>{addressBook?.value ?? "??"}</span>
      </div>
      <span>Swaps:</span>
      <ul>
        {swaps.map(({ value }, increment) => (
          <li key={increment}>
            {value.assetIn}, {value.assetOut} {value.amount.toString()}
          </li>
        ))}
      </ul>
    </>
  );
};
