pragma solidity ^0.8.4;

interface IPTR {
    event RaiseLevel (address indexed account, uint256 newLevel);
    function mint(address account, uint256 amount) external;
    function raiseLevel(address account) external;
    function requiredTokenToRaiseLevel(address account) external view returns(uint256);
    function level(address account) external view returns(uint256);      
    function eqA() external view returns(int64);
    function eqB() external view returns(int64);
    function eqC() external view returns(int64);
    function setEqA(int64 value) external;
    function setEqB(int64 value) external;
    function setEqC(int64 value) external;
}