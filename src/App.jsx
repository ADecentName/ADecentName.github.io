import { useGame } from './game/GameContext.jsx'
import TitleScreen from './components/TitleScreen.jsx'
import Hub from './components/Hub.jsx'
import SceneEngine from './engine/SceneEngine.jsx'
import ChapterEndScreen from './components/ChapterEndScreen.jsx'
import ReflectionScreen from './components/ReflectionScreen.jsx'
import EndingScreen from './components/EndingScreen.jsx'

// Top-level router: renders one screen based on state.screen.
export default function App() {
  const { state } = useGame()

  switch (state.screen) {
    case 'title':
      return <TitleScreen />
    case 'hub':
      return <Hub />
    case 'scene':
      return <SceneEngine />
    case 'chapterEnd':
      return <ChapterEndScreen />
    case 'reflection':
      return <ReflectionScreen />
    case 'ending':
      return <EndingScreen />
    default:
      return <TitleScreen />
  }
}
