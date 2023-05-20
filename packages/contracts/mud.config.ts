import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  tables: {
    Counter: {
      keySchema: {},
      schema: "uint32",
    },
    AddressBook: {
      schema: "address",
      keySchema: {}
    },
    Swap: {
      schema: {
        assetIn: "address",
        assetOut: "address",
        amount: "uint256"
      }
    }
  },
});
