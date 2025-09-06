import { type JSX } from "react";

export function Footer(): JSX.Element {
  return (
    <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      Developed By Chathura Samarajeewa Github:
      <a
        href="https://github.com/ChathuraSam/battleship-game"
        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        target="new"
      >
        https://github.com/ChathuraSam/battleship-game
      </a>
    </footer>
  );
}
