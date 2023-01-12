import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import styled from "styled-components";
import BallotArtifact from "../artifacts/contracts/Ballot.sol/Ballot.json";
import TokenArtifact from "../artifacts/contracts/Token.sol/MyToken.json";
import TeamArtifact from "../artifacts/contracts/Team.sol/Team.json";

export function CallBallot() {
  const { active, library } = useWeb3React();
  const [ballotContract, setBallotContract] = useState();
  const [ballotContractAddr, setBallotContractAddr] = useState("");
  const [signer, setSigner] = useState();
  const [teamName, setTeamName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [lectureName, setLectureName] = useState("");
  const [tokenAmount, setTokenAmount] = useState(0);
  const [teamLeaderName, setTeamLeaderName] = useState("");
  const [memberAddress, setMemberAddress] = useState("");

  useEffect(() => {
    if (!library) {
      setSigner(undefined); //library없는경우 undefined하고 넘김
      return;
    }
    setSigner(library.getSigner());
  }, [library]);

  const handleDeployContract = (event) => {
    event.preventDefault();
    if (ballotContract) {
      return;
    }
    async function deployBallotContract() {
      const Ballot = new ethers.ContractFactory(
        BallotArtifact.abi,
        BallotArtifact.bytecode,
        signer
      );
      try {
        //ballotContract만들어주셨음!!
        //Ballot.setAddrName("afsdfas")
        //Ballot.setPoll("asdfsadf")
        const ballotContract = await Ballot.deploy(
          lectureName,
          tokenAmount,
          teamLeaderName
        );

        // 배포된 컨트랙트에 입력값이 잘 출력되는지 확인하는 코드 (greeting contract안의 greet 함수 호출)
        // const ballot = await ballotContract.ballot();
        // await ballotContract.setAddrName(memberAddress, memberName);
        // const user = await ballotContract.getAddrName();

        // const ballot = await ballotContract.setAddrName("김형준");

        //저장
        setBallotContract(ballotContract);
        //저장
        // setBallot(ballot);
        // 배포가된 컨트랙트 주소 저장
        setBallotContractAddr(ballotContract.address);
        // 배포된 컨트랙트주소 받기 경고창으로
        window.alert(`Ballot deployed to : ${ballotContract.address}`);

        // await로   deployed로 구성
        const deployedContract = await ballotContract.deployed();
        console.log(deployedContract);
      } catch (error) {
        window.alert(
          "Error: " + (error && error.message ? `${error.message}` : "")
        );
      }
    }
    deployBallotContract();
  };
  const handleAddMember = async () => {
    if (!ballotContract) {
      window.alert("먼저 배포해주세요~");
      return;
    }
    try {
      await ballotContract.setAddrName(memberAddress, memberName);
      const res = await ballotContract.getAddrName();
      console.log(res);
      await ballotContract.deployed();
    } catch (error) {
      window.alert(
        "Error: " + (error && error.message ? `${error.message}` : "")
      );
    }
  };





  
  return (
    <>
      <button
        disabled={!active || ballotContract ? true : false}
        onClick={handleDeployContract}
      >
        Deploy Ballot Contract
      </button>
      <div>
        <div>Contract address</div>
        <div>
          {ballotContractAddr
            ? ballotContractAddr
            : "컨트랙트가 배포 되지 않았습니다."}{" "}
        </div>
        <input
          placeholder="과목명"
          onChange={(e) => setLectureName(e.target.value)}
          value={lectureName}
        />
        <input
          placeholder="팀장이름"
          onChange={(e) => setTeamLeaderName(e.target.value)}
          value={teamLeaderName}
        />
        <input
          placeholder="팀명"
          onChange={(e) => setTeamName(e.target.value)}
          value={teamName}
        />
        <input
          placeholder="토큰"
          type="number"
          onChange={(e) => setTokenAmount(Number(e.target.value))}
          value={tokenAmount}
        />

        <div>
          <input
            placeholder="팀원이름"
            onChange={(e) => setMemberName(e.target.value)}
            value={memberName}
          />
          <input
            placeholder="지갑주소"
            onChange={(e) => setMemberAddress(e.target.value)}
            value={memberAddress}
          />
          <button onClick={handleAddMember}>맴버 추가</button>
        </div>
      </div>
    </>
  );
}
