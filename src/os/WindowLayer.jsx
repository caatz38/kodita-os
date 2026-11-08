import { useWindows } from './OSContext.jsx';
import Window from './Window.jsx';

export default function WindowLayer() {
  const { windows, focused } = useWindows();
  return windows.map((win) => <Window key={win.id} win={win} active={focused === win.id} />);
}
