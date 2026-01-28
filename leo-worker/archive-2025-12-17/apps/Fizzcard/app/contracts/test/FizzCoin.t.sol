// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/FizzCoin.sol";

contract FizzCoinTest is Test {
    FizzCoin public token;
    address public owner;
    address public distributor;
    address public user1;
    address public user2;

    uint256 constant INITIAL_SUPPLY = 100_000_000 * 10**18;
    uint256 constant MAX_SUPPLY = 1_000_000_000 * 10**18;

    event RewardDistributorUpdated(address indexed oldDistributor, address indexed newDistributor);

    function setUp() public {
        owner = address(this);
        distributor = address(0x1);
        user1 = address(0x2);
        user2 = address(0x3);

        token = new FizzCoin();
    }

    function testInitialSupply() public {
        assertEq(token.totalSupply(), INITIAL_SUPPLY);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY);
    }

    function testMaxSupply() public {
        assertEq(token.MAX_SUPPLY(), MAX_SUPPLY);
    }

    function testDecimals() public {
        assertEq(token.decimals(), 18);
    }

    function testNameAndSymbol() public {
        assertEq(token.name(), "FizzCoin");
        assertEq(token.symbol(), "FIZZ");
    }

    function testSetRewardDistributor() public {
        vm.expectEmit(true, true, false, true);
        emit RewardDistributorUpdated(address(0), distributor);

        token.setRewardDistributor(distributor);
        assertEq(token.rewardDistributor(), distributor);
    }

    function testSetRewardDistributorOnlyOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        token.setRewardDistributor(distributor);
    }

    function testSetRewardDistributorZeroAddress() public {
        vm.expectRevert("FizzCoin: distributor cannot be zero address");
        token.setRewardDistributor(address(0));
    }

    function testMintRewards() public {
        token.setRewardDistributor(distributor);

        uint256 mintAmount = 1000 * 10**18;

        vm.prank(distributor);
        token.mintRewards(user1, mintAmount);

        assertEq(token.balanceOf(user1), mintAmount);
        assertEq(token.totalSupply(), INITIAL_SUPPLY + mintAmount);
    }

    function testMintRewardsOnlyDistributor() public {
        token.setRewardDistributor(distributor);

        vm.prank(user1);
        vm.expectRevert("FizzCoin: caller is not reward distributor");
        token.mintRewards(user1, 1000 * 10**18);
    }

    function testMintRewardsExceedsMaxSupply() public {
        token.setRewardDistributor(distributor);

        uint256 exceedAmount = MAX_SUPPLY - INITIAL_SUPPLY + 1;

        vm.prank(distributor);
        vm.expectRevert("FizzCoin: max supply exceeded");
        token.mintRewards(user1, exceedAmount);
    }

    function testMintRewardsUpToMaxSupply() public {
        token.setRewardDistributor(distributor);

        uint256 remainingSupply = MAX_SUPPLY - INITIAL_SUPPLY;

        vm.prank(distributor);
        token.mintRewards(user1, remainingSupply);

        assertEq(token.totalSupply(), MAX_SUPPLY);
    }

    function testTransfer() public {
        uint256 transferAmount = 1000 * 10**18;

        token.transfer(user1, transferAmount);

        assertEq(token.balanceOf(user1), transferAmount);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - transferAmount);
    }

    function testApproveAndTransferFrom() public {
        uint256 amount = 1000 * 10**18;

        token.approve(user1, amount);

        vm.prank(user1);
        token.transferFrom(owner, user2, amount);

        assertEq(token.balanceOf(user2), amount);
    }

    function testPermit() public {
        uint256 privateKey = 0xA11CE;
        address alice = vm.addr(privateKey);

        uint256 amount = 1000 * 10**18;
        uint256 deadline = block.timestamp + 1 hours;

        // Transfer tokens to alice first
        token.transfer(alice, amount);

        // Create permit signature
        bytes32 domainSeparator = token.DOMAIN_SEPARATOR();
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"),
                alice,
                user1,
                amount,
                token.nonces(alice),
                deadline
            )
        );

        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", domainSeparator, structHash)
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, digest);

        // Execute permit
        token.permit(alice, user1, amount, deadline, v, r, s);

        assertEq(token.allowance(alice, user1), amount);
    }

    function testMultipleMints() public {
        token.setRewardDistributor(distributor);

        vm.startPrank(distributor);

        token.mintRewards(user1, 1000 * 10**18);
        token.mintRewards(user2, 2000 * 10**18);
        token.mintRewards(user1, 500 * 10**18);

        vm.stopPrank();

        assertEq(token.balanceOf(user1), 1500 * 10**18);
        assertEq(token.balanceOf(user2), 2000 * 10**18);
    }
}
