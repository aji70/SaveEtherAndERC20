// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
// import "./IERC20.sol";

interface IERC20 {
    // function name() external view returns (string memory);
    // function symbol() external view returns (string memory);
    // function decimals() external view returns (uint8);
    // function totalSupply() external view returns (uint256);
    function balanceOf(address _owner) external view returns (uint256 balance);
    function transfer(address _to, uint256 _value) external returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success);
    // function approve(address _spender, uint256 _value) external returns (bool success);
    // function allowance(address _owner, address _spender) external view returns (uint256 remaining);

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}



contract SaveEtherAndERC20  {
    address savingToken;
    address owner;

    mapping(address => uint256) Ethersavings;

    event EtherSavingSuccessful(address indexed user, uint256 indexed amount);

    mapping(address => uint256) ERC20savings;

    event SavingSuccessful(address sender, uint256 amount);
    event WithdrawSuccessful(address receiver, uint256 amount);

    constructor(address _savingToken) {
        savingToken = _savingToken;
        owner = msg.sender;
    }

 function Etherdeposit() public payable {
        require(msg.sender != address(0), "wrong EOA");
        require(msg.value > 0, "can't save zero value");
        Ethersavings[msg.sender] = Ethersavings[msg.sender] + msg.value;
        emit EtherSavingSuccessful(msg.sender, msg.value);
    }
    function Etherwithdraw() external {
        require(msg.sender != address(0), "wrong EOA");
        uint256 _userSavings = Ethersavings[msg.sender];
        require(_userSavings > 0, "you don't have any savings");

        Ethersavings[msg.sender] -= _userSavings;

        payable(msg.sender).transfer(_userSavings);
    }

    function EthercheckSavings(address _user) external view returns (uint256) {
        return Ethersavings[_user];
    }

    function EthersendOutSaving(address _receiver, uint256 _amount) external {
        require(msg.sender != address(0), "no zero address call");
        require(_amount > 0, "can't send zero value");
        require(Ethersavings[msg.sender] >= _amount);
        Ethersavings[msg.sender] -= _amount;
        
        payable(_receiver).transfer(_amount);
    }
    function EthercheckContractBal() external view returns (uint256) {
        return address(this).balance;
    }
    function ERC20deposit(uint256 _amount) external {
        require(msg.sender != address(0), "address zero detected");
        require(_amount > 0, "can't save zero value");
        require(IERC20(savingToken).balanceOf(msg.sender) >= _amount, "not enough token");

        require(IERC20(savingToken).transferFrom(msg.sender, address(this), _amount), "failed to transfer");

        ERC20savings[msg.sender] += _amount;

        emit SavingSuccessful(msg.sender, _amount);

    }

    function ERC20withdraw(uint256 _amount) external {
        require(msg.sender != address(0), "address zero detected");
        require(_amount > 0, "can't withdraw zero value");

        uint256 _userSaving = ERC20savings[msg.sender];

        require(_userSaving >= _amount, "insufficient funds");

        ERC20savings[msg.sender] -= _amount;

        require(IERC20(savingToken).transfer(msg.sender, _amount), "failed to withdraw");

        emit WithdrawSuccessful(msg.sender, _amount);
    }

    function ERC20checkUserBalance(address _user) external view returns (uint256) {
        return ERC20savings[_user];
    }

    function ERC20checkContractBalance() external view returns(uint256) {
        return IERC20(savingToken).balanceOf(address(this));
    }

    function ERC20ownerWithdraw(uint256 _amount) external {
        require(msg.sender == owner, "not owner");

        IERC20(savingToken).transfer(msg.sender, _amount);
    }
}