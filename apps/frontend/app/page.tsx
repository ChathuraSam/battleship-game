"use client";

import Image, { type ImageProps } from "next/image";
import { Button } from "@repo/ui/button";
import { Grid } from "@repo/ui/grid";
import styles from "./page.module.css";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  );
};

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Button appName="web" className={styles.secondary}>
          Open alert
        </Button>

        <div style={{ marginTop: "2rem" }}>
          <h2>Battleship Grid Demo</h2>
          <p>Click on cells to mark them (red = hit)</p>
          <Grid
            onCellClick={(row, col, isSelected) => {
              console.log(
                `Cell ${row + 1}-${col + 1} ${isSelected ? "selected" : "deselected"}`
              );
            }}
          />
        </div>
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
