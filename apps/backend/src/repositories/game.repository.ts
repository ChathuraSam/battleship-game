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

  async createGame(hostUserId: string) {
    return prisma.game.create({
      data: {
        status: "WAITING",
        players: {
          create: { username: hostUserId },
        },
      },
      include: { players: true },
    });
  }

  async joinGame(gameId: string, userId: string) {
    return prisma.player.create({
      data: { username: userId, id: userId },
    });
  }

  async recordMove(
    gameId: string,
    playerId: string,
    x: number,
    y: number,
    hit: boolean
  ) {
    return prisma.move.create({
      data: { gameId, playerId, x, y, hit },
    });
  }

  async getGameState(gameId: string) {
    return prisma.game.findUnique({
      where: { id: gameId },
      include: { players: { include: { game: true } }, moves: true },
    });
  }
}
