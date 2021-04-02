const ContractAddress = "0xFc2540389af95921a8c2D8AeA3A884bf9e38cee8";
const ContractMethods = [
  "function getMessage(uint256 _token) external view returns (string message)",
  "function ownerOf(uint256 _tokenId) external view returns (address)",
  "function getParents(uint256 _token) external view returns (uint256[] memory)",
  "function getBranches(uint256 _token) external view returns (uint256[] memory)",
  "function newThread(string memory _message) public returns (uint256)",
  "function comment(uint256 _post, string memory _message)",
];

export { ContractAddress, ContractMethods }