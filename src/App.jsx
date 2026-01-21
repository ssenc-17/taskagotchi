import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

export default function App() {
  const FOCUS_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  const [time, setTime] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  const [energy, setEnergy] = useState(4);
  const [happiness, setHappiness] = useState(3);

  const [bounce, setBounce] = useState(false);
  const [isDancing, setIsDancing] = useState(false);
  const [canPlay, setCanPlay] = useState(false);

// timer
  useEffect(() => {
    let interval;

    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(t => t - 1);
      }, 1000);
    }

    if (time === 0) {
      setIsRunning(false);

      if (!isBreak) {
        setCanPlay(true);
        setIsBreak(true);
        setTime(BREAK_TIME);
      } else {
        setIsBreak(false);
        setTime(FOCUS_TIME);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, time, isBreak]);

  useEffect(() => {
    if (!isRunning || isBreak) return;

    const drain = setInterval(() => {
      setEnergy(e => Math.max(0, e - 1));
    }, 5 * 60 * 1000);

    return () => clearInterval(drain);
  }, [isRunning, isBreak]);

// animation
  useEffect(() => {
    const bounceInterval = setInterval(() => {
      setBounce(true);
      setTimeout(() => setBounce(false), 200);
    }, 2000);
    return () => clearInterval(bounceInterval);
  }, []);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// task logic
  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask, done: false }]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => {
      if (task.id === id && !task.done) {
        setHappiness(h => Math.min(5, h + 1));
        return { ...task, done: true };
      }
      return task;
    }));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

// play
  const playWithPet = () => {
    if (!canPlay) return;

    setIsDancing(true);
    setCanPlay(false);
    setEnergy(e => Math.min(5, e + 1));

    setTimeout(() => setIsDancing(false), 1500);
  };

// ui components
  const StatBar = ({ label, value }) => (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: 12 }}>{label}</div>
      <div style={{ display: 'flex', gap: 4 }}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              width: 20,
              height: 8,
              backgroundColor: i < value ? '#4ade80' : '#2a2a2a',
              border: '1px solid black'
            }}
          />
        ))}
      </div>
    </div>
  );
  
// render
  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: 300, height: 600, background: '#e8e8d0', border: '4px solid black', fontFamily: 'monospace' }}>

        {/* timer */}
        <div style={{ padding: 16, borderBottom: '4px solid black', textAlign: 'center' }}>
          <div>{isBreak ? 'BREAK TIME' : 'FOCUS TIME'}</div>
          <div style={{ fontSize: 32 }}>{formatTime(time)}</div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
            <button onClick={() => setTime(t => t + 60)}><ChevronUp /></button>
            <button onClick={() => setIsRunning(r => !r)}>
              {isRunning ? <Pause /> : <Play />}
            </button>
            <button onClick={() => { setTime(FOCUS_TIME); setIsRunning(false); }}>
              <RotateCcw />
            </button>
            <button onClick={() => setTime(t => Math.max(60, t - 60))}><ChevronDown /></button>
          </div>
        </div>

        {/* tamagotchi */}
        <div style={{ padding: 16, borderBottom: '4px solid black', textAlign: 'center' }}>
          <div
            style={{
              fontSize: 64,
              transform: isDancing
                ? 'rotate(10deg) translateY(-6px)'
                : bounce ? 'translateY(-4px)' : 'none',
              transition: 'transform 0.2s'
            }}
          >
            🐱
          </div>

          <StatBar label="ENERGY" value={energy} />
          <StatBar label="HAPPY" value={happiness} />

          <button
            onClick={playWithPet}
            disabled={!canPlay}
            style={{
              marginTop: 8,
              opacity: canPlay ? 1 : 0.4,
              cursor: canPlay ? 'pointer' : 'not-allowed'
            }}
          >
            PLAY
          </button>
        </div>

        {/* to do list*/}
        <div style={{ padding: 16 }}>
          {tasks.map(task => (
            <div key={task.id} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(task.id)}
              />
              <span style={{ flex: 1, textDecoration: task.done ? 'line-through' : 'none' }}>
                {task.text}
              </span>
              <button onClick={() => deleteTask(task.id)}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          <input
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder="Add task..."
          />
          <button onClick={addTask}>+</button>
        </div>

      </div>
    </div>
  );
}
