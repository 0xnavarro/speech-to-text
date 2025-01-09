import { SpeechToText } from './components/SpeechToText'
import styled from '@emotion/styled'

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 1rem;
`;

function App() {
  return (
    <AppContainer>
      <SpeechToText />
    </AppContainer>
  )
}

export default App
