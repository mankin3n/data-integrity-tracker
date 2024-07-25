const FileHashStore = artifacts.require("FileHashStore");

module.exports = function (deployer) {
  deployer.deploy(FileHashStore);
};
