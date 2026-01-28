// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FizzCoin
 * @dev ERC-20 token for FizzCard platform rewards
 *
 * Features:
 * - Fixed max supply of 1 billion tokens
 * - Initial mint of 100 million tokens for rewards pool
 * - Controlled minting by reward distributor only
 * - Ownable for administrative functions
 */
contract FizzCoin is ERC20, Ownable {
    /// @notice Maximum supply cap (1 billion tokens with 18 decimals)
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;

    /// @notice Address authorized to mint new rewards
    address public rewardDistributor;

    /// @notice Emitted when reward distributor address is updated
    event RewardDistributorUpdated(address indexed oldDistributor, address indexed newDistributor);

    /**
     * @dev Constructor initializes the token with name, symbol, and initial supply
     * Mints 100 million tokens to the deployer for the initial rewards pool
     */
    constructor()
        ERC20("FizzCoin", "FIZZ")
        Ownable()
    {
        // Mint initial supply of 100M tokens to deployer
        _mint(msg.sender, 100_000_000 * 10**18);
    }

    /**
     * @notice Sets the address authorized to mint new rewards
     * @dev Only callable by contract owner
     * @param _distributor Address of the new reward distributor
     */
    function setRewardDistributor(address _distributor) external onlyOwner {
        require(_distributor != address(0), "FizzCoin: distributor cannot be zero address");

        address oldDistributor = rewardDistributor;
        rewardDistributor = _distributor;

        emit RewardDistributorUpdated(oldDistributor, _distributor);
    }

    /**
     * @notice Mints new tokens for rewards
     * @dev Only callable by the authorized reward distributor
     * @dev Enforces max supply cap
     * @param to Address to receive the minted tokens
     * @param amount Amount of tokens to mint (in wei, 18 decimals)
     */
    function mintRewards(address to, uint256 amount) external {
        require(msg.sender == rewardDistributor, "FizzCoin: caller is not reward distributor");
        require(totalSupply() + amount <= MAX_SUPPLY, "FizzCoin: max supply exceeded");

        _mint(to, amount);
    }

    /**
     * @notice Returns the number of decimals used for token amounts
     * @return Number of decimals (18)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
