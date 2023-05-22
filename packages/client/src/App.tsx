import { useRows } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import Dino from "./dino/dino";

export const App = () => {
  const {
    // components: { Counter, AddressBook },
    systemCalls: { worldSwap },
    network: { storeCache },
  } = useMUD();

  const toggle = async () => {
    // Just using harcoded swap data for now. In reality we'd use something like SmartOrderRouter to find best swap for pair.
    await worldSwap(
      '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014', 
      '0xba100000625a3754423978a60c9317c58a424e3d', 
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 
      '1000000000000000'
    );
  }

  const swaps = useRows(storeCache, { table: "Swap" });
  const cacti = swaps.map((s, i) => i);
  if(cacti.length === 0) cacti.push(1);
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
