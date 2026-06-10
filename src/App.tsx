import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CADViewer from './components/CADViewer';

export default function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <CADViewer />
    </DndProvider>
  );
}
