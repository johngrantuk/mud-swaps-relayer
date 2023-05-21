import { useRows } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import Dino from "./dino/dino";

export const App = () => {
  const {
    // components: { Counter, AddressBook },
    // systemCalls: { increment },
    network: { storeCache },
  } = useMUD();

  const cacti = [1];

  const toggle = () => {
    cacti.push(1);
    console.log(`TEST`, cacti.length);
  }

  const swaps = useRows(storeCache, { table: "Swap" });
  console.log(swaps.length);
  
  return (
    <>
      {/* <Dino cacti={cacti}/> */}
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
