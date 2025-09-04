import { GameRepository } from "../repositories/game.repository";

export class GameService {
  private gameRepo: GameRepository;

  constructor() {
    this.gameRepo = new GameRepository();
  }

  // Check if a move is a hit or miss, update the board, and record the move
  async makeMove(playerId: string, x: number, y: number) {
    let boardData;
    try {
      boardData = await this.gameRepo.getBoard(playerId);
    } catch (error) {
      throw new Error("Board not found for this player");
    }

    const board = boardData?.board as any; // cast JSON type

    // Check if the move hits any ship
    let hit = false;
    for (const ship of board.ships) {
      for (const pos of ship.positions) {
        if (pos[0] === x && pos[1] === y) {
          hit = true;
          break;
        }
      }
      if (hit) break;
    }

    // Update board JSON
    if (hit) {
      board.hits.push([x, y]);
    } else {
      board.misses.push([x, y]);
    }

    // Persist board update
    await this.gameRepo.setBoard(playerId, board);

    // Record move in DB
    // await this.gameRepo.recordMove(playerId, playerId, x, y, hit);

    return {
      hit,
      board,
    };
  }

  async joinGame(gameId: string, playerId: string) {
    console.log(`Player: ${playerId} attempting to join game ${gameId}`);

    try {
      // Check if game exists and get current players
      const gameState = await this.gameRepo.getGameState(gameId);
      // if (!gameState) {
      //   throw new Error(`Game with ID ${gameId} does not exist`);
      // }

      // Check if player already exists in the game
      // const existingPlayer = gameState?.players.find((p) => p.id === playerId);
      // if (existingPlayer) {
      //   console.log(`Player ${playerId} already exists in game ${gameId}`);
      //   return {
      //     success: true,
      //     message: "Player already in game",
      //     playerData: existingPlayer,
      //     gameData: gameState,
      //   };
      // }

      // // Check game capacity (max 2 players for battleship)
      // if (gameState.players.length >= 2) {
      //   throw new Error("Game is full. Maximum 2 players allowed.");
      // }

      // Determine if this player is the host (first player)
      // const isHost = gameState.players.length === 0;
      const isHost = true;

      // Sample board data similar to queries.ts
      const sampleBoard = {
        ships: [
          {
            name: "battleship",
            positions: [
              [2, 0],
              [2, 1],
              [2, 2],
              [2, 3],
            ],
          },
          {
            name: "destroyer",
            positions: [
              [8, 7],
              [8, 8],
              [8, 9],
            ],
          },
          {
            name: "destroyer",
            positions: [
              [3, 7],
              [3, 8],
              [3, 9],
            ],
          },
        ],
        hits: [],
        misses: [],
      };

      // Create new player using repository
      const newPlayer = await this.gameRepo.createPlayerInGame(
        gameId,
        playerId,
        isHost,
        sampleBoard
      );

      console.log(
        `Player ${playerId} successfully joined game ${gameId} as ${isHost ? "host" : "opponent"}`
      );

      return {
        success: true,
        message: "Successfully joined game",
        playerData: newPlayer,
        position: isHost ? "player1" : "player2",
      };
    } catch (error) {
      console.error(
        `Error joining game: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      throw error;
    }
  }

  async getGameState(gameId: string) {
    return this.gameRepo.getGameState(gameId);
  }
}
