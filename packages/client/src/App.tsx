import { useComponentValue } from "@latticexyz/react";
import { useMUD } from "./MUDContext";

export const App = () => {
  const {
    components: { Counter, AddressBook },
    systemCalls: { increment },
    network: { singletonEntity },
  } = useMUD();

  const counter = useComponentValue(Counter, singletonEntity);
  const addressBook = useComponentValue(AddressBook, singletonEntity);

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
    </>
  );
};
