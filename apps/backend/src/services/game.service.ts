import { GameRepository } from "../repositories/game.repository";

export class GameService {
  public async getGameById(gameId: string) {
    return this.gameRepo.getGameById(gameId);
  }
  async createGameForHost(playerId: string) {
    // Create a new game and return its ID
    const game = await this.gameRepo.createGame(playerId);
    return game.id;
  }
  private gameRepo: GameRepository;

  constructor() {
    this.gameRepo = new GameRepository();
  }

  // Check if a move is a hit or miss on opponent's board, update the board, and record the move
  async makeMove(attackingPlayerId: string, x: number, y: number) {
    try {
      // Get the attacking player's full data to find gameId
      const attackingPlayerData =
        await this.gameRepo.getPlayerById(attackingPlayerId);
      if (!attackingPlayerData || !attackingPlayerData.gameId) {
        throw new Error("Player is not in a game");
      }

      // Find the opponent player in the same game
      const opponentPlayer = await this.gameRepo.getOpponentPlayer(
        attackingPlayerData.gameId,
        attackingPlayerId
      );

      if (!opponentPlayer || !opponentPlayer.board) {
        throw new Error("Opponent player not found or has no board");
      }

      const opponentBoard = opponentPlayer.board as any; // cast JSON type

      // Check if coordinate has already been attacked
      if (this.isCoordinateAlreadyAttacked(opponentBoard, x, y)) {
        throw new Error("This coordinate has already been attacked");
      }

      // Check if the move hits any ship on opponent's board
      let hit = false;
      let hitShipName = "";
      let isShipSunk = false;

      for (const ship of opponentBoard.ships) {
        for (const pos of ship.positions) {
          if (pos[0] === x && pos[1] === y) {
            hit = true;
            hitShipName = ship.name;
            break;
          }
        }
        if (hit) {
          // Check if the ship is completely sunk after this hit
          let shipHitCount = 0;
          for (const pos of ship.positions) {
            // Check if this position has been hit before or is the current hit
            const alreadyHit = opponentBoard.hits.some(
              (hitPos: number[]) => hitPos[0] === pos[0] && hitPos[1] === pos[1]
            );
            if (alreadyHit || (pos[0] === x && pos[1] === y)) {
              shipHitCount++;
            }
          }
          isShipSunk = shipHitCount === ship.positions.length;
          break;
        }
      }

      // Update opponent's board JSON
      if (hit) {
        opponentBoard.hits.push([x, y]);
      } else {
        opponentBoard.misses.push([x, y]);
      }

      // Check if all ships are sunk (game over)
      const allShipsSunk = this.areAllShipsSunk(opponentBoard);

      // Persist opponent's board update
      await this.gameRepo.setBoard(opponentPlayer.id, opponentBoard);

      // Switch turn to opponent
      await this.gameRepo.setTurnPlayer(
        attackingPlayerData.gameId,
        opponentPlayer.id
      );

      return {
        hit,
        coordinates: [x, y],
        shipName: hit ? hitShipName : null,
        isShipSunk,
        isGameOver: allShipsSunk,
        attackingPlayerId,
        opponentPlayerId: opponentPlayer.id,
        gameId: attackingPlayerData.gameId,
        nextTurnPlayerId: opponentPlayer.id,
        opponentBoard: {
          hits: opponentBoard.hits,
          misses: opponentBoard.misses,
        },
      };
    } catch (error) {
      console.error("Error in makeMove:", error);
      throw error;
    }
  }

  async joinGame(gameId: string, playerId: string) {
    console.log(`Player: ${playerId} attempting to join game ${gameId}`);

    try {
      // Check if game exists
      const game = await this.gameRepo.getGameById(gameId);
      if (!game) {
        throw new Error(`Game with ID ${gameId} does not exist`);
      }

      // Get current players
      const gameState = await this.gameRepo.getGameState(gameId);

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
            positions: [],
          },
          {
            name: "destroyer1",
            positions: [],
          },
          {
            name: "destroyer2",
            positions: [],
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

  async placeShips(playerId: string, shipData: object) {
    console.log(`Received ship data for player: ${playerId}`);
    console.log("shipData:", shipData);
    this.gameRepo.updatePlayerGame(playerId, shipData);
  }

  async getGameState(gameId: string) {
    return this.gameRepo.getGameState(gameId);
  }

  async getPlayerData(playerId: string) {
    return this.gameRepo.getPlayerById(playerId);
  }

  // Helper method to check if a coordinate has already been attacked
  private isCoordinateAlreadyAttacked(
    board: any,
    x: number,
    y: number
  ): boolean {
    const alreadyHit = board.hits.some(
      (hitPos: number[]) => hitPos[0] === x && hitPos[1] === y
    );
    const alreadyMissed = board.misses.some(
      (missPos: number[]) => missPos[0] === x && missPos[1] === y
    );
    return alreadyHit || alreadyMissed;
  }

  // Helper method to check if all ships are sunk
  private areAllShipsSunk(board: any): boolean {
    for (const ship of board.ships) {
      let shipSunk = true;
      for (const pos of ship.positions) {
        const isHit = board.hits.some(
          (hitPos: number[]) => hitPos[0] === pos[0] && hitPos[1] === pos[1]
        );
        if (!isHit) {
          shipSunk = false;
          break;
        }
      }
      if (!shipSunk) {
        return false;
      }
    }
    return true;
  }
}
