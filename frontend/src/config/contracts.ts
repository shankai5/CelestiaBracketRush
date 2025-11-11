// CelestiaBracketRush Contract Configuration
// Network: Sepolia Testnet
// DO NOT modify this file directly - it's auto-generated from contract compilation

export const CONTRACT_ADDRESS = "0xF5A102A2901E5b8d14d398ed186696C6A4040ebD";

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "AlreadyClaimed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "AlreadyEntered",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "AlreadySettled",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "BracketExists",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "BracketMissing",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EntryNotFound",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidDuration",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidFee",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidMatches",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidPick",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Locked",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotRefundable",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotSettled",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotWinner",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ZamaProtocolUnsupported",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "bracketId",
        "type": "string"
      }
    ],
    "name": "BracketCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "bracketId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "entryFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "lockTime",
        "type": "uint256"
      }
    ],
    "name": "BracketCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "bracketId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "pushAll",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "winnerCount",
        "type": "uint256"
      }
    ],
    "name": "BracketSettled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "bracketId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "EntryAdjusted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "bracketId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "EntrySubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "bracketId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "winner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "PrizeClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "bracketId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "RefundClaimed",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "MAX_DURATION",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_MATCHES",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MIN_DURATION",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MIN_ENTRY_FEE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MIN_MATCHES",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "OUTCOME_DRAW",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "OUTCOME_LEFT",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "OUTCOME_RIGHT",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "bracketId",
        "type": "string"
      },
      {
        "internalType": "uint8[]",
        "name": "newPicks",
        "type": "uint8[]"
      },
      {
        "internalType": "externalEuint64",
        "name": "newEncryptedWeight",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "proof",
        "type": "bytes"
      }
    ],
    "name": "adjustReplicaEntry",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "bracketId",
        "type": "string"
      }
    ],
    "name": "cancelReplicaBracket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "bracketId",
        "type": "string"
      }
    ],
    "name": "claimReplicaPrize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "bracketId",
        "type": "string"
      }
    ],
    "name": "claimReplicaRefund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "confidentialProtocolId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "bracketId",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "entryFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "duration",
        "type": "uint256"
      },
      {
        "internalType": "string[]",
        "name": "labels",
        "type": "string[]"
      },
      {
        "internalType": "string[]",
        "name": "optionsLeft",
        "type": "string[]"
      },
      {
        "internalType": "string[]",
        "name": "optionsRight",
        "type": "string[]"
      },
      {
        "internalType": "bool[]",
        "name": "allowDraw",
        "type": "bool[]"
      }
    ],
    "name": "createReplicaBracket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "bracketId",
        "type": "string"
      },
      {
        "internalType": "uint8[]",
        "name": "picks",
        "type": "uint8[]"
      },
      {
        "internalType": "externalEuint64",
        "name": "encryptedWeight",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "proof",
        "type": "bytes"
      }
    ],
    "name": "enterReplicaBracket",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "bracketId",
        "type": "string"
      }
    ],
    "name": "getReplicaBracket",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "entryFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lockTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "prizePool",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "cancelled",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "settled",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "pushAll",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "winnerCount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "bracketId",
        "type": "string"
      }
    ],
    "name": "getReplicaMatchups",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "label",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "optionLeft",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "optionRight",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "allowDraw",
            "type": "bool"
          },
          {
            "internalType": "euint64",
            "name": "leftExposure",
            "type": "bytes32"
          },
          {
            "internalType": "euint64",
            "name": "rightExposure",
            "type": "bytes32"
          },
          {
            "internalType": "euint64",
            "name": "drawExposure",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "picksLeft",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "picksRight",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "picksDraw",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "correctOption",
            "type": "uint8"
          }
        ],
        "internalType": "struct CelestiaBracketRush.MatchUp[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "listReplicaBrackets",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "bracketId",
        "type": "string"
      }
    ],
    "name": "settleReplicaBracket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// Contract Constants
export const MIN_ENTRY_FEE = "1000000000000000"; // 0.001 ETH in wei
export const MIN_DURATION = 1800; // 30 minutes in seconds
export const MAX_DURATION = 7257600; // ~84 days in seconds
export const MIN_MATCHES = 2;
export const MAX_MATCHES = 12;

// Outcome constants
export const OUTCOME_LEFT = 0;
export const OUTCOME_RIGHT = 1;
export const OUTCOME_DRAW = 2;
