// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/FizzCoin.sol";
import "../src/FizzCoinRewards.sol";

/**
 * Deployment script for FizzCoin contracts
 *
 * Usage (Testnet - Base Sepolia):
 * forge script script/Deploy.s.sol:DeployScript --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast --verify
 *
 * Usage (Mainnet - Base):
 * forge script script/Deploy.s.sol:DeployScript --rpc-url $BASE_MAINNET_RPC_URL --broadcast --verify
 */
contract DeployScript is Script {
    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy FizzCoin token
        console.log("\n1. Deploying FizzCoin token...");
        FizzCoin token = new FizzCoin();
        console.log("FizzCoin deployed at:", address(token));
        console.log("Initial supply:", token.totalSupply() / 10**18, "FIZZ");
        console.log("Max supply:", token.MAX_SUPPLY() / 10**18, "FIZZ");

        // 2. Deploy FizzCoinRewards contract
        console.log("\n2. Deploying FizzCoinRewards contract...");
        FizzCoinRewards rewards = new FizzCoinRewards(address(token));
        console.log("FizzCoinRewards deployed at:", address(rewards));

        // 3. Transfer 50M tokens to rewards contract (50% of initial supply)
        console.log("\n3. Transferring 50M FIZZ to rewards contract...");
        uint256 rewardPoolAmount = 50_000_000 * 10**18;
        token.transfer(address(rewards), rewardPoolAmount);
        console.log("Transferred:", rewardPoolAmount / 10**18, "FIZZ");
        console.log("Rewards contract balance:", token.balanceOf(address(rewards)) / 10**18, "FIZZ");

        // 4. Set rewards contract as reward distributor (if needed for future minting)
        console.log("\n4. Setting reward distributor...");
        token.setRewardDistributor(address(rewards));
        console.log("Reward distributor set to:", token.rewardDistributor());

        vm.stopBroadcast();

        // Print deployment summary
        console.log("\n========================================");
        console.log("DEPLOYMENT SUMMARY");
        console.log("========================================");
        console.log("FizzCoin Token:", address(token));
        console.log("FizzCoinRewards:", address(rewards));
        console.log("Deployer:", deployer);
        console.log("Deployer Balance:", token.balanceOf(deployer) / 10**18, "FIZZ");
        console.log("Rewards Pool:", token.balanceOf(address(rewards)) / 10**18, "FIZZ");
        console.log("========================================");
        console.log("\nNext steps:");
        console.log("1. Verify contracts on BaseScan (if not auto-verified)");
        console.log("2. Update .env with contract addresses:");
        console.log("   FIZZCOIN_CONTRACT_ADDRESS=", address(token));
        console.log("   REWARDS_CONTRACT_ADDRESS=", address(rewards));
        console.log("3. Configure Paymaster for gasless transactions");
        console.log("4. Test reward crediting and claiming");
        console.log("========================================");
    }
}
