import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
// src폴더로 artifact 이동 후 -경로설정 => ContractFactory에 넣기위해
// import GreetingArtifact from "./artifacts/contracts/Greeting.sol/Greeting.json";
import GreetingArtifact from "./Greeting.json";
import styled from "styled-components";

// ---------------CSS-------------------------------------------------------------------
// ---------------CSS-------------------------------------------------------------------
const StyledDeployContractButton = styled.button`
  width: 180px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
  place-self: center;
`;

const StyledGreetingDiv = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  place-self: center;
`;

const StyledLabel = styled.label`
  font-weight: bold;
`;

const StyledInput = styled.input`
  padding: 0.4rem 0.6rem;
`;

const StyledButton = styled.button`
  width: 150px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
`;

// ---------------CSS-------------------------------------------------------------------
// ---------------CSS-------------------------------------------------------------------
export function ContractCall() {
  // useWeb3React 사용
  const { active, library } = useWeb3React();

  // signer 가져오기 const
  const [signer, setSigner] = useState(); //정의한것임 ->다음 useEffecthook
  // ContractCall을 이용하기위한 Dom
  // const 구성
  const [greetingContract, setGreetingContract] = useState();
  const [greetingContractAddr, setGreetingContractAddr] = useState("");

  // greeting 을 표시하는 함수
  const [greeting, setGreeting] = useState("");
  // greetingInput을 표시하는 함수
  const [greetingInput, setGreetingInput] = useState("");

  //signer를 useEffect Hook 사용
  // useEffect로  web3React library사용
  useEffect(() => {
    if (!library) {
      setSigner(undefined); //library없는경우 undefined하고 넘김
      return;
    }

    setSigner(library.getSigner());
  }, [library]);

  // useEffect 호출되는 greet라는 함수를 통해서 표현된 받아오고 문자열을 넣는 과정
  useEffect(() => {
    // 스마트컨트랙트가 배포되지않았을 때 await
    if (!greetingContract) {
      return;
    }
    async function getGreeting(greetingContract) {
      const _greeting = await greetingContract.greet();

      // 가져오는데 기존의 문자열과 다를 때만
      if (_greeting !== greeting) {
        setGreeting(_greeting);
      }

      // setGreeting 함수 호출 => _greeting string 받음
      setGreeting(_greeting);
    }

    // 배열로 greetingContract 랑 greeting이 변경될 경우
    getGreeting(greetingContract);
  }, [greetingContract, greeting]);

  // deploy-해주는기능
  const handleDeployContract = (event) => {
    event.preventDefault();
    // 다시 체크 배포 되었으면 필요없으니까
    if (greetingContract) {
      return;
    }
    // 1.artifact를 ./frontend로 옮겨야함
    // 2.ContractFactory안에 abi,bytecode넣고 signer를 넣기-> 위에 const [signer, setSigner]
    async function deployGreetingContract() {
      const Greeting = new ethers.ContractFactory(
        GreetingArtifact.abi,
        GreetingArtifact.bytecode,
        signer
      );
      // error 대비-
      // greetingContract 배포되기전
      try {
        const greetingContract = await Greeting.deploy("Hello, 조율해DAO");
        // 배포된 컨트랙트에 입력값이 잘 출력되는지 확인하는 코드 (greeting contract안의 greet 함수 호출)
        const greeting = await greetingContract.greet();

        //저장
        setGreetingContract(greetingContract);
        //저장
        setGreeting(greeting);
        // 배포가된 컨트랙트 주소 저장
        setGreetingContractAddr(greetingContract.address);
        // 배포된 컨트랙트주소 받기 경고창으로
        window.alert(`Greeting deployed to : ${greetingContract.address}`);

        // await로   deployed로 구성
        await greetingContract.deployed();
      } catch (error) {
        window.alert(
          "Error: " + (error && error.message ? `${error.message}` : "")
        );
      }
    }
    deployGreetingContract(signer);
  };

  // handleGreetingChange greeting input을 만들어야함 ->useState 만들러 위로
  const handleGreetingChange = (event) => {
    event.preventDefault();
    // useState만든것 적용
    setGreetingInput(event.target.value);
  };

  const handleGreetingSubmit = (event) => {
    event.preventDefault();
    // 컨트랙트가 없는경우 반환
    if (!greetingContract) {
      window.alert("Undefined greeting Contract");
      return;
    }
    // greetingInput에 아무값도 없을 경우
    if (!greetingInput) {
      window.alert("Greeting can not be empty");
      return;
    }

    async function submitGreeting(greetingContract) {
      try {
        const setGreetingTxn = await greetingContract.setGreeting(
          greetingInput
        );
        await setGreetingTxn.wait();

        const newGreeting = await greetingContract.greet();

        window.alert(`Success : ${newGreeting}`);

        if (newGreeting !== greeting) {
          setGreeting(newGreeting);
        }
      } catch (error) {
        window.alert(
          "Error: " + (error && error.message ? `${error.message}` : "")
        );
      }
    }
    submitGreeting(greetingContract);
  };

  return (
    // 1. Deploy버튼으로 Greeting contract 배포
    // 2. Contract Address 유무확인
    // 3.disabled {active안될경우 or ||혹은 greeting contract있으면 비활성화=배포된 자체 컨트랙트 오브젝트}
    //
    <>
      <StyledDeployContractButton
        disabled={!active || greetingContract ? true : false}
        style={{
          borderColor: !active || greetingContract ? "unset" : "blue",
        }}
        onClick={handleDeployContract}
      >
        Deploy Greeting Contract
      </StyledDeployContractButton>
      <StyledGreetingDiv>
        <StyledLabel>Contract address</StyledLabel>
        <div>
          {greetingContractAddr ? (
            greetingContractAddr
          ) : (
            <em>{`<Contract not yet deployed>`}</em>
          )}
        </div>
        <StyledLabel>Current greeting</StyledLabel>
        <div>
          {greeting ? greeting : <em>{`<Contract not yet deployed>`}</em>}
        </div>
        <StyledLabel htmlFor="greetingInput">Set new greeting</StyledLabel>
        <StyledInput
          id="greetingInput"
          type="text"
          placeholder={greeting ? "" : "<Contract not yet deployed>"}
          onChange={handleGreetingChange}
          style={{ fontStyle: greeting ? "normal" : "italic" }}
        ></StyledInput>
        <StyledButton
          disabled={!active || !greetingContract ? true : false}
          style={{
            borderColor: !active || !greetingContract ? "unset" : "blue",
          }}
          onClick={handleGreetingSubmit}
        >
          Submit
        </StyledButton>
      </StyledGreetingDiv>
    </>
  );
}