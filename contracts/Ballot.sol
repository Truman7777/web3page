// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./Token.sol";
import "./Team.sol";

contract Ballot is Team {
  struct poll {
    // struct 안건. (몇번째 안건인지, 안건이름, 안건에 걸린 포인트)로 구성.
    uint number;
    string title;
    uint token;
  }
  uint pollNum; // 몇번째 안건인지. index라고 보면됨.
  mapping(uint => poll) Polls;
  uint tokenSum; // 토큰 총 공급량
  address leader;

  constructor(
    string memory _subject,
    uint _token,
    string memory _name
  ) public Team(_subject, _token, _name) {
    // _subject : 과목명, _token : 몇개 발행할지, _name : 팀 만드는 본인 이름
    MT = new MyToken(_token);
    tokenSum = MT.getTotalSupply();
    leader = msg.sender;
    state = Phase.Regs;
  }

  modifier onlyLeader() {
    require(msg.sender == leader);
    _;
  }

  enum Phase {
    Init,
    Regs,
    Vote,
    Done
  }
  Phase public state = Phase.Init;

  modifier validPhase(Phase reqPhase) {
    require(state == reqPhase);
    _;
  }

  function changeState(Phase x) public onlyLeader {
    state = x;
  }

  function setAddrName(
    address _addr,
    string memory _name
  ) public validPhase(Phase.Regs) onlyLeader {
    // 주소와 이름을 각각 주소배열, 이름배열에 넣어주는 과정.
    teamMember.push(_addr);
    memberName.push(_name);
  }

  function getAddrName() public view returns (uint, uint) {
    return (teamMember.length, memberName.length);
  }

  function setUser() public validPhase(Phase.Regs) onlyLeader {
    // 주소와 이름배열에 들어갔던 내용이 struct user에 들어가고 mapping 형식의 Users로 관리된다.
    for (uint i; i < teamMember.length; i++) {
      Users[teamMember[i]] = user(memberName[i], teamMember[i], 0, 100);
    }
  }

  function getUser(address _addr) public view returns (user memory) {
    return Users[_addr];
  }

  function setPoll(
    string memory _title
  ) public validPhase(Phase.Regs) onlyLeader {
    // 투표 설정하기 => poll(몇번째투표인지, 투표이름, 그 투표에 걸린 토큰)
    Polls[pollNum + 1] = poll(pollNum + 1, _title, 0);
    pollNum += 1;
  }

  function setToken(
    uint _num,
    uint _tpe
  ) public validPhase(Phase.Regs) onlyLeader {
    // _num : 몇번째 안건인지, _tpe : 그 안건에 토큰 몇개 걸지
    Polls[_num].token = _tpe;
    tokenSum = tokenSum - _tpe;
  }

  function getPoll(uint _num) public view returns (uint, string memory, uint) {
    return (Polls[_num].number, Polls[_num].title, Polls[_num].token);
  }

  function setTeam(
    string memory _teamName
  ) public validPhase(Phase.Regs) onlyLeader {
    // 팀 설정(수업명, 팀번호, 팀이름, 팀멤버주소, 안건개수, 토큰총발행량)
    Teams[teamNum + 1] = team(
      subject,
      teamNum + 1,
      _teamName,
      teamMember,
      pollNum,
      MT.getTotalSupply()
    );
    teamNum += 1;
  }

  function getTeam(uint _num) public view returns (team memory) {
    return Teams[_num];
  }

  function getTotalTokenSupply() public view returns (uint) {
    // 토큰 총 공급량
    return MT.getTotalSupply();
  }

  function getUserToken(address _addr) public view returns (uint) {
    // 그 사람이 토큰을 몇 개 가지고 있는지
    return Users[_addr].token;
  }

  mapping(address => uint) voting; // 해당 지갑주소인 사람이 몇 표를 얻었는지

  function vote(
    uint _point,
    address _addr
  ) public validPhase(Phase.Vote) returns (uint) {
    // _addr : 누구에게, _point : 몇개를 투표할지
    voting[_addr] += _point;
    Users[msg.sender].point -= _point;
    return Users[msg.sender].point;
  }

  function getVote(address _addr) public view returns (uint) {
    // 누가 몇표를 받았는지 알 수 있음
    return voting[_addr];
  }

  function ranking() public validPhase(Phase.Done) returns (address[] memory) {
    // 투표 많이 받은 순으로 저장된 배열 출력
    for (uint i; i < teamMember.length - 1; i++) {
      for (uint j = i + 1; j < teamMember.length; j++) {
        if (voting[teamMember[i]] < voting[teamMember[j]]) {
          (teamMember[i], teamMember[j]) = (teamMember[j], teamMember[i]);
        }
      }
    }

    return teamMember;
  }

  uint index = 1;

  function getToken() public validPhase(Phase.Done) onlyLeader {
    // 1등한테 안건에 달린 토큰을 지급하고 받은 투표수 초기화, 각 사람마다 투표에 쓸 수 있는 포인트 100으로 초기화 + 팀장은 20포인트 더 줌.
    Users[Team.teamMember[0]].token += Polls[index].token;
    index++;
    for (uint i; i < teamMember.length; i++) {
      voting[teamMember[i]] = 0;
      Users[teamMember[i]].point = 100;
    }
    Users[leader].point += 20;
  }
}
