import { useRows } from "@latticexyz/react";
import { useMUD } from "./MUDContext";

export const App = () => {
  const {
    // components: { Counter, AddressBook },
    // systemCalls: { increment },
    network: { storeCache },
  } = useMUD();

  const swaps = useRows(storeCache, { table: "Swap" });
  console.log(swaps.length);
  
  return (
    <>
      {/* <button
        type="button"
        onClick={async (event) => {
          event.preventDefault();
          console.log("new counter value:", await increment());
        }}
      >
        Increment
      </button> */}
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
