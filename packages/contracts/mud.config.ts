import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  tables: {
    Swap: {
      schema: {
        assetIn: "address",
        assetOut: "address",
        amount: "uint256",
        amountReturned: "uint256"
      }
    }
  },
});
