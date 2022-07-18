pragma solidity ^0.8.4;

import "./IPTR.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PTR is IPTR, ERC20, Ownable {
    int64 internal _eqA;
    int64 internal _eqB;
    int64 internal _eqC;
    
    mapping (address => uint256) private _level;
    
    error MintToOtherAccout();
    error RaiseLevelToOtherAccout();
    error RaiseLevelToZeroAddress();
    error ReferToZeroAddress();
    error InvalidEquationConstants();
    error InsufficientTokenToRaiseNextLevel();

    constructor () ERC20("Pointer Token","PTR"){
        _eqA = 15;
        _eqB = 200;
        _eqC = 0;
    }

    function mint(address account, uint256 amount) public override{
        if(msg.sender != owner() && msg.sender != account) revert MintToOtherAccout();
        _mint(account, amount);
    }

    function raiseLevel(address account) public override{
        //オーナー以外は自分のアカウントにのみ操作可能
        if(msg.sender != owner() && msg.sender != account) revert RaiseLevelToOtherAccout();
        //0x0はレベルアップ不可
        if(account == address(0)) revert RaiseLevelToZeroAddress();

        //レベルアップ
        uint256 level_ = _level[account] + 1;
        uint256 tokenRequire = requiredTokenToRaiseLevel(account);
        if (tokenRequire < balanceOf(account)){
            _burn(account, tokenRequire);
            _level[account] = level_;
            //イベント発行　表示するレベルは内部値+1
            emit RaiseLevel(account, level_ + 1);
        }else{
            revert InsufficientTokenToRaiseNextLevel();
        }
    }

    function requiredTokenToRaiseLevel(address account) public view override returns(uint256){
        //0x0は処理不可
        if(account == address(0)) revert ReferToZeroAddress();
        //レベルアップ
        uint256 level_ = _level[account] + 1;
        int256 ilevel = int256(level_);
        int256 tokenRequire = int256(_eqA) * (ilevel ** 2) + int256(_eqB) * ilevel + int256(_eqC);
        if (tokenRequire <= 0) revert InvalidEquationConstants();
        return uint256(tokenRequire) * 1 ether;
    }

    function level(address account) external view override returns(uint256){
        //表示するレベルは内部値+1
        return _level[account] + 1;
       

    }


    function eqA() external view override returns(int64){
        return _eqA;
    }
    function eqB() external view override returns(int64){
        return _eqB;
    }
    function eqC() external view override returns(int64){
        return _eqC;
    }
    function setEqA(int64 value) external override onlyOwner(){
        _eqA = value;
    }
    function setEqB(int64 value) external override onlyOwner(){
        _eqB = value;
    }
    function setEqC(int64 value) external override onlyOwner(){
        _eqC = value;
    }

} 
