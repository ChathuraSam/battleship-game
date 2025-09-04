import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

// A `main` function so that we can use async/await
async function main() {
  const player1Username = `player_${Date.now()}`;
  const player2Username = `player_${Date.now() + 1}`;

  // Sample board data for battleship
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

  // Create first player (host)
  const player1 = await prisma.player.create({
    data: {
      isHost: true,
      board: sampleBoard,
    },
  });

  // Create a game
  // const game = await prisma.game.create({
  //   data: {
  //     status: "WAITING",
  //     players: {
  //       connect: { id: player1.id },
  //     },
  //   },
  // });

  // Update player1 to be in the game
  // await prisma.player.update({
  //   where: { id: player1.id },
  //   data: { gameId: game.id },
  // });

  // Create second player (opponent)
  const player2 = await prisma.player.create({
    data: {
      isHost: false,
      board: sampleBoard,
    },
  });

  // Update game status to IN_PROGRESS
  // const updatedGame = await prisma.game.update({
  //   where: { id: game.id },
  //   data: { status: "IN_PROGRESS" },
  // });

  // console.log(
  //   `Created game: ${updatedGame.id} with players: ${player1.id} (host) and ${player2.id}`
  // );

  // Create some moves
  // const move1 = await prisma.move.create({
  //   data: {
  //     gameId: game.id,
  //     playerId: player1.id,
  //     x: 0,
  //     y: 0,
  //     hit: true,
  //   },
  // });

  // const move2 = await prisma.move.create({
  //   data: {
  //     gameId: game.id,
  //     playerId: player2.id,
  //     x: 5,
  //     y: 5,
  //     hit: false,
  //   },
  // });

  // console.log(`Created moves: ${JSON.stringify([move1, move2])}`);

  // Retrieve game with all players and moves
  // const gameWithData = await prisma.game.findUnique({
  //   where: { id: game.id },
  //   include: {
  //     players: true,
  //     moves: {
  //       include: {
  //         player: true,
  //       },
  //     },
  //   },
  // });

  // console.log(`Game with data: ${JSON.stringify(gameWithData, null, 2)}`);

  // Retrieve all games that are waiting for players
  // const waitingGames = await prisma.game.findMany({
  //   where: { status: "WAITING" },
  //   include: {
  //     players: true,
  //   },
  // });

  // console.log(`Waiting games: ${JSON.stringify(waitingGames)}`);

  // Retrieve moves for a specific player
  // const playerMoves = await prisma.move.findMany({
  //   where: {
  //     playerId: player1.id,
  //   },
  //   include: {
  //     game: true,
  //   },
  // });

  // console.log(`Player ${player1.id} moves: ${JSON.stringify(playerMoves)}`);

  // Find player by username
  // const foundPlayer = await prisma.player.findUnique({
  //   where: { id: player1Username },
  //   // include: {
  //   //   game: true,
  //   //   moves: true,
  //   // },
  // });

  // console.log(`Found player: ${JSON.stringify(foundPlayer)}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
