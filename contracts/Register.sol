// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract signUp {
  struct user {
    bytes32 pw; //비번
    string name; //가입자 이름
    uint snum; // 학번
    bool registered; // default : false
  }

  mapping(string => user) accounts; //id와 구조체 user를 연결

  // 암호화 코드, private 부여
  function encrypt(string memory pw) private pure returns (bytes32) {
    return keccak256(bytes(pw));
  }

  // 회원 가입 코드
  function register(
    string memory id,
    string memory pw,
    string memory name,
    uint snum
  ) public {
    // accounts[id].registered == false
    require(!accounts[id].registered, "id is already registered");

    accounts[id] = user(encrypt(pw), name, snum, true);
  }

  // 2번의 검증, 먼저 id가 등록되었는가, 그 다음에 id-pw가 일치하는가
  function verifyAccount(string memory id, string memory pw) private view {
    require(accounts[id].registered, "no registered");
    require(accounts[id].pw == encrypt(pw), "password incorrect");
  }

  // login하는 기능
  function login(
    string memory id,
    string memory pw
  ) public view returns (string memory, uint) {
    // 위의 verifyAccount
    verifyAccount(id, pw);
    return (accounts[id].name, accounts[id].snum);
  }

  // 멤버를 삭제하는 기능  onlyonwer??????
  function withdraw(string memory id, string memory pw) public {
    // 위의 verifyAccount
    verifyAccount(id, pw);
    delete accounts[id];
  }
}
