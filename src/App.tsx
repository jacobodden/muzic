import { useGameStore } from '@/stores/gameStore'
import WelcomeScreen from '@/components/screens/WelcomeScreen'
import SetupScreen from '@/components/screens/SetupScreen'
import GameScreen from '@/components/screens/GameScreen'
import GameOverScreen from '@/components/screens/GameOverScreen'

export default function App() {
  const screen = useGameStore((s) => s.screen)

  switch (screen) {
    case 'welcome':
      return <WelcomeScreen />
    case 'setup':
      return <SetupScreen />
    case 'game':
      return <GameScreen />
    case 'gameover':
      return <GameOverScreen />
  }
}
