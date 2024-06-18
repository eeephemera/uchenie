// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MoskovskiyPlehanovaToken is ERC20 {
    address public owner;

    // Событие для логирования вознаграждений студентов
    event StudentRewarded(address indexed student, uint8 grade, uint256 rewardAmount);

    constructor() ERC20("MoskovskiyPlehanovaToken", "MPT") {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function rewardStudent(address student, uint8 grade) public onlyOwner {
        require(student != address(0), "Invalid student address"); // Проверка на невалидный адрес
        
        uint256 rewardAmount;

        // Определение количества токенов в зависимости от оценки
        if (grade == 5) {
            rewardAmount = 100 * 10 ** decimals();
        } else if (grade == 4) {
            rewardAmount = 50 * 10 ** decimals();
        } else if (grade == 3) {
            rewardAmount = 25 * 10 ** decimals();
        } else {
            rewardAmount = 0;
        }

        // Эмиссия токенов и их отправка на адрес студента
        if (rewardAmount > 0) {
            _mint(student, rewardAmount);
            emit StudentRewarded(student, grade, rewardAmount); // Вызов события
        }
    }
}