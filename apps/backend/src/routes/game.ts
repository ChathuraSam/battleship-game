import { Router } from "express";
import { GameService } from "../services/game.service";
export const router = Router();
const gameService = new GameService();
// Create a new game in the database (Prisma)
router.post("/create-db", async (req, res) => {
  try {
    const { playerId } = req.body;
    if (!playerId) {
      return res
        .status(400)
        .json({ success: false, error: "playerId is required" });
    }
    const gameId = await gameService.createGameForHost(playerId);
    res.json({ success: true, gameId });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Game state interface (basic structure for battleship game)
interface GameState {
  id: string;
  players: string[];
  boards: Record<string, any>;
  currentPlayer: string;
  status: "waiting" | "playing" | "finished";
  winner?: string;
}

// In-memory game storage (in production, use a database)
const games: Map<string, GameState> = new Map();

// Create a new game
router.post("/create", (req, res) => {
  const gameId = generateGameId();
  const game: GameState = {
    id: gameId,
    players: [],
    boards: {},
    currentPlayer: "",
    status: "waiting",
  };

  games.set(gameId, game);

  res.json({
    success: true,
    gameId,
    game,
  });
});

// Join a game
router.post("/join/:gameId", (req, res) => {
  const { gameId } = req.params;
  const { playerId } = req.body;

  const game = games.get(gameId);

  if (!game) {
    return res.status(404).json({
      success: false,
      error: "Game not found",
    });
  }

  if (game.players.length >= 2) {
    return res.status(400).json({
      success: false,
      error: "Game is full",
    });
  }

  game.players.push(playerId);

  if (game.players.length === 2) {
    game.status = "playing";
    game.currentPlayer = game.players[0] || "";
  }

  res.json({
    success: true,
    game,
  });
});

// Get game state
router.get("/:gameId", (req, res) => {
  const { gameId } = req.params;
  const game = games.get(gameId);

  if (!game) {
    return res.status(404).json({
      success: false,
      error: "Game not found",
    });
  }

  res.json({
    success: true,
    game,
  });
});

// Get all games
router.get("/", (req, res) => {
  const gamesList = Array.from(games.values());
  res.json({
    success: true,
    games: gamesList,
    count: gamesList.length,
  });
});

// Make a move
router.post("/:gameId/move", (req, res) => {
  const { gameId } = req.params;
  const { playerId, x, y } = req.body;

  const game = games.get(gameId);

  if (!game) {
    return res.status(404).json({
      success: false,
      error: "Game not found",
    });
  }

  if (game.status !== "playing") {
    return res.status(400).json({
      success: false,
      error: "Game is not active",
    });
  }

  if (game.currentPlayer !== playerId) {
    return res.status(400).json({
      success: false,
      error: "Not your turn",
    });
  }

  // Basic move logic (to be expanded)
  const result = processBattleshipMove(game, playerId, x, y);

  res.json({
    success: true,
    result,
    game,
  });
});

// Delete a game
router.delete("/:gameId", (req, res) => {
  const { gameId } = req.params;

  if (games.delete(gameId)) {
    res.json({
      success: true,
      message: "Game deleted successfully",
    });
  } else {
    res.status(404).json({
      success: false,
      error: "Game not found",
    });
  }
});

// Helper functions
function generateGameId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

function processBattleshipMove(
  game: GameState,
  playerId: string,
  x: number,
  y: number
): any {
  // Basic move processing logic (to be expanded with actual battleship rules)
  const opponent = game.players.find((p) => p !== playerId);

  // Switch turns
  game.currentPlayer = opponent || game.players[0] || "";

  return {
    hit: Math.random() > 0.5, // Random hit/miss for demo
    x,
    y,
    playerId,
  };
}
