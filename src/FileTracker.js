import React, { useState } from 'react';
import { ethers } from 'ethers';
import { keccak256, arrayify } from 'ethers/lib/utils';

const FileTracker = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [hash, setHash] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [logs, setLogs] = useState([]);

  const providerUrl = process.env.REACT_APP_NETWORK === 'local'
    ? 'http://127.0.0.1:8545'
    : `https://sepolia.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`;

  const provider = new ethers.providers.JsonRpcProvider(providerUrl);

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const contractABI = [
    "function storeFileHash(bytes32 _fileHash, string memory _fileName, uint256 _fileSize) public",
    "function getFileMetadata(bytes32 _fileHash) public view returns (string memory, uint256, address, uint256[] memory)",
    "function getFileHashTimestamps(bytes32 _fileHash) public view returns (uint256[] memory)",
  ];

  const logStep = (message) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileSize(selectedFile.size);
      setUploaded(false);
      setLogs([]);
      setError(null); // Clear error when a new file is selected
      logStep("File selected: " + selectedFile.name);
    }
  };

  const handleUpload = async () => {
    setError(null); // Clear previous error
    if (file) {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = arrayify(new Uint8Array(e.target.result));
          logStep("File content read successfully");
          const computedHash = keccak256(content);
          logStep("Computed hash: " + computedHash);
          setHash(computedHash);

          setUploaded(true);
        } catch (err) {
          console.error('Error during file processing:', err);
          setError('Error computing hash or storing data: ' + err.message);
        } finally {
          setUploading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError('No file selected');
    }
  };

  const handleAddToChain = async () => {
    setError(null); // Clear previous error
    if (hash && fileName && fileSize) {
      try {
        const wallet = new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY, provider);
        logStep("Wallet created");
        const contract = new ethers.Contract(contractAddress, contractABI, wallet);
        logStep("Contract instance created");

        // Ensure hash is correctly formatted
        if (typeof hash !== 'string') {
          logStep("Invalid hash format");
          throw new Error('Invalid hash format');
        }

        // Store hash and metadata on-chain
        const tx = await contract.storeFileHash(hash, fileName, fileSize);
        logStep("Transaction sent: " + tx.hash);
        await tx.wait();
        logStep("Transaction confirmed");

        setFileId(hash); // Set file ID after transaction is confirmed
        logStep("File ID set: " + hash);
      } catch (err) {
        console.error('Error during blockchain interaction:', err);
        logStep('Error storing data on blockchain: ' + err.message);
        setError('Error storing data on blockchain: ' + err.message);
      }
    } else {
      setError('File hash, name, or size is missing');
    }
  };

  const handleVerify = async () => {
    setError(null); // Clear previous error
    if (!file) {
      setError('No file selected for verification');
      logStep('No file selected for verification');
      return;
    }

    if (!fileId) {
      setError('No file ID provided for verification');
      logStep('No file ID provided for verification');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = arrayify(new Uint8Array(e.target.result));
        logStep("File content read successfully for verification");
        const computedHash = keccak256(content);
        logStep("Computed hash for verification: " + computedHash);

        if (computedHash === fileId) {
          setHash(computedHash);
          const wallet = new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY, provider);
          logStep("Wallet created for verification");
          const contract = new ethers.Contract(contractAddress, contractABI, wallet);
          logStep("Contract instance created for verification");

          // Fetch and set the file hash history
          const metadata = await contract.getFileMetadata(computedHash);
          logStep("Metadata retrieved: " + JSON.stringify(metadata));
          setHistory(metadata[3]); // metadata[3] contains the timestamps array
        } else {
          setError('File content does not match the stored hash.');
          logStep('File content does not match the stored hash.');
        }
      } catch (err) {
        console.error('Error during verification:', err);
        logStep('Error computing hash or verifying data: ' + err.message);
        setError('Error computing hash or verifying data: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const renderHistory = () => {
    if (!history.length) {
      return <div>No history found for this hash.</div>;
    }

    return (
      <ul>
        {history.map((timestamp, index) => (
          <li key={index}>
            <div><strong>Timestamp:</strong> {new Date(timestamp * 1000).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="file-tracker">
      <input className="file-input" type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading || uploaded}>
        {uploading ? 'Uploading...' : 'Upload File'}
      </button>
      {uploaded && (
        <>
          <button onClick={handleAddToChain}>Add to Blockchain</button>
          <button onClick={handleVerify}>Verify File</button>
        </>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {hash && (
        <div>
          <h2>Computed Hash: {hash}</h2>
          <h2>File Name: {fileName}</h2>
          <h2>File Size: {fileSize} bytes</h2>
          <h2>File ID: {fileId}</h2>
          <h2>Hash History</h2>
          {renderHistory()}
        </div>
      )}
      <div className="logs" style={{ height: '200px', overflowY: 'auto', marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <h2>Logs</h2>
        <ul>
          {logs.map((log, index) => (
            <li key={index}>{log}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FileTracker;
