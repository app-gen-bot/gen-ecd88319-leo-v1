// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title FizzCoinRewards
 * @dev Manages FizzCoin reward distribution with gasless claiming support
 *
 * Features:
 * - Credit rewards to users (owner only)
 * - Gasless claiming via ERC2771 meta-transactions (Paymaster)
 * - Batch crediting for gas optimization
 * - Reentrancy protection
 * - Tracking of pending and claimed rewards
 */
contract FizzCoinRewards is Ownable, ReentrancyGuard {
    /// @notice FizzCoin token contract
    IERC20 public immutable fizzcoin;

    /// @notice Mapping of user address to pending reward amount
    mapping(address => uint256) public pendingRewards;

    /// @notice Mapping of user address to total claimed rewards
    mapping(address => uint256) public claimedRewards;

    /// @notice Emitted when rewards are credited to a user
    event RewardCredited(address indexed user, uint256 amount);

    /// @notice Emitted when a user claims their rewards
    event RewardClaimed(address indexed user, uint256 amount);

    /// @notice Emitted when rewards are batch credited
    event BatchRewardsCredited(uint256 userCount, uint256 totalAmount);

    /**
     * @dev Constructor initializes the contract with FizzCoin
     * @param _fizzcoin Address of the FizzCoin token contract
     */
    constructor(address _fizzcoin)
        Ownable()
    {
        require(_fizzcoin != address(0), "FizzCoinRewards: fizzcoin cannot be zero address");
        fizzcoin = IERC20(_fizzcoin);
    }

    /**
     * @notice Credits rewards to a user
     * @dev Only callable by contract owner (backend)
     * @param user Address of the user to credit
     * @param amount Amount of FizzCoin to credit (in wei, 18 decimals)
     */
    function creditReward(address user, uint256 amount) external onlyOwner {
        require(user != address(0), "FizzCoinRewards: user cannot be zero address");
        require(amount > 0, "FizzCoinRewards: amount must be greater than zero");

        pendingRewards[user] += amount;
        emit RewardCredited(user, amount);
    }

    /**
     * @notice Claims all pending rewards for the caller
     * @dev Works with meta-transactions via ERC2771 (gasless for users)
     * @dev Protected against reentrancy
     */
    function claimRewards() external nonReentrant {
        address user = _msgSender(); // Works with meta-transactions
        uint256 amount = pendingRewards[user];

        require(amount > 0, "FizzCoinRewards: no pending rewards");

        // Update state before transfer (CEI pattern)
        pendingRewards[user] = 0;
        claimedRewards[user] += amount;

        // Transfer tokens
        bool success = fizzcoin.transfer(user, amount);
        require(success, "FizzCoinRewards: token transfer failed");

        emit RewardClaimed(user, amount);
    }

    /**
     * @notice Credits rewards to multiple users in a single transaction
     * @dev Only callable by contract owner (backend)
     * @dev Gas-optimized for batch operations
     * @param users Array of user addresses
     * @param amounts Array of reward amounts (must match users length)
     */
    function batchCreditRewards(
        address[] calldata users,
        uint256[] calldata amounts
    ) external onlyOwner {
        uint256 length = users.length;
        require(length > 0, "FizzCoinRewards: empty arrays");
        require(length == amounts.length, "FizzCoinRewards: array length mismatch");

        uint256 totalAmount = 0;

        for (uint256 i = 0; i < length; i++) {
            address user = users[i];
            uint256 amount = amounts[i];

            require(user != address(0), "FizzCoinRewards: user cannot be zero address");
            require(amount > 0, "FizzCoinRewards: amount must be greater than zero");

            pendingRewards[user] += amount;
            totalAmount += amount;

            emit RewardCredited(user, amount);
        }

        emit BatchRewardsCredited(length, totalAmount);
    }

    /**
     * @notice Returns the pending rewards for a user
     * @param user Address of the user
     * @return Amount of pending rewards
     */
    function getPendingRewards(address user) external view returns (uint256) {
        return pendingRewards[user];
    }

    /**
     * @notice Returns the total claimed rewards for a user
     * @param user Address of the user
     * @return Amount of claimed rewards
     */
    function getClaimedRewards(address user) external view returns (uint256) {
        return claimedRewards[user];
    }

    /**
     * @notice Returns the total rewards (pending + claimed) for a user
     * @param user Address of the user
     * @return Total rewards amount
     */
    function getTotalRewards(address user) external view returns (uint256) {
        return pendingRewards[user] + claimedRewards[user];
    }

}
