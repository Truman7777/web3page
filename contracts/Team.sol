// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./Token.sol";

contract Team {
  // 팀 구조체의 구조 : 수업이름, 팀넘버, 팀이름, 팀원의 주소가 담긴 배열, 안건개수, 토큰총발행량
  struct team {
    string subjectName;
    uint teamNumber;
    string teamName;
    address[] addr;
    uint eventNum;
    uint tokens;
  }
  mapping(uint => team) Teams;
  uint teamNum; // 매핑에서 Teams[] 대괄호 안에 넣어줄 팀넘버. 보통 1조, 2조 같이 팀 넘버로 팀을 구분.
  string subject; // 수업명.
  address[] teamMember; // 팀멤버 배열.
  string[] memberName; // 멤버 이름 배열.

  struct user {
    string name;
    address addr;
    uint token;
    uint point;
  }
  mapping(address => user) Users;

  MyToken MT;

  constructor(string memory _subject, uint _token, string memory _name) {
    subject = _subject; // 과목명을 처음에 입력해서 정해놓는다.
    memberName.push(_name); // 팀장 이름을 push
    teamMember.push(msg.sender); // 팀을 만드는 사람의 주소를 자동으로 push
    MT = new MyToken(_token); // _token은 totalsupply를 말하는 것.
  }
}
