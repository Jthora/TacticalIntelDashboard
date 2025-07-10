// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockTarget
 * @dev Simple contract for testing governance proposal execution
 */
contract MockTarget {
    uint256 private data;
    
    function setData(uint256 _data) external {
        data = _data;
    }
    
    function getData() external view returns (uint256) {
        return data;
    }
}
