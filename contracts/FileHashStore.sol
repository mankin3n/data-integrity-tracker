// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileHashStore {
    struct FileMetadata {
        string fileName;
        uint256 fileSize;
        address uploader;
        uint256[] timestamps;
    }

    mapping(bytes32 => FileMetadata) public files;
    bytes32[] public fileHashes;

    event FileStored(bytes32 indexed fileHash, string fileName, uint256 fileSize, address indexed uploader, uint256 timestamp);

    function storeFileHash(bytes32 _fileHash, string memory _fileName, uint256 _fileSize) public {
        FileMetadata storage file = files[_fileHash];
        file.fileName = _fileName;
        file.fileSize = _fileSize;
        file.uploader = msg.sender;
        file.timestamps.push(block.timestamp);

        fileHashes.push(_fileHash);

        emit FileStored(_fileHash, _fileName, _fileSize, msg.sender, block.timestamp);
    }

    function getFileMetadata(bytes32 _fileHash) public view returns (string memory, uint256, address, uint256[] memory) {
        FileMetadata memory file = files[_fileHash];
        return (file.fileName, file.fileSize, file.uploader, file.timestamps);
    }

    function getFileHashTimestamps(bytes32 _fileHash) public view returns (uint256[] memory) {
        return files[_fileHash].timestamps;
    }
}
