import React, { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown, X } from 'lucide-react'
import './App.css'

export default function App() {
  // constants for focus and break times in seconds
  const FOCUS_TIME = 25 * 60
  const BREAK_TIME = 5 * 60

  // timer state
  const [time, setTime] = useState(FOCUS_TIME)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)

  // tasks state with localstorage init
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('retro-tasks')
    return saved ? JSON.parse(saved) : []
  })

  const [newTask, setNewTask] = useState('')

  // tamagotchi stats
  const [energy, setEnergy] = useState(50)
  const [happiness, setHappiness] = useState(30)

  // tamagotchi animation and play state
  const [bounce, setBounce] = useState(false)
  const [canPlay, setCanPlay] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // save tasks to localstorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('retro-tasks', JSON.stringify(tasks))
  }, [tasks])

  // main timer interval logic
useEffect(() => {
  let interval

  if (isRunning && time > 0) {
    // countdown every second
    interval = setInterval(() => setTime(t => t - 1), 1000)
  } else if (isRunning && time === 0) {
    // stop timer first
    setIsRunning(false)

    // play sound safely
    try {
      const audio = new Audio(process.env.PUBLIC_URL + '/assets/timer.mp3')
      audio.play().catch(() => {})
    } catch (e) {
      console.error('failed to play audio', e)
    }

    // toggle break/focus and reset timer
    setIsBreak(prev => !prev)
    setTime(isBreak ? 25 * 60 : 5 * 60)

    // allow play if it was focus time
    if (!isBreak) setCanPlay(true)
  }

  return () => clearInterval(interval)
}, [isRunning, time, isBreak])

  // drain energy every minute while focus is running
  useEffect(() => {
    if (!isRunning || isBreak) return
    const drainInterval = setInterval(() => {
      setEnergy(e => Math.max(0, e - 1))
    }, 60 * 1000)
    return () => clearInterval(drainInterval)
  }, [isRunning, isBreak])

  // make tamagotchi bounce every 2 sec for vibey animation
  useEffect(() => {
    const bounceInterval = setInterval(() => {
      setBounce(true)
      setTimeout(() => setBounce(false), 200)
    }, 2000)
    return () => clearInterval(bounceInterval)
  }, [])

  // helper to format seconds into mm ss
  const formatTime = s => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`

  // add new task to list
  const addTask = () => {
    if (!newTask.trim()) return
    setTasks([...tasks, { id: Date.now(), text: newTask, done: false }])
    setNewTask('')
  }

  // toggle task done and increase happiness if completing
  const toggleTask = id => {
    const task = tasks.find(t => t.id === id)
    if (task && !task.done) setHappiness(h => Math.min(100, h + 20))
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  // delete task from list
  const deleteTask = id => setTasks(tasks.filter(t => t.id !== id))

  // adjust timer by minutes for user control
  const adjustTimer = minutes => setTime(Math.max(60, time + minutes*60))

  // play with tamagotchi and boost stats
  const playWithTamagotchi = () => {
    if (!canPlay) return
    setIsPlaying(true)
    setCanPlay(false)

    setEnergy(e => Math.min(100, e + 20))
    setHappiness(h => Math.min(100, h + 20))

    setTimeout(() => setIsPlaying(false), 2000)
  }

  // stat bar component for energy happiness
  const StatBar = ({ value, label }) => (
    <div className="stat-bar">
      <div className="stat-label">{label}</div>
      <div className="stat-blocks">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`stat-block ${i < value/20 ? 'filled' : ''}`} />
        ))}
      </div>
    </div>
  )

  // main app ui
  return (
    <div className="app-container">
      <div className="retro-window">

        {/* timer section */}
        <div className="section timer-section">
          <div className="timer-content">
            <div className="timer-label">{isBreak ? 'BREAK TIME!' : 'FOCUS TIME!'}</div>
            <div className="timer-display">{formatTime(time)}</div>
          </div>
          <div className="timer-controls">
            <button className="control-btn control-btn-adjust" onClick={() => adjustTimer(1)}><ChevronUp size={16}/></button>
            <button className="control-btn control-btn-play" onClick={() => setIsRunning(!isRunning)}>{isRunning ? <Pause size={20}/> : <Play size={20}/>}</button>
            <button className="control-btn control-btn-reset" onClick={() => { setTime(FOCUS_TIME); setIsRunning(false); }}><RotateCcw size={20}/></button>
            <button className="control-btn control-btn-adjust" onClick={() => adjustTimer(-1)}><ChevronDown size={16}/></button>
          </div>
        </div>

        {/* tamagotchi section */}
        <div className="section tamagotchi-section">
          <div className="tamagotchi-container">
            <div className={`tamagotchi-sprite ${bounce ? 'bounce' : ''} ${isPlaying ? 'playing' : ''}`}>
              <div className="sprite-placeholder">🐱</div>
            </div>
            <button onClick={playWithTamagotchi} disabled={!canPlay} className={`play-btn ${canPlay ? 'active' : ''}`}>
              {canPlay ? '▶ PLAY' : '🔒 LOCKED'}
            </button>
          </div>
          <div className="stats-container">
            <StatBar value={energy} label="ENERGY"/>
            <StatBar value={happiness} label="HAPPINESS"/>
          </div>
        </div>

        {/* tasks section */}
        <div className="section tasks-section">
          <div className="tasks-header">TODAY'S TASKS :</div>
          <div className="tasks-list">
            {tasks.map(task => (
              <div key={task.id} className="task-item">
                <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} className="task-checkbox"/>
                <span className={`task-text ${task.done ? 'done' : ''}`}>{task.text}</span>
                <button onClick={() => deleteTask(task.id)} className="task-delete"><X size={12}/></button>
              </div>
            ))}
          </div>
          <div className="task-input-container">
            <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)} onKeyPress={e => e.key==='Enter' && addTask()} placeholder="Add task..." className="task-input"/>
            <button onClick={addTask} className="task-add-btn">+</button>
          </div>
        </div>

      </div>
    </div>
  )
}