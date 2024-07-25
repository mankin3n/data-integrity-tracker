
# Data Integrity Tracker

## Mission

The main mission of the Data Integrity Tracker is to ensure the integrity of digital files by leveraging blockchain technology. This application allows users to upload files, compute their cryptographic hashes, and store these hashes on the blockchain. By doing so, users can verify the integrity of their files at any point in time by comparing the current hash of the file with the hash stored on the blockchain. This ensures that any tampering or modifications to the file can be detected easily.

## Features

- **File Upload**: Upload any file to the application.
- **Hash Computation**: Compute the cryptographic hash of the uploaded file.
- **Blockchain Storage**: Store the file hash and metadata on the blockchain.
- **Integrity Verification**: Verify the integrity of the file by comparing its current hash with the one stored on the blockchain.
- **Logging**: Detailed logs for every step of the process to ensure transparency and traceability.

## Setup

### Prerequisites

- Node.js (v14 or higher)
- Yarn
- Ganache CLI (for local blockchain development)
- MetaMask (for interacting with the blockchain)

### Installation

1. **Clone the repository**:
    ```bash
    git clone <repository_url>
    cd data-integrity-tracker
    ```

2. **Install dependencies**:
    ```bash
    yarn install
    ```

3. **Start Ganache CLI**:
    ```bash
    ganache-cli
    ```

4. **Deploy the smart contract**:
    Ensure your `truffle-config.js` is set up to connect to the local Ganache instance:
    ```javascript
    module.exports = {
      networks: {
        development: {
          host: "127.0.0.1",
          port: 8545,
          network_id: "*", // Match any network id
        },
      },
      compilers: {
        solc: {
          version: "0.8.0", // Fetch exact version from solc-bin (default: truffle's version)
        },
      },
    };
    ```

    Deploy the contract:
    ```bash
    truffle migrate --network development
    ```

    The contract address will be output in the terminal after a successful deployment. Update your `.env` file with this address and other necessary details.

5. **Setup environment variables**:
    Create a `.env` file in the root directory and add the following environment variables:
    ```
    REACT_APP_NETWORK=local
    REACT_APP_CONTRACT_ADDRESS=<your_deployed_contract_address>
    REACT_APP_PRIVATE_KEY=<private_key_from_ganache>
    ```

6. **Start the application**:
    ```bash
    yarn start
    ```

## Usage

1. **Upload File**:
    - Select a file to upload by clicking on the file input.
    - Click "Upload File" to compute the file's hash.

2. **Add to Blockchain**:
    - After the file is uploaded and the hash is computed, click "Add to Blockchain" to store the file hash and metadata on the blockchain.

3. **Verify File**:
    - To verify a file, upload the file again and click "Verify File". The application will compute the hash and compare it with the one stored on the blockchain.

## Screenshots

### Main Interface
![Main Interface](screenshot.png)

## Technologies Used

- **React**: For the front-end user interface.
- **Ethers.js**: To interact with the Ethereum blockchain.
- **Ganache CLI**: For local blockchain development.
- **Truffle**: For smart contract deployment.
- **Solidity**: For writing the smart contract.

## Smart Contract

### FileHashStore.sol

The `FileHashStore` contract is used to store file hashes and metadata on the blockchain.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileHashStore {
    struct FileMetadata {
        string fileName;
        uint256 fileSize;
        address owner;
        uint256[] timestamps;
    }

    mapping(bytes32 => FileMetadata) private files;

    event FileStored(bytes32 indexed fileHash, string fileName, uint256 fileSize, address indexed owner);

    function storeFileHash(bytes32 _fileHash, string memory _fileName, uint256 _fileSize) public {
        FileMetadata storage metadata = files[_fileHash];
        metadata.fileName = _fileName;
        metadata.fileSize = _fileSize;
        metadata.owner = msg.sender;
        metadata.timestamps.push(block.timestamp);

        emit FileStored(_fileHash, _fileName, _fileSize, msg.sender);
    }

    function getFileMetadata(bytes32 _fileHash) public view returns (string memory, uint256, address, uint256[] memory) {
        FileMetadata storage metadata = files[_fileHash];
        return (metadata.fileName, metadata.fileSize, metadata.owner, metadata.timestamps);
    }

    function getFileHashTimestamps(bytes32 _fileHash) public view returns (uint256[] memory) {
        FileMetadata storage metadata = files[_fileHash];
        return metadata.timestamps;
    }
}
```

## Contribution

Feel free to fork this repository, create issues, and submit pull requests. All contributions are welcome!

## License

This project is licensed under the MIT License.
