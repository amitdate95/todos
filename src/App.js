import './App.css';
import TodoList from './TodoList';
import TitleBar from './TitleBar';
import { useEffect, useState } from 'react';
import { invoke, convertFileSrc } from '@tauri-apps/api/tauri';
function App() {
  const [todos, setTodos] = useState([]);
  const [tauriWindow, setTauriWindow] = useState(null);
  const [isMaximized, setIsMaximised] = useState(false);

  useEffect(() => {
    let intervalId = null;
    const init = async () => {
      setTauriWindow((await import('@tauri-apps/api/window')).appWindow);
      const updateMaximizedState = async () => {
        setIsMaximised(await tauriWindow?.isMaximized());
      };
      updateMaximizedState();
      intervalId = setInterval(updateMaximizedState, 500);
    }
    init();
    return () => {
        if(intervalId){
            clearInterval(intervalId);
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [currentTodo, setCurrentTodo] = useState("");
  const [audioPath, setAudioPath] = useState({path: '', enabled: false});
  let currentAudio = new Audio();

  const addTodo = (text) => {
    if(text){
      setTodos([...todos, { text, completed: false }]);
      setCurrentTodo('');
    }
  };

  const toggleTodo = (index) => {
    const newTodos = [...todos];
    newTodos[index].completed = !newTodos[index].completed;
    setTodos(newTodos);
  };

  const removeTodo = (index) => {
    const newTodos = [...todos];
    newTodos.splice(index, 1);
    setTodos(newTodos);
  };

  function alertUser() {
    playAudio();
    tauriWindow.unminimize();
    tauriWindow.setFocus();
  }

  function playAudio() {
    const throttleTime = 1000;
    let lastPlayed = 0;
    const now = Date.now();

    if (now - lastPlayed < throttleTime) return;

    const { path, enabled } = audioPath;
    console.log(path, enabled);
    if (!enabled) return;

    if (path) {
      currentAudio.src = convertFileSrc(path, 'asset');
      currentAudio.play().catch((error) => {
        console.warn('Audio playback was interrupted:', error);
      });
      lastPlayed = now;
    } else {
      console.warn('No audio path available');
    }
  }

  useEffect(() => {
    const init = async () => {
      // workaround to set up listener before the loading
      if (window.__TAURI_METADATA__) {
        await invoke('handle_ready');

        const customAudioPath = await invoke('find_audio_files');
        setAudioPath({ path: customAudioPath[0], enabled: true });
      }
    }
    init();
  }, []);

  return (
    <div>
      <TitleBar tauriWindow={tauriWindow} isMaximized={isMaximized} setIsMaximised={setIsMaximised} />
      <div className='container'>
        <h1>ToDos App by Amit Date</h1>
        <p>This is a high-class ToDos application developed by Trading Technologies Pvt. Ltd.</p>
      
        <input className='todo-input' placeholder='Add a new task' onChange={(e) => setCurrentTodo(e.target.value)} value={currentTodo} />

        <TodoList
          todos={todos}
          toggleTodo={toggleTodo}
          removeTodo={removeTodo}
          addTodo={addTodo}
        />
        <br/>
        <button className='add-button' onClick={() => {
          addTodo(currentTodo);
          alertUser();
        }}>Add</button>
      </div>
    </div>
  );
}

export default App;
