// backend/testBlock.js

const path = require("path");
const Block = require("./blockchain/Block");

// Just a dummy "transaction" payload for testing.
const sampleTx = {
  type: "DEPARTMENT_CREATE",
  departmentName: "School of Computing",
  status: "active",
};

function main() {
  const index = 1; // for test purposes
  const timestamp = new Date().toISOString();
  const prev_hash =
    "0000000000000000000000000000000000000000000000000000000000000000";

  const block = new Block(index, timestamp, sampleTx, prev_hash);

  console.log("Before mining:");
  console.log({
    index: block.index,
    timestamp: block.timestamp,
    prev_hash: block.prev_hash,
    nonce: block.nonce,
    hash: block.hash,
  });

  // mine with difficulty 4 so hash starts with "0000"
  block.mineBlock(4);

  console.log("\nAfter mining:");
  console.log({
    index: block.index,
    timestamp: block.timestamp,
    prev_hash: block.prev_hash,
    nonce: block.nonce,
    hash: block.hash,
  });
}

main();
