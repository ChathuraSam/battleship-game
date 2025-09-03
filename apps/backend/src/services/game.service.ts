import { GameRepository } from "../repositories/game.repository";

export class GameService {
  private gameRepo: GameRepository;

  constructor() {
    this.gameRepo = new GameRepository();
  }

  // Check if a move is a hit or miss, update the board, and record the move
  async makeMove(gameId: string, playerId: string, x: number, y: number) {
    const boardData = await this.gameRepo.getBoard(playerId);

    if (!boardData || !boardData.board) {
      throw new Error("Board not found for this player");
    }

    const board = boardData.board as any; // cast JSON type

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
    await this.gameRepo.recordMove(gameId, playerId, x, y, hit);

    return {
      hit,
      board,
    };
  }

  async getGameState(gameId: string) {
    return this.gameRepo.getGameState(gameId);
  }
}
