import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class GameRepository {
  /**
    Sample Board JSON   

    "ships": [
        { "type": "battleship", "positions": [[2,0],[3,0],[4,0],[5,0]] },
        { "type": "destroyer", "positions": [[7,3],[7,4],[7,5]] }
    ],
    "hits": [[0,0],[7,3]],
    "misses": [[1,1],[2,2]]
    }
*/
  async setBoard(playerId: string, board: object) {
    return prisma.player.update({
      where: { id: playerId },
      data: { board },
    });
  }

  async getBoard(playerId: string) {
    return prisma.player.findUnique({
      where: { id: playerId },
      select: { board: true },
    });
  }

  // async createGame(hostUserId: string) {
  //   return prisma.game.create({
  //     data: {
  //       status: "WAITING",
  //       players: {
  //         create: { id: hostUserId },
  //       },
  //     },
  //     include: { players: true },
  //   });
  // }

  async joinGame(gameId: string, playerId: string) {
    return prisma.player.create({
      data: { id: playerId, gameId: gameId },
    });
  }

  async createPlayerInGame(
    gameId: string,
    playerId: string,
    isHost: boolean,
    board: object
  ) {
    return prisma.player.create({
      data: {
        id: playerId,
        gameId: gameId,
        isHost: isHost,
        board: board,
      },
    });
  }

  async updatePlayerGame(playerId: string, ships: object) {
    try {
      // First, get the current board data
      const currentPlayer = await prisma.player.findUnique({
        where: { id: playerId },
        select: { board: true },
      });

      if (!currentPlayer) {
        throw new Error(`Player with ID ${playerId} not found`);
      }

      // Get existing board or create default structure
      const currentBoard = (currentPlayer.board as any) || {
        ships: [],
        hits: [],
        misses: [],
      };

      // Update the ships in the board
      const updatedBoard = {
        ...currentBoard,
        ships: ships,
      };

      // Update the player's board in the database
      return await prisma.player.update({
        where: { id: playerId },
        data: { board: updatedBoard },
      });
    } catch (error) {
      console.error(
        `Error updating player game: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      throw error;
    }
  }

  // async recordMove(
  //   gameId: string,
  //   playerId: string,
  //   x: number,
  //   y: number,
  //   hit: boolean
  // ) {
  //   return prisma.move.create({
  //     data: { gameId, playerId, x, y, hit },
  //   });
  // }

  async getGameState(gameId: string) {
    return prisma.player.findUnique({
      where: { id: gameId },
      // include: { players: { include: { game: true } }, moves: true },
    });
  }

  async getPlayerById(playerId: string) {
    return prisma.player.findUnique({
      where: { id: playerId },
    });
  }

  async getOpponentPlayer(gameId: string, currentPlayerId: string) {
    return prisma.player.findFirst({
      where: {
        gameId: gameId,
        id: { not: currentPlayerId },
      },
    });
  }

  async getGamePlayers(gameId: string) {
    return prisma.player.findMany({
      where: { gameId: gameId },
    });
  }
}
