import { useRows } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import Dino from "./dino/dino";

export const App = () => {
  const {
    // components: { Counter, AddressBook },
    // systemCalls: { increment },
    network: { storeCache },
  } = useMUD();

  const toggle = () => {
    console.log(`TEST`);
  }

  const swaps = useRows(storeCache, { table: "Swap" });
  const cacti = swaps.map((s, i) => i);
  console.log(swaps.length);
  
  return (
    <>
      {<Dino cacti={cacti}/>}
      <hr/>
      <button
        type="button"
        onClick={async (event) => {
          event.preventDefault();
          toggle();
        }}
      >
        Swap
      </button>
      <div>Swaps:</div>
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
