/**
 * Route principale « / » — tableau de bord (expo-router : package.json « main » → expo-router/entry).
 */
import { HomeScreen } from '@/features/home/HomeScreen';

export default function IndexRoute() {
  return <HomeScreen />;
}
