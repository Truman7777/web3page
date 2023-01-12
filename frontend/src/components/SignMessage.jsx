import { useWeb3React } from "@web3-react/core";
//useWeb3react hook사용
import styled from "styled-components";

const StyledButton = styled.button`
  width: 150px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
  place-self: center;
`;


//account=계정정보, active=액티브한지, library =프로바이더 정보 가져옴
export function SignMessage() {
  const context = useWeb3React();
  const { account, active, library } = context;

  // 핸들러
  function handleSignMessage(event) {
    event.preventDefault();

    // library가 undefined인경우

    if (!library || !account) {
      window.alert("Wallet not connected");
      return;
    }

    async function signMessage(library, account) {
      //try catch 로 async구문 error대비
      try {
        const signature = await library
          .getSigner(account)
          .signMessage("Hello 조율해DAO");
        window.alert(`Success! ${signature}`);
      } catch (error) {
        window.alert(
          "Error : " + (error && error.message ? `${error.message}` : "")
        );
      }
    }

    // 성공시 블록체인에 값이 기록됨 -가스 소비없음- 넥스트 nonce 0 트랙잭션 없음
    signMessage(library, account);
  }

  return (
    <StyledButton
      disabled={!active ? true : false}
      style={{
        borderColor: !active ? "unset" : "blue",
      }}
      onClick={handleSignMessage}
    >
      Sign Message
    </StyledButton>
  );
}
