"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Star, X, User, Gamepad2, Store, CheckCircle, Trophy, Diamond, ChevronLeft } from "lucide-react"

type Screen = "home" | "games" | "rating" | "tasks" | "tetris" | "blockblast" | "flappybird" | "knifehit" | "bubbleshooter" | "sortpuz"

// XP thresholds for each game
const POINTS_CONFIG = {
  tetris: { threshold: 100, points: 50 },      // Score 100+ = earn 50 XP
  blockblast: { threshold: 200, points: 75 },  // Score 200+ = earn 75 XP
  flappybird: { threshold: 5, points: 100 },   // Pass 5 pipes = earn 100 XP
  knifehit: { threshold: 10, points: 80 },     // Hit 10 knives = earn 80 XP
  bubbleshooter: { threshold: 500, points: 120 }, // Score 500+ = earn 120 XP
  sortpuz: { threshold: 3, points: 90 }        // Sort 3 tubes = earn 90 XP
}

// Mock leaderboard data
const leaderboardData = [
  { rank: 1, name: "Катя", username: "@katya_win", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Katya", points: 3125 },
  { rank: 2, name: "Влад", username: "@vlad_gamer", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Vlad", points: 3125 },
  { rank: 3, name: "Коля", username: "@kolya_pro", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Kolya", points: 3125 },
  { rank: 4, name: "Даша", username: "@daria_len", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Dasha", points: 3125 },
  { rank: 5, name: "Кирилл", username: "@kirill_k", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Kirill", points: 3017 }
]

const games = [
  { name: "Tetris", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201430105650-YjrHsuboS6y9qFhGO2fBAkLdSKahot.png", screen: "tetris" as Screen },
  { name: "Block Blast", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201430105653-zzpb17f1tbb5Dtjm7e5zhzdn0lvXI8.png", screen: "blockblast" as Screen },
  { name: "Flappy Bird", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201430105652-NuK79wptqu3oHmGNV2gkDkjpGsylqs.png", screen: "flappybird" as Screen },
  { name: "Knife Hit", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201430105651-MZTuYQ6S5lc4aRalkuNBwzCiw7TjTh.png", screen: "knifehit" as Screen },
  { name: "Bubble Shooter", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201430105654-V3vv6jj3L1PCIK57QVsuc7PGdzQWV7.png", screen: "bubbleshooter" as Screen },
  { name: "SortPuz", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201430105669-9QTFdn0Ckjt33YEbMit70Uj9u7LRLl.png", screen: "sortpuz" as Screen }
]

// Powerup button sprites
const POWERUP_SPRITES = {
  rocket: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201430105719-G2OWrRDk1tLZlmKl1pC2JaRcpFHOpY.png",
  snowflake: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201430105720-gh1S0kr8zBJvjLNdI6p8NS4psBXTJx.png"
}

// Bubble colors using provided sprites
const BUBBLE_SPRITES = {
  blue: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201430105683-Vn3D8alBDSF7dYZmAXyU1YNeRqAbtN.png",
  pink: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201430105688-EkJ2YD0V5onRi7ZfyNXHQNVggetfbV.png",
  green: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201430105691-GsWwpRPNdpckdzsIEibyOCjd9ndqg6.png",
  purple: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201430105690-hjirGzob498SjHfO0lPMZ4ygCy4R5Y.png",
  yellow: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201430105687-94CudmTcIzIwjX81JQnCDHOjBafXdd.png",
  cyan: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201430105686-dZEa2MFVbReDIizHMSNB1ZrUTsozow.png",
  lightblue: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201430105689-6ea5jZ9SrxGF1VDZdg5ZVkPGljtRy1.png"
}

// M-logo bubble sprites for special bubbles
const BUBBLE_M_SPRITES = {
  orange: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201430105677-gXNmFdcomyZg2ZrZrm58oYaOBxUMLg.png",
  pink: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201430105673-kyM42rQdPfUn4KUfjM7w4DdM8CbZQD.png",
  green: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201430105676-6hH99HiTAQICW2VO2B8y4uih9leWv3.png",
  yellow: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201430105678-AdDtHHAnAeAnQdN7krDhQE9qWtESD1.png"
}

// Background image
const BUBBLE_BACKGROUND = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_23k7gd23k7gd23k7-g4PJvvDm6dnaoqYaU6Cr8UQFRcQj8l.png"

// Character sprite
const CHARACTER_SPRITE = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%201491-r58JTjsm4T83ZLaUR5NOyg0GU34MGx.png"

// Home background
const HOME_BACKGROUND = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201430105736.png-kqZQPozoKOapNC1AJMxAq7NpoB8etl.jpeg"

// M currency icon
const M_CURRENCY_ICON = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D0%9A%D0%BD%D0%BE%D0%BF%D0%BA%D0%B0%20%D1%80%D0%B5%D0%B8%CC%86%D1%82%D0%B8%D0%BD%D0%B3-1-cMvR8Zapg0gRtrvnUwUzPulIIuOcke.png"

// Animation wrapper component
function GameWrapper({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50)
  }, [])
  
  const handleBack = () => {
    setIsExiting(true)
    setTimeout(() => onBack(), 300)
  }
  
  return (
    <div className={`transition-all duration-300 ease-out ${isVisible && !isExiting ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      {typeof children === 'function' ? (children as (handleBack: () => void) => React.ReactNode)(handleBack) : children}
    </div>
  )
}

// Tetris Game
function TetrisGame({ onBack, onEarnPoints }: { onBack: () => void; onEarnPoints: (points: number) => void }) {
  const ROWS = 20
  const COLS = 10
  const [board, setBoard] = useState<number[][]>(() => Array(ROWS).fill(null).map(() => Array(COLS).fill(0)))
  const [piece, setPiece] = useState({ x: 4, y: 0, shape: [[1, 1], [1, 1]], color: 1 })
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [pointsEarned, setPointsEarned] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50)
  }, [])
  
  useEffect(() => {
    if (score >= POINTS_CONFIG.tetris.threshold && !pointsEarned) {
      setPointsEarned(true)
      onEarnPoints(POINTS_CONFIG.tetris.points)
    }
  }, [score, pointsEarned, onEarnPoints])

  const SHAPES = [
    [[1, 1], [1, 1]],
    [[1, 1, 1, 1]],
    [[1, 1, 1], [0, 1, 0]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1, 1], [0, 0, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]]
  ]

  const COLORS = ['', '#00f0f0', '#f0f000', '#a000f0', '#f0a000', '#0000f0', '#00f000', '#f00000']

  const spawnPiece = useCallback(() => {
    const shapeIdx = Math.floor(Math.random() * SHAPES.length)
    return { x: Math.floor(COLS / 2) - 1, y: 0, shape: SHAPES[shapeIdx], color: shapeIdx + 1 }
  }, [])

  const isValidMove = useCallback((newX: number, newY: number, shape: number[][]) => {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const boardX = newX + col
          const boardY = newY + row
          if (boardX < 0 || boardX >= COLS || boardY >= ROWS) return false
          if (boardY >= 0 && board[boardY][boardX]) return false
        }
      }
    }
    return true
  }, [board])

  const mergePiece = useCallback(() => {
    const newBoard = board.map(row => [...row])
    piece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell && piece.y + y >= 0) {
          newBoard[piece.y + y][piece.x + x] = piece.color
        }
      })
    })
    
    const clearedBoard = newBoard.filter(row => row.some(cell => !cell))
    const clearedRows = ROWS - clearedBoard.length
    setScore(s => s + clearedRows * 100)
    
    while (clearedBoard.length < ROWS) {
      clearedBoard.unshift(Array(COLS).fill(0))
    }
    
    setBoard(clearedBoard)
    const newPiece = spawnPiece()
    if (!isValidMove(newPiece.x, newPiece.y, newPiece.shape)) {
      setGameOver(true)
    } else {
      setPiece(newPiece)
    }
  }, [board, piece, spawnPiece, isValidMove])

  useEffect(() => {
    if (gameOver) return
    const interval = setInterval(() => {
      if (isValidMove(piece.x, piece.y + 1, piece.shape)) {
        setPiece(p => ({ ...p, y: p.y + 1 }))
      } else {
        mergePiece()
      }
    }, 500)
    return () => clearInterval(interval)
  }, [piece, gameOver, isValidMove, mergePiece])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver) return
    if (e.key === 'ArrowLeft' && isValidMove(piece.x - 1, piece.y, piece.shape)) {
      setPiece(p => ({ ...p, x: p.x - 1 }))
    } else if (e.key === 'ArrowRight' && isValidMove(piece.x + 1, piece.y, piece.shape)) {
      setPiece(p => ({ ...p, x: p.x + 1 }))
    } else if (e.key === 'ArrowDown' && isValidMove(piece.x, piece.y + 1, piece.shape)) {
      setPiece(p => ({ ...p, y: p.y + 1 }))
    } else if (e.key === 'ArrowUp') {
      const rotated = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse())
      if (isValidMove(piece.x, piece.y, rotated)) {
        setPiece(p => ({ ...p, shape: rotated }))
      }
    }
  }, [piece, gameOver, isValidMove])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const move = (dir: 'left' | 'right' | 'down' | 'rotate') => {
    if (gameOver) return
    if (dir === 'left' && isValidMove(piece.x - 1, piece.y, piece.shape)) {
      setPiece(p => ({ ...p, x: p.x - 1 }))
    } else if (dir === 'right' && isValidMove(piece.x + 1, piece.y, piece.shape)) {
      setPiece(p => ({ ...p, x: p.x + 1 }))
    } else if (dir === 'down' && isValidMove(piece.x, piece.y + 1, piece.shape)) {
      setPiece(p => ({ ...p, y: p.y + 1 }))
    } else if (dir === 'rotate') {
      const rotated = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse())
      if (isValidMove(piece.x, piece.y, rotated)) {
        setPiece(p => ({ ...p, shape: rotated }))
      }
    }
  }

  const displayBoard = board.map(row => [...row])
  piece.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell && piece.y + y >= 0 && piece.y + y < ROWS) {
        displayBoard[piece.y + y][piece.x + x] = piece.color
      }
    })
  })
  
  const handleBack = () => {
    setIsExiting(true)
    setTimeout(() => onBack(), 300)
  }

  return (
    <div className={`min-h-screen bg-white flex flex-col items-center justify-center p-4 transition-all duration-300 ease-out ${isVisible && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="flex items-center justify-between w-full max-w-xs mb-4">
        <button onClick={handleBack} className="text-gray-800 p-2"><ChevronLeft className="w-6 h-6" /></button>
        <span className="text-gray-800 text-xl font-bold">XP: {score}</span>
        {gameOver && <button onClick={() => { setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(0))); setPiece(spawnPiece()); setScore(0); setGameOver(false) }} className="bg-blue-500 text-white px-3 py-1 rounded">Restart</button>}
      </div>
      <div className="bg-gray-100 p-1 rounded-xl shadow-lg">
        {displayBoard.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => (
              <div key={x} className="w-5 h-5 border border-gray-200 rounded-sm" style={{ backgroundColor: cell ? COLORS[cell] : '#f3f4f6' }} />
            ))}
          </div>
        ))}
      </div>
      {/* Character */}
      <img src={CHARACTER_SPRITE} alt="Character" className="w-16 h-20 mt-2 object-contain animate-bounce" style={{ animationDuration: '2s' }} />
      <div className="flex gap-2 mt-2">
        <button onTouchStart={() => move('left')} onClick={() => move('left')} className="bg-gray-200 text-gray-700 w-14 h-14 rounded-xl text-2xl font-bold active:scale-95 transition-transform">←</button>
        <button onTouchStart={() => move('rotate')} onClick={() => move('rotate')} className="bg-gray-200 text-gray-700 w-14 h-14 rounded-xl text-2xl font-bold active:scale-95 transition-transform">↻</button>
        <button onTouchStart={() => move('down')} onClick={() => move('down')} className="bg-gray-200 text-gray-700 w-14 h-14 rounded-xl text-2xl font-bold active:scale-95 transition-transform">↓</button>
        <button onTouchStart={() => move('right')} onClick={() => move('right')} className="bg-gray-200 text-gray-700 w-14 h-14 rounded-xl text-2xl font-bold active:scale-95 transition-transform">→</button>
      </div>
    </div>
  )
}

// Flappy Bird Game
function FlappyBirdGame({ onBack, onEarnPoints }: { onBack: () => void; onEarnPoints: (points: number) => void }) {
  const [birdY, setBirdY] = useState(250)
  const [birdVelocity, setBirdVelocity] = useState(0)
  const [pipes, setPipes] = useState<{ x: number; gapY: number }[]>([{ x: 400, gapY: 200 }])
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [started, setStarted] = useState(false)
  const [pointsEarned, setPointsEarned] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50)
  }, [])
  
  useEffect(() => {
    if (score >= POINTS_CONFIG.flappybird.threshold && !pointsEarned) {
      setPointsEarned(true)
      onEarnPoints(POINTS_CONFIG.flappybird.points)
    }
  }, [score, pointsEarned, onEarnPoints])

  const jump = () => {
    if (!started) setStarted(true)
    if (!gameOver) setBirdVelocity(-8)
  }

  useEffect(() => {
    if (!started || gameOver) return
    const interval = setInterval(() => {
      setBirdY(y => {
        const newY = y + birdVelocity
        if (newY < 0 || newY > 480) { setGameOver(true); return y }
        return newY
      })
      setBirdVelocity(v => v + 0.5)
      setPipes(p => {
        let newPipes = p.map(pipe => ({ ...pipe, x: pipe.x - 3 })).filter(pipe => pipe.x > -60)
        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < 200) {
          newPipes.push({ x: 400, gapY: 100 + Math.random() * 250 })
        }
        newPipes.forEach(pipe => {
          if (pipe.x > 40 && pipe.x < 80) {
            if (birdY < pipe.gapY - 60 || birdY > pipe.gapY + 60) {
              setGameOver(true)
            }
          }
          if (pipe.x === 40) setScore(s => s + 1)
        })
        return newPipes
      })
    }, 30)
    return () => clearInterval(interval)
  }, [started, gameOver, birdVelocity, birdY])

  const restart = () => {
    setBirdY(250); setBirdVelocity(0); setPipes([{ x: 400, gapY: 200 }]); setScore(0); setGameOver(false); setStarted(false)
  }
  
  const handleBack = () => {
    setIsExiting(true)
    setTimeout(() => onBack(), 300)
  }

  return (
    <div className={`min-h-screen bg-white flex flex-col items-center justify-center p-4 transition-all duration-300 ease-out ${isVisible && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="flex items-center justify-between w-full max-w-sm mb-4">
        <button onClick={handleBack} className="text-gray-800 p-2"><ChevronLeft className="w-6 h-6" /></button>
        <span className="text-gray-800 text-xl font-bold">XP: {score}</span>
        {gameOver && <button onClick={restart} className="bg-green-500 text-white px-3 py-1 rounded">Restart</button>}
      </div>
      <div className="relative w-80 h-[500px] bg-sky-300 rounded-2xl overflow-hidden border-4 border-sky-500" onClick={jump} onTouchStart={jump}>
        <div className="absolute w-10 h-10 bg-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center" style={{ left: 50, top: birdY, transition: 'top 0.05s' }}>
          <div className="w-2 h-2 bg-white rounded-full absolute left-6 top-2" />
          <div className="w-3 h-2 bg-orange-500 absolute left-8 top-4" style={{ clipPath: 'polygon(0 50%, 100% 0, 100% 100%)' }} />
        </div>
        {pipes.map((pipe, i) => (
          <div key={i}>
            <div className="absolute w-14 bg-green-500 border-2 border-green-700" style={{ left: pipe.x, top: 0, height: pipe.gapY - 60 }} />
            <div className="absolute w-14 bg-green-500 border-2 border-green-700" style={{ left: pipe.x, top: pipe.gapY + 60, bottom: 0 }} />
          </div>
        ))}
        {!started && <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold bg-black/30">Tap to start</div>}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-green-600" />
        {/* Character cheering */}
        <img src={CHARACTER_SPRITE} alt="Character" className="absolute bottom-16 right-2 w-12 h-16 object-contain" style={{ transform: 'scaleX(-1)' }} />
      </div>
    </div>
  )
}

// Knife Hit Game - In Development
function KnifeHitGame({ onBack }: { onBack: () => void; onEarnPoints: (points: number) => void }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50)
  }, [])
  
  const handleBack = () => {
    setIsExiting(true)
    setTimeout(() => onBack(), 300)
  }

  return (
    <div className={`min-h-screen bg-white flex flex-col items-center justify-center p-4 transition-all duration-300 ease-out ${isVisible && !isExiting ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <div className="flex items-center justify-between w-full max-w-xs mb-8">
        <button onClick={handleBack} className="text-gray-800 p-2"><ChevronLeft className="w-6 h-6" /></button>
        <span className="text-gray-800 text-lg font-medium">Knife Hit</span>
        <div className="w-8" />
      </div>
      
      <div className="flex flex-col items-center gap-6">
        <img src={CHARACTER_SPRITE} alt="Character" className="w-32 h-40 object-contain" />
        
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl px-8 py-4 shadow-lg">
          <p className="text-white text-xl font-bold text-center">В разработке</p>
        </div>
        
        <p className="text-gray-500 text-center max-w-xs">
          Эта игра скоро будет доступна. Следите за обновлениями!
        </p>
        
        <button 
          onClick={handleBack}
          className="mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl transition-colors"
        >
          Вернуться к играм
        </button>
      </div>
    </div>
  )
}

// Block Blast Game
function BlockBlastGame({ onBack, onEarnPoints }: { onBack: () => void; onEarnPoints: (points: number) => void }) {
  const GRID = 8
  const [board, setBoard] = useState<number[][]>(() => Array(GRID).fill(null).map(() => Array(GRID).fill(0)))
  const [score, setScore] = useState(0)
  const [selectedBlock, setSelectedBlock] = useState<number[][] | null>(null)
  const [pointsEarned, setPointsEarned] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50)
  }, [])
  
  useEffect(() => {
    if (score >= POINTS_CONFIG.blockblast.threshold && !pointsEarned) {
      setPointsEarned(true)
      onEarnPoints(POINTS_CONFIG.blockblast.points)
    }
  }, [score, pointsEarned, onEarnPoints])

  const BLOCKS = [
    [[1, 1, 1]],
    [[1], [1], [1]],
    [[1, 1], [1, 1]],
    [[1, 1, 1], [0, 0, 1]],
    [[1, 0], [1, 0], [1, 1]]
  ]
  const COLORS = ['', '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7']

  const [availableBlocks, setAvailableBlocks] = useState(() => 
    Array(3).fill(null).map(() => ({ block: BLOCKS[Math.floor(Math.random() * BLOCKS.length)], color: Math.floor(Math.random() * 5) + 1 }))
  )

  const canPlace = (block: number[][], startRow: number, startCol: number) => {
    for (let r = 0; r < block.length; r++) {
      for (let c = 0; c < block[r].length; c++) {
        if (block[r][c]) {
          if (startRow + r >= GRID || startCol + c >= GRID || board[startRow + r][startCol + c]) return false
        }
      }
    }
    return true
  }

  const placeBlock = (row: number, col: number) => {
    if (!selectedBlock) return
    const selectedIdx = availableBlocks.findIndex(b => b.block === selectedBlock)
    if (selectedIdx === -1) return
    const color = availableBlocks[selectedIdx].color

    if (canPlace(selectedBlock, row, col)) {
      const newBoard = board.map(r => [...r])
      selectedBlock.forEach((bRow, r) => {
        bRow.forEach((cell, c) => {
          if (cell) newBoard[row + r][col + c] = color
        })
      })

      let cleared = 0
      const rowsToClear = newBoard.map((r, i) => r.every(c => c) ? i : -1).filter(i => i !== -1)
      const colsToClear = Array(GRID).fill(0).map((_, i) => newBoard.every(r => r[i]) ? i : -1).filter(i => i !== -1)
      
      rowsToClear.forEach(r => { newBoard[r] = Array(GRID).fill(0); cleared++ })
      colsToClear.forEach(c => { newBoard.forEach(r => r[c] = 0); cleared++ })

      setBoard(newBoard)
      setScore(s => s + selectedBlock.flat().filter(c => c).length * 10 + cleared * 100)
      
      const newBlocks = [...availableBlocks]
      newBlocks[selectedIdx] = { block: BLOCKS[Math.floor(Math.random() * BLOCKS.length)], color: Math.floor(Math.random() * 5) + 1 }
      setAvailableBlocks(newBlocks)
      setSelectedBlock(null)
    }
  }

  const handleBack = () => {
    setIsExiting(true)
    setTimeout(() => onBack(), 300)
  }

  return (
    <div className={`min-h-screen bg-white flex flex-col items-center justify-center p-4 transition-all duration-300 ease-out ${isVisible && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="flex items-center justify-between w-full max-w-xs mb-4">
        <button onClick={handleBack} className="text-gray-800 p-2"><ChevronLeft className="w-6 h-6" /></button>
        <span className="text-gray-800 text-xl font-bold">XP: {score}</span>
        <img src={CHARACTER_SPRITE} alt="Character" className="w-10 h-12 object-contain" />
      </div>
      <div className="bg-gray-100 p-2 rounded-xl shadow-lg">
        {board.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell, c) => (
              <div key={c} onClick={() => placeBlock(r, c)} className="w-8 h-8 border border-gray-200 rounded cursor-pointer hover:bg-gray-200 transition-colors" style={{ backgroundColor: cell ? COLORS[cell] : '#f9fafb' }} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-6">
        {availableBlocks.map((item, i) => (
          <div key={i} onClick={() => setSelectedBlock(item.block)} className={`p-2 rounded-lg cursor-pointer transition-all ${selectedBlock === item.block ? 'bg-blue-100 ring-2 ring-blue-400 scale-110' : 'bg-gray-100'}`}>
            {item.block.map((row, r) => (
              <div key={r} className="flex">
                {row.map((cell, c) => (
                  <div key={c} className="w-5 h-5 rounded-sm" style={{ backgroundColor: cell ? COLORS[item.color] : 'transparent' }} />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Bubble Shooter Game
function BubbleShooterGame({ onBack, onEarnPoints }: { onBack: () => void; onEarnPoints: (points: number) => void }) {
  const COLS = 9
  const ROWS = 10
  const BUBBLE_SIZE = 38
  const GAME_WIDTH = 360
  const GAME_HEIGHT = 640
  const COLORS = ['blue', 'pink', 'green', 'purple', 'yellow', 'cyan', 'lightblue'] as const
  type BubbleColor = typeof COLORS[number]
  
  const [board, setBoard] = useState<(BubbleColor | null)[][]>(() => {
    const initialBoard: (BubbleColor | null)[][] = []
    for (let r = 0; r < ROWS; r++) {
      const row: (BubbleColor | null)[] = []
      const colsInRow = r % 2 === 0 ? COLS : COLS - 1
      for (let c = 0; c < colsInRow; c++) {
        if (r < 5) {
          row.push(COLORS[Math.floor(Math.random() * COLORS.length)])
        } else {
          row.push(null)
        }
      }
      initialBoard.push(row)
    }
    return initialBoard
  })
  
  const [currentBubble, setCurrentBubble] = useState<BubbleColor>(() => COLORS[Math.floor(Math.random() * COLORS.length)])
  const [nextBubble, setNextBubble] = useState<BubbleColor>(() => COLORS[Math.floor(Math.random() * COLORS.length)])
  const [angle, setAngle] = useState(90)
  const [shooting, setShooting] = useState(false)
  const [bulletPos, setBulletPos] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100 })
  const [score, setScore] = useState(0)
  const [coins, setCoins] = useState(458)
  const [gameOver, setGameOver] = useState(false)
  const [pointsEarned, setPointsEarned] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const angleRef = useRef(angle)
  
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50)
  }, [])
  
  useEffect(() => {
    angleRef.current = angle
  }, [angle])
  
  useEffect(() => {
    if (score >= POINTS_CONFIG.bubbleshooter.threshold && !pointsEarned) {
      setPointsEarned(true)
      onEarnPoints(POINTS_CONFIG.bubbleshooter.points)
    }
  }, [score, pointsEarned, onEarnPoints])
  
  const getGridPos = (x: number, y: number, forPlacement = false) => {
    const row = Math.floor(y / (BUBBLE_SIZE * 0.85))
    const offset = row % 2 === 1 ? BUBBLE_SIZE / 2 : 0
    const col = Math.floor((x - offset) / BUBBLE_SIZE)
    const maxCol = row % 2 === 0 ? COLS - 1 : COLS - 2
    return { 
      row: Math.max(0, Math.min(row, ROWS - 1)), 
      col: Math.max(0, Math.min(col, maxCol)) 
    }
  }
  
  const findConnected = (board: (BubbleColor | null)[][], row: number, col: number, color: BubbleColor): Set<string> => {
    const visited = new Set<string>()
    const stack = [{ r: row, c: col }]
    while (stack.length > 0) {
      const { r, c } = stack.pop()!
      const key = `${r},${c}`
      if (visited.has(key)) continue
      const maxCol = r % 2 === 0 ? COLS - 1 : COLS - 2
      if (r < 0 || r >= ROWS || c < 0 || c > maxCol) continue
      if (!board[r] || board[r][c] !== color) continue
      visited.add(key)
      const offset = r % 2 === 1 ? 1 : 0
      // Hex grid neighbors
      stack.push(
        { r: r, c: c - 1 }, 
        { r: r, c: c + 1 },
        { r: r - 1, c: c - 1 + offset },
        { r: r - 1, c: c + offset },
        { r: r + 1, c: c - 1 + offset },
        { r: r + 1, c: c + offset }
      )
    }
    return visited
  }
  
  const removeFloating = (board: (BubbleColor | null)[][]) => {
    const connected = new Set<string>()
    const stack: { r: number; c: number }[] = []
    const firstRowCols = COLS
    for (let c = 0; c < firstRowCols; c++) {
      if (board[0] && board[0][c]) stack.push({ r: 0, c })
    }
    while (stack.length > 0) {
      const { r, c } = stack.pop()!
      const key = `${r},${c}`
      if (connected.has(key)) continue
      const maxCol = r % 2 === 0 ? COLS - 1 : COLS - 2
      if (r < 0 || r >= ROWS || c < 0 || c > maxCol) continue
      if (!board[r] || !board[r][c]) continue
      connected.add(key)
      const offset = r % 2 === 1 ? 1 : 0
      stack.push(
        { r: r, c: c - 1 }, 
        { r: r, c: c + 1 },
        { r: r - 1, c: c - 1 + offset },
        { r: r - 1, c: c + offset },
        { r: r + 1, c: c - 1 + offset },
        { r: r + 1, c: c + offset }
      )
    }
    let removed = 0
    for (let r = 0; r < ROWS; r++) {
      if (!board[r]) continue
      for (let c = 0; c < board[r].length; c++) {
        if (board[r][c] && !connected.has(`${r},${c}`)) {
          board[r][c] = null
          removed++
        }
      }
    }
    return removed
  }
  
  useEffect(() => {
    if (!shooting) return
    const interval = setInterval(() => {
      setBulletPos(pos => {
        const rad = (angleRef.current * Math.PI) / 180
        let newX = pos.x + Math.cos(rad) * 14
        let newY = pos.y - Math.sin(rad) * 14
        
        // Bounce off walls
        if (newX <= BUBBLE_SIZE / 2) {
          angleRef.current = 180 - angleRef.current
          newX = BUBBLE_SIZE / 2
        } else if (newX >= GAME_WIDTH - BUBBLE_SIZE / 2) {
          angleRef.current = 180 - angleRef.current
          newX = GAME_WIDTH - BUBBLE_SIZE / 2
        }
        
        // Check collision with existing bubbles or top
        const checkRow = Math.floor(newY / (BUBBLE_SIZE * 0.85))
        let hitBubble = false
        
        if (checkRow >= 0 && checkRow < ROWS && board[checkRow]) {
          for (let c = 0; c < board[checkRow].length; c++) {
            if (board[checkRow][c]) {
              const offset = checkRow % 2 === 1 ? BUBBLE_SIZE / 2 : 0
              const bubbleX = c * BUBBLE_SIZE + offset + BUBBLE_SIZE / 2
              const bubbleY = checkRow * BUBBLE_SIZE * 0.85 + BUBBLE_SIZE / 2
              const dist = Math.sqrt((newX - bubbleX) ** 2 + (newY - bubbleY) ** 2)
              if (dist < BUBBLE_SIZE * 0.9) {
                hitBubble = true
                break
              }
            }
          }
        }
        
        if (newY <= BUBBLE_SIZE / 2 || hitBubble) {
          const finalPos = getGridPos(newX, newY + (hitBubble ? BUBBLE_SIZE * 0.5 : 0))
          const newBoard = board.map(r => [...r])
          
          const maxCol = finalPos.row % 2 === 0 ? COLS - 1 : COLS - 2
          if (finalPos.row < ROWS && finalPos.col <= maxCol && newBoard[finalPos.row] && !newBoard[finalPos.row][finalPos.col]) {
            newBoard[finalPos.row][finalPos.col] = currentBubble
            
            const connected = findConnected(newBoard, finalPos.row, finalPos.col, currentBubble)
            if (connected.size >= 3) {
              connected.forEach(key => {
                const [r, c] = key.split(',').map(Number)
                if (newBoard[r]) newBoard[r][c] = null
              })
              const floating = removeFloating(newBoard)
              setScore(s => s + connected.size * 10 + floating * 15)
              setCoins(c => c + Math.floor(connected.size * 2))
            }
            
            // Check game over
            if (newBoard[ROWS - 2] && newBoard[ROWS - 2].some(b => b !== null)) {
              setGameOver(true)
            }
            
            setBoard(newBoard)
          }
          
          setShooting(false)
          setBulletPos({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100 })
          setCurrentBubble(nextBubble)
          setNextBubble(COLORS[Math.floor(Math.random() * COLORS.length)])
          return pos
        }
        
        return { x: newX, y: newY }
      })
    }, 16)
    return () => clearInterval(interval)
  }, [shooting, board, currentBubble, nextBubble])
  
  const handlePointerMove = (e: React.PointerEvent) => {
    if (shooting || gameOver) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - GAME_WIDTH / 2
    const y = GAME_HEIGHT - 100 - (e.clientY - rect.top)
    const newAngle = Math.atan2(y, x) * (180 / Math.PI)
    setAngle(Math.max(15, Math.min(165, newAngle)))
  }
  
  const shoot = () => {
    if (!shooting && !gameOver) {
      setShooting(true)
    }
  }
  
  const restart = () => {
    const initialBoard: (BubbleColor | null)[][] = []
    for (let r = 0; r < ROWS; r++) {
      const row: (BubbleColor | null)[] = []
      const colsInRow = r % 2 === 0 ? COLS : COLS - 1
      for (let c = 0; c < colsInRow; c++) {
        row.push(r < 5 ? COLORS[Math.floor(Math.random() * COLORS.length)] : null)
      }
      initialBoard.push(row)
    }
    setBoard(initialBoard)
    setCurrentBubble(COLORS[Math.floor(Math.random() * COLORS.length)])
    setNextBubble(COLORS[Math.floor(Math.random() * COLORS.length)])
    setScore(0)
    setGameOver(false)
    setShooting(false)
    setBulletPos({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100 })
  }
  
  const isWon = board.every(row => row.every(cell => cell === null))
  
  const handleBack = () => {
    setIsExiting(true)
    setTimeout(() => onBack(), 300)
  }
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-start bg-white overflow-hidden transition-all duration-300 ease-out ${isVisible && !isExiting ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      {/* Header */}
      <div className="w-full max-w-[360px] flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-bold text-gray-800">{score.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5">
            <img src={BUBBLE_M_SPRITES.pink} alt="coins" className="w-5 h-5" />
            <span className="text-sm font-bold text-gray-800">{coins}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(gameOver || isWon) && (
            <button onClick={restart} className="bg-green-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-md">
              Restart
            </button>
          )}
          <button onClick={handleBack} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
      
      {isWon && (
        <div className="bg-green-500 text-white text-xl font-bold px-6 py-2 rounded-full mb-2 shadow-lg">
          You Won!
        </div>
      )}
      {gameOver && !isWon && (
        <div className="bg-red-500 text-white text-xl font-bold px-6 py-2 rounded-full mb-2 shadow-lg">
          Game Over!
        </div>
      )}
      
      <div 
        className="relative flex-1 w-full max-w-[360px] overflow-hidden"
        style={{ 
          backgroundImage: `url(${BUBBLE_BACKGROUND})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom'
        }}
        onPointerMove={handlePointerMove}
        onClick={shoot}
        onTouchStart={shoot}
      >
        {/* Game area background overlay */}
        <div className="absolute inset-x-0 top-0 h-[60%] bg-gradient-to-b from-sky-200/90 to-transparent" />
        
        {/* Red boundary line */}
        <div 
          className="absolute left-0 right-0 h-1 bg-red-500 shadow-md"
          style={{ top: ROWS * BUBBLE_SIZE * 0.85 }}
        />
        
        {/* Bubbles on board */}
        {board.map((row, r) => (
          row.map((bubble, c) => bubble && (
            <img
              key={`${r}-${c}`}
              src={BUBBLE_SPRITES[bubble]}
              alt={bubble}
              className="absolute drop-shadow-md"
              draggable={false}
              style={{
                width: BUBBLE_SIZE,
                height: BUBBLE_SIZE,
                left: c * BUBBLE_SIZE + (r % 2 === 1 ? BUBBLE_SIZE / 2 : 0) + 10,
                top: r * BUBBLE_SIZE * 0.85 + 10
              }}
            />
          ))
        ))}
        
        {/* Aim line with dots */}
        {!shooting && (
          <div className="absolute" style={{ left: GAME_WIDTH / 2, bottom: 140 }}>
            {Array.from({ length: 8 }).map((_, i) => {
              const rad = (angle * Math.PI) / 180
              const distance = 30 + i * 25
              return (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white/60 rounded-full"
                  style={{
                    left: Math.cos(rad) * distance - 4,
                    top: -Math.sin(rad) * distance - 4
                  }}
                />
              )
            })}
          </div>
        )}
        
        {/* Current bubble being shot */}
        {shooting && (
          <img
            src={BUBBLE_SPRITES[currentBubble]}
            alt="bullet"
            className="absolute drop-shadow-lg"
            draggable={false}
            style={{
              width: BUBBLE_SIZE,
              height: BUBBLE_SIZE,
              left: bulletPos.x - BUBBLE_SIZE / 2,
              top: bulletPos.y - BUBBLE_SIZE / 2
            }}
          />
        )}
        
        {/* Bottom shooter area */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-green-500/60 to-transparent" />
        
        {/* Powerup buttons - Left side */}
        <div className="absolute left-3 bottom-36 flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-white/90 rounded-full pl-1 pr-3 py-1 shadow-md">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.5L17 7l-5 2.5L7 7l5-2.5z"/>
              </svg>
            </div>
            <div className="flex items-center gap-1">
              <img src={BUBBLE_M_SPRITES.pink} alt="M" className="w-4 h-4" />
              <span className="text-xs font-bold text-gray-700">20</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/90 rounded-full pl-1 pr-3 py-1 shadow-md">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div className="flex items-center gap-1">
              <img src={BUBBLE_M_SPRITES.pink} alt="M" className="w-4 h-4" />
              <span className="text-xs font-bold text-gray-700">30</span>
            </div>
          </div>
        </div>
        
        {/* Current ball to shoot (stationary when not shooting) */}
        {!shooting && (
          <div 
            className="absolute"
            style={{ 
              left: GAME_WIDTH / 2 - BUBBLE_SIZE / 2, 
              bottom: 140 - BUBBLE_SIZE / 2,
              transform: `rotate(${90 - angle}deg)`,
              transformOrigin: 'center center'
            }}
          >
            <img
              src={BUBBLE_SPRITES[currentBubble]}
              alt="current"
              className="drop-shadow-xl"
              draggable={false}
              style={{ width: BUBBLE_SIZE + 8, height: BUBBLE_SIZE + 8 }}
            />
          </div>
        )}
        
        {/* Next bubble indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-2 shadow-md">
          <span className="text-gray-600 text-xs font-medium">Next:</span>
          <img src={BUBBLE_SPRITES[nextBubble]} alt="next" className="w-8 h-8" draggable={false} />
        </div>
      </div>
    </div>
  )
}

function BottomNavigation({ currentScreen, onNavigate }: { currentScreen: Screen; onNavigate: (screen: Screen) => void }) {
  return (
    <div className="p-4 pb-6">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg">
        <div className="flex items-center justify-around py-4 px-2">
          <button onClick={() => onNavigate("home")} className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-colors ${currentScreen === "home" ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
            <svg className={`w-6 h-6 ${currentScreen === "home" ? "text-blue-500" : "text-gray-400"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </button>
          <button onClick={() => onNavigate("games")} className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-colors ${currentScreen === "games" ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
            <Gamepad2 className={`w-6 h-6 ${currentScreen === "games" ? "text-blue-500" : "text-gray-400"}`} />
          </button>
          <button className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <Store className="w-6 h-6 text-gray-400" />
          </button>
          <button onClick={() => onNavigate("tasks")} className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-colors ${currentScreen === "tasks" ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
            <CheckCircle className={`w-6 h-6 ${currentScreen === "tasks" ? "text-blue-500" : "text-gray-400"}`} />
          </button>
          <button onClick={() => onNavigate("rating")} className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-colors ${currentScreen === "rating" ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
            <Trophy className={`w-6 h-6 ${currentScreen === "rating" ? "text-blue-500" : "text-gray-400"}`} />
          </button>
        </div>
      </div>
    </div>
  )
}

function RatingScreen({ onBack, onNavigate, userPoints }: { onBack: () => void; onNavigate: (screen: Screen) => void; userPoints: number }) {
  return (
    <div className="min-h-screen max-w-md mx-auto bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-gray-100">
        <button onClick={onBack} className="p-2 -ml-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="backGradientRating" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <path d="M15 18l-6-6 6-6" stroke="url(#backGradientRating)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="flex-1 text-center pr-8">
          <h1 className="text-lg font-medium text-gray-900">Рейтинг игроков</h1>
          <p className="text-sm text-gray-400">Апрель 2026</p>
        </div>
      </div>
      
      {/* Leaderboard Image */}
      <div className="flex-1 flex flex-col">
        <img 
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201430105669-JEu7LGiobjWB3jmXDHLxBiyX3vwzt6.png" 
          alt="Рейтинг игроков" 
          className="w-full object-contain"
        />
        
        {/* Current user points display */}
        <div className="mx-4 mt-4 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-gray-500 mb-1">Ваши очки:</p>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-xl font-bold text-gray-900">{userPoints.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      <BottomNavigation currentScreen="rating" onNavigate={onNavigate} />
    </div>
  )
}

function GamesScreen({ onBack, onNavigate }: { onBack: () => void; onNavigate: (screen: Screen) => void }) {
  return (
    <div className="min-h-screen max-w-md mx-auto bg-white flex flex-col">
      <div className="flex items-center px-4 py-4 border-b border-gray-100">
        <button onClick={onBack} className="p-2 -ml-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="backGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <path d="M15 18l-6-6 6-6" stroke="url(#backGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="flex-1 text-center text-lg font-medium text-gray-900 pr-8">Игры</h1>
      </div>
      
      <div className="flex-1 px-4 py-6 overflow-auto">
        <p className="text-gray-900 font-medium mb-6">Выбери игру и прокачивай<br />своего персонажа</p>
        
        <div className="flex flex-col gap-4">
          {/* Row 1: Tetris + Block Blast */}
          <div className="flex gap-4">
            <button onClick={() => onNavigate("tetris")} className="bg-gray-50 rounded-2xl overflow-hidden hover:bg-gray-100 transition-colors" style={{ width: 208, height: 130 }}>
              <img src={games[0].image} alt="Tetris" className="w-full h-full object-cover" />
            </button>
            <button onClick={() => onNavigate("blockblast")} className="bg-gray-50 rounded-2xl overflow-hidden hover:bg-gray-100 transition-colors" style={{ width: 150, height: 130 }}>
              <img src={games[1].image} alt="Block Blast" className="w-full h-full object-cover" />
            </button>
          </div>
          
          {/* Row 2: Flappy Bird + Knife Hit */}
          <div className="flex gap-4">
            <button onClick={() => onNavigate("flappybird")} className="bg-gray-50 rounded-2xl overflow-hidden hover:bg-gray-100 transition-colors" style={{ width: 150, height: 130 }}>
              <img src={games[2].image} alt="Flappy Bird" className="w-full h-full object-cover" />
            </button>
            <button onClick={() => onNavigate("knifehit")} className="bg-gray-50 rounded-2xl overflow-hidden hover:bg-gray-100 transition-colors" style={{ width: 208, height: 130 }}>
              <img src={games[3].image} alt="Knife Hit" className="w-full h-full object-cover" />
            </button>
          </div>
          
          {/* Row 3: Bubble Shooter + SortPuz */}
          <div className="flex gap-4">
            <button onClick={() => onNavigate("bubbleshooter")} className="bg-gray-50 rounded-2xl overflow-hidden hover:bg-gray-100 transition-colors" style={{ width: 208, height: 130 }}>
              <img src={games[4].image} alt="Bubble Shooter" className="w-full h-full object-cover" />
            </button>
            <button onClick={() => onNavigate("sortpuz")} className="bg-gray-50 rounded-2xl overflow-hidden hover:bg-gray-100 transition-colors" style={{ width: 150, height: 130 }}>
              <img src={games[5].image} alt="SortPuz" className="w-full h-full object-cover" />
            </button>
          </div>
        </div>
      </div>
      
      <BottomNavigation currentScreen="games" onNavigate={onNavigate} />
    </div>
  )
}

// SortPuz Game (Color sorting puzzle)
function SortPuzGame({ onBack, onEarnPoints }: { onBack: () => void; onEarnPoints: (points: number) => void }) {
  const TUBE_COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7', '#ec4899']
  const [tubes, setTubes] = useState<(string | null)[][]>(() => {
    const colors = [...TUBE_COLORS, ...TUBE_COLORS, ...TUBE_COLORS, ...TUBE_COLORS].sort(() => Math.random() - 0.5)
    const initial: (string | null)[][] = []
    for (let i = 0; i < 6; i++) {
      initial.push([colors[i * 4], colors[i * 4 + 1], colors[i * 4 + 2], colors[i * 4 + 3]])
    }
    initial.push([null, null, null, null])
    initial.push([null, null, null, null])
    return initial
  })
  const [selectedTube, setSelectedTube] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const [pointsEarned, setPointsEarned] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50)
  }, [])
  
  const completedTubes = tubes.filter(tube => {
    const filled = tube.filter(c => c !== null)
    return filled.length === 4 && filled.every(c => c === filled[0])
  }).length
  
  useEffect(() => {
    if (completedTubes >= POINTS_CONFIG.sortpuz.threshold && !pointsEarned) {
      setPointsEarned(true)
      onEarnPoints(POINTS_CONFIG.sortpuz.points)
    }
  }, [completedTubes, pointsEarned, onEarnPoints])
  
  const getTopBall = (tube: (string | null)[]) => {
    for (let i = 3; i >= 0; i--) {
      if (tube[i]) return { color: tube[i], index: i }
    }
    return null
  }
  
  const getEmptySlot = (tube: (string | null)[]) => {
    for (let i = 0; i < 4; i++) {
      if (!tube[i]) return i
    }
    return -1
  }
  
  const canMove = (fromTube: number, toTube: number) => {
    const from = tubes[fromTube]
    const to = tubes[toTube]
    const topBall = getTopBall(from)
    if (!topBall) return false
    const emptySlot = getEmptySlot(to)
    if (emptySlot === -1) return false
    const toTop = getTopBall(to)
    if (toTop && toTop.color !== topBall.color) return false
    return true
  }
  
  const moveBall = (fromTube: number, toTube: number) => {
    if (!canMove(fromTube, toTube)) return
    const newTubes = tubes.map(t => [...t])
    const topBall = getTopBall(newTubes[fromTube])!
    const emptySlot = getEmptySlot(newTubes[toTube])
    newTubes[fromTube][topBall.index] = null
    newTubes[toTube][emptySlot] = topBall.color
    setTubes(newTubes)
    setMoves(m => m + 1)
  }
  
  const handleTubeClick = (index: number) => {
    if (selectedTube === null) {
      if (getTopBall(tubes[index])) setSelectedTube(index)
    } else {
      if (index !== selectedTube) {
        moveBall(selectedTube, index)
      }
      setSelectedTube(null)
    }
  }
  
  const isWon = completedTubes === 6
  
  const handleBack = () => {
    setIsExiting(true)
    setTimeout(() => onBack(), 300)
  }
  
  return (
    <div className={`min-h-screen bg-white flex flex-col items-center justify-center p-4 transition-all duration-300 ease-out ${isVisible && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="flex items-center justify-between w-full max-w-xs mb-6">
        <button onClick={handleBack} className="text-gray-800 p-2"><ChevronLeft className="w-6 h-6" /></button>
        <span className="text-gray-800 text-xl font-bold">XP: {moves}</span>
        {isWon ? <span className="text-green-500 font-bold">Won!</span> : <img src={CHARACTER_SPRITE} alt="Character" className="w-10 h-12 object-contain" />}
      </div>
      
      <div className="flex flex-wrap justify-center gap-4 max-w-sm">
        {tubes.map((tube, i) => (
          <button 
            key={i}
            onClick={() => handleTubeClick(i)}
            className={`relative w-12 h-32 rounded-b-full border-2 flex flex-col-reverse items-center pb-2 transition-all ${
              selectedTube === i ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300 bg-gray-50'
            }`}
          >
            {tube.map((color, j) => (
              <div
                key={j}
                className="w-8 h-6 rounded-full mb-0.5 shadow-sm"
                style={{ backgroundColor: color || 'transparent' }}
              />
            ))}
          </button>
        ))}
      </div>
      
      <p className="mt-6 text-gray-500 text-sm">Sorted: {completedTubes}/6</p>
    </div>
  )
}

// Tasks Screen
function TasksScreen({ onBack, onNavigate }: { onBack: () => void; onNavigate: (screen: Screen) => void }) {
  const [activeTab, setActiveTab] = useState<'reallife' | 'games'>('reallife')
  
  const realLifeTasks = [
    { id: 1, title: 'Покатушки', description: 'Арендуй каршеринг HELLO', completed: true, borderColor: '#22c55e' },
    { id: 2, title: 'Подписка на вайб', description: 'Подпишись на Telegram-канал МТБанк', completed: true, borderColor: '#22c55e' },
    { id: 3, title: 'Чух-чух', description: 'Купи билет на поезд или электричку БЧ/РЖД', completed: false, stars: 40, coins: 12, progress: 5, total: 15, borderColor: '#eab308' },
    { id: 4, title: 'Спортзал зовет', description: 'Оплати абонемент в фитнес-клуб', completed: false, stars: 55, coins: 12, progress: 7, total: 12, borderColor: '#f97316' },
    { id: 5, title: 'С ветерком', description: 'Арендуй электросамокат ЯндексGo, Whoosh или Eleven', completed: false, stars: 28, coins: 8, progress: 10, total: 20, borderColor: '#ec4899' },
  ]
  
  const gameTasks = [
    { id: 1, title: 'Первая тысяча', description: 'Заработай 1000 очков в Tetris', completed: true, borderColor: '#22c55e' },
    { id: 2, title: 'Золотая мишень', description: 'Заработай 50 очков за один раз в Knife Hit', completed: true, borderColor: '#22c55e' },
    { id: 3, title: 'Тройной удар', description: 'Очисти одновременно 3 линии в Block Blast', completed: false, stars: 60, coins: 3, progress: 5, total: 15, borderColor: '#eab308' },
    { id: 4, title: 'Игровой марафон', description: 'Проведи 30 минут в любой игре суммарно за день', completed: false, stars: 60, progress: 2, total: 7, borderColor: '#a855f7' },
    { id: 5, title: 'Чистая победа', description: 'Пройди уровень в любой игре с первой попытки', completed: false, stars: 40, progress: 10, total: 20, borderColor: '#ec4899' },
  ]
  
  const tasks = activeTab === 'reallife' ? realLifeTasks : gameTasks
  
  return (
    <div className="min-h-screen max-w-md mx-auto bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 py-4">
        <button onClick={onBack} className="p-2 -ml-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="backGradientTasks" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <path d="M15 18l-6-6 6-6" stroke="url(#backGradientTasks)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="flex-1 text-center pr-8">
          <h1 className="text-lg font-medium text-gray-900">Задания</h1>
          <p className="text-sm text-gray-400">Апрель 2026</p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex bg-gray-100 rounded-full p-1">
          <button 
            onClick={() => setActiveTab('reallife')}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'reallife' ? 'bg-green-500 text-white' : 'text-gray-600'
            }`}
          >
            Real Life
          </button>
          <button 
            onClick={() => setActiveTab('games')}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'games' ? 'bg-blue-500 text-white' : 'text-gray-600'
            }`}
          >
            Game Tasks
          </button>
        </div>
      </div>
      
      {/* Tasks List */}
      <div className="flex-1 px-4 overflow-auto pb-4">
        <div className="flex flex-col gap-3">
          {tasks.map(task => (
            <div 
              key={task.id}
              className="bg-white rounded-2xl p-4 shadow-sm"
              style={{ borderLeft: `4px solid ${task.borderColor}` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{task.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{task.description}</p>
                </div>
                {!task.completed && (task.stars || task.coins) && (
                  <div className="flex items-center gap-2">
                    {task.stars && (
                      <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-medium text-gray-700">+{task.stars}</span>
                      </div>
                    )}
                    {task.coins && (
                      <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
                        <img src={BUBBLE_M_SPRITES.pink} alt="M" className="w-3 h-3" />
                        <span className="text-xs font-medium text-gray-700">+{task.coins}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {task.completed ? (
                <div className="flex items-center gap-1 mt-2 text-green-500">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Выполнено</span>
                </div>
              ) : task.progress !== undefined && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Прогресс</span>
                    <span>{task.progress}/{task.total}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${(task.progress! / task.total!) * 100}%`,
                        background: `linear-gradient(90deg, ${task.borderColor}, ${task.borderColor}88)`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <BottomNavigation currentScreen="tasks" onNavigate={onNavigate} />
    </div>
  )
}

function HomeScreen({ onNavigate, userPoints }: { onNavigate: (screen: Screen) => void; userPoints: number }) {
  return (
    <div className="relative min-h-screen max-w-md mx-auto overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2026-04-22_19-15-33%201-i1z4xmRhB4L3LSKTE4PiDuP0fsinkL.png')` }} />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium text-gray-800">{userPoints.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm">
              <Diamond className="w-4 h-4 text-blue-500 fill-blue-400" />
              <span className="text-sm font-medium text-gray-800">458</span>
            </div>
          </div>
          <button className="w-8 h-8 flex items-center justify-center">
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>
        
        <div className="px-4 mt-2">
          <div className="relative bg-blue-500 rounded-full h-8 flex items-center overflow-hidden shadow-md">
            <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" style={{ width: '35.5%' }} />
            <span className="relative z-10 text-white text-sm font-medium w-full text-center">5 уровень 3200/9000</span>
            <div className="absolute right-2 w-6 h-6 bg-white/20 rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
            </div>
          </div>
        </div>
        
        <div className="px-4 mt-4">
          <button className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm">
            <User className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-700">Пригласить<br />друзей</span>
          </button>
        </div>
        
        <div className="flex-1" />
        <BottomNavigation currentScreen="home" onNavigate={onNavigate} />
      </div>
    </div>
  )
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home")
  const [userPoints, setUserPoints] = useState(3125)
  
  const handleEarnPoints = useCallback((points: number) => {
    setUserPoints(prev => prev + points)
  }, [])
  
  if (currentScreen === "tetris") return <TetrisGame onBack={() => setCurrentScreen("games")} onEarnPoints={handleEarnPoints} />
  if (currentScreen === "blockblast") return <BlockBlastGame onBack={() => setCurrentScreen("games")} onEarnPoints={handleEarnPoints} />
  if (currentScreen === "flappybird") return <FlappyBirdGame onBack={() => setCurrentScreen("games")} onEarnPoints={handleEarnPoints} />
  if (currentScreen === "knifehit") return <KnifeHitGame onBack={() => setCurrentScreen("games")} onEarnPoints={handleEarnPoints} />
  if (currentScreen === "bubbleshooter") return <BubbleShooterGame onBack={() => setCurrentScreen("games")} onEarnPoints={handleEarnPoints} />
  if (currentScreen === "sortpuz") return <SortPuzGame onBack={() => setCurrentScreen("games")} onEarnPoints={handleEarnPoints} />
  if (currentScreen === "games") return <GamesScreen onBack={() => setCurrentScreen("home")} onNavigate={setCurrentScreen} />
  if (currentScreen === "rating") return <RatingScreen onBack={() => setCurrentScreen("home")} onNavigate={setCurrentScreen} userPoints={userPoints} />
  if (currentScreen === "tasks") return <TasksScreen onBack={() => setCurrentScreen("home")} onNavigate={setCurrentScreen} />
  
  return <HomeScreen onNavigate={setCurrentScreen} userPoints={userPoints} />
}
