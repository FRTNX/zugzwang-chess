// material-ui
import { Typography, Grid } from '@mui/material';

import { useEffect, useState } from "react";

import { Chessboard } from 'react-chessboard';
import { Game } from 'js-chess-engine';

import { useRandomInterval } from '@rennalabs/hooks';

// import { fetchLiveGameDetails } from 'api/game-api';

const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const startingPointOptions = [
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "rnbqkbnr/pppppppp/8/8/8/5P2/PPPPP1PP/RNBQKBNR b KQkq - 0 1",
  "rnbqkb1r/pppppppp/5n2/8/8/5P2/PPPPP1PP/RNBQKBNR w KQkq - 1 2",
  "rnbqkb1r/pppppppp/5n2/8/8/P4P2/1PPPP1PP/RNBQKBNR b KQkq - 0 2",
  "r1bqkb1r/pppppppp/2n2n2/8/8/P4P2/1PPPP1PP/RNBQKBNR w KQkq - 1 3",
  "r1bqkb1r/pppppppp/2n2n2/8/1P6/P4P2/2PPP1PP/RNBQKBNR b KQkq b3 0 3",
  "r1bqkb1r/ppp1pppp/2n2n2/3p4/1P6/P4P2/2PPP1PP/RNBQKBNR w KQkq d6 0 4",
  "r1bqkb1r/ppp1pppp/2n2n2/3p4/1P6/P4P2/1BPPP1PP/RN1QKBNR b KQkq - 1 4",
  "r1bqkb1r/ppp2ppp/2n2n2/3pp3/1P6/P4P2/1BPPP1PP/RN1QKBNR w KQkq e6 0 5",
  "r1bqkb1r/ppp2ppp/2n2n2/3pp3/1P6/P1N2P2/1BPPP1PP/R2QKBNR b KQkq - 1 5",
  "r2qkb1r/ppp2ppp/2n2n2/3ppb2/1P6/P1N2P2/1BPPP1PP/R2QKBNR w KQkq - 2 6",
  "r2qkb1r/ppp2ppp/2n2n2/1N1ppb2/1P6/P4P2/1BPPP1PP/R2QKBNR b KQkq - 3 6",
  "r3kb1r/ppp1qppp/2n2n2/1N1ppb2/1P6/P4P2/1BPPP1PP/R2QKBNR w KQkq - 4 7",
  "r3kb1r/ppp1qppp/2n2n2/1N1ppb2/1P4P1/P4P2/1BPPP2P/R2QKBNR b KQkq g3 0 7",
  "r3kb1r/ppp1qppp/5n2/1N1ppb2/1P1n2P1/P4P2/1BPPP2P/R2QKBNR w KQkq - 1 8",
  "r3kb1r/ppp1qppp/5n2/1N1ppb2/1P1B2P1/P4P2/2PPP2P/R2QKBNR b KQkq - 0 8",
  "r3kb1r/ppp1qppp/5n2/1N1p1b2/1P1p2P1/P4P2/2PPP2P/R2QKBNR w KQkq - 0 9",
  "r3kb1r/ppp1qppp/5n2/1N1p1P2/1P1p4/P4P2/2PPP2P/R2QKBNR b KQkq - 0 9",
  "r3kb1r/ppp2ppp/5n2/1N1pqP2/1P1p4/P4P2/2PPP2P/R2QKBNR w KQkq - 1 10",
  "r3kb1r/ppp2ppp/5n2/1N1pqP2/1P1p4/P4P2/2PPP2P/1R1QKBNR b Kkq - 2 10",
  "r3kb1r/ppp2ppp/5n2/1N1p1q2/1P1p4/P4P2/2PPP2P/1R1QKBNR w Kkq - 0 11",
  "r3kb1r/ppN2ppp/5n2/3p1q2/1P1p4/P4P2/2PPP2P/1R1QKBNR b Kkq - 0 11",
  "r2k1b1r/ppN2ppp/5n2/3p1q2/1P1p4/P4P2/2PPP2P/1R1QKBNR w K - 1 12",
  "N2k1b1r/pp3ppp/5n2/3p1q2/1P1p4/P4P2/2PPP2P/1R1QKBNR b K - 0 12",
  "N1qk1b1r/pp3ppp/5n2/3p4/1P1p4/P4P2/2PPP2P/1R1QKBNR w K - 1 13",
  "2qk1b1r/pp3ppp/1N3n2/3p4/1P1p4/P4P2/2PPP2P/1R1QKBNR b K - 2 13",
  "2qk1b1r/1p3ppp/1p3n2/3p4/1P1p4/P4P2/2PPP2P/1R1QKBNR w K - 0 14",
  "2qk1b1r/1p3ppp/1p3n2/3p4/1P1p4/P4P1B/2PPP2P/1R1QK1NR b K - 1 14",
  "3k1b1r/1pq2ppp/1p3n2/3p4/1P1p4/P4P1B/2PPP2P/1R1QK1NR w K - 2 15",
  "3k1b1r/1pq2ppp/1p3n2/3p4/1P1p4/P4P2/2PPP1BP/1R1QK1NR b K - 3 15",
  "3k3r/1pq2ppp/1p1b1n2/3p4/1P1p4/P4P2/2PPP1BP/1R1QK1NR w K - 4 16",
  "3k3r/1pq2ppp/1p1b1n2/3p4/1P1p4/P4P1P/2PPP1B1/1R1QK1NR b K - 0 16",
  "3k3r/1pq2ppp/1p3n2/3p4/1P1p4/P4P1P/2PPP1Bb/1R1QK1NR w K - 1 17",
  "3k3r/1pq2ppp/1p3n2/3p4/1P1p4/P4P1P/2PPP1BR/1R1QK1N1 b - - 0 17",
  "3k3r/1p3ppp/1p3n2/3p4/1P1p4/P4P1P/2PPP1Bq/1R1QK1N1 w - - 0 18",
  "3k3r/1p3ppp/1p3n2/3p4/1P1p4/P4P1P/2PPP1Bq/1R1Q1KN1 b - - 1 18",
  "3k3r/1p3ppp/1p3n2/3p4/1P1p1q2/P4P1P/2PPP1B1/1R1Q1KN1 w - - 2 19",
  "3k3r/1p3ppp/1p3n2/3p4/1P1p1q2/P4P1P/2PPP1B1/1RQ2KN1 b - - 3 19",
  "3k3r/1p3ppp/1p6/3p4/1P1pnq2/P4P1P/2PPP1B1/1RQ2KN1 w - - 4 20",
  "3k3r/1p3ppp/1p6/3p4/1P1pnq2/P1P2P1P/3PP1B1/1RQ2KN1 b - - 0 20",
  "3k3r/1p3ppp/1p6/3p4/1P2nq2/P1p2P1P/3PP1B1/1RQ2KN1 w - - 0 21",
  "3k3r/1p3ppp/1p6/3p4/1P2nq2/P1P2P1P/4P1B1/1RQ2KN1 b - - 0 21",
  "3k3r/1p3ppp/1p6/3p1q2/1P2n3/P1P2P1P/4P1B1/1RQ2KN1 w - - 1 22",
  "3k3r/1p3ppp/1p6/3p1q2/1PP1n3/P4P1P/4P1B1/1RQ2KN1 b - - 0 22",
  "3k3r/1p3ppp/1p6/3p1q2/1PP5/P4P1P/3nP1B1/1RQ2KN1 w - - 1 23",
  "3k3r/1p3ppp/1p6/3p1q2/1PP5/P4P1P/3QP1B1/1R3KN1 b - - 0 23",
  "3k3r/1p3ppp/1p6/3p4/1PP5/P4P1P/3QP1B1/1q3KN1 w - - 0 24",
  "3k3r/1p3ppp/1p6/3p4/1PP5/P4P1P/3QPKB1/1q4N1 b - - 1 24",
  "3k3r/1p4pp/1p3p2/3p4/1PP5/P4P1P/3QPKB1/1q4N1 w - - 0 25",
  "3k3r/1p4pp/1p3p2/3Q4/1PP5/P4P1P/4PKB1/1q4N1 b - - 0 25",
  "2k4r/1p4pp/1p3p2/3Q4/1PP5/P4P1P/4PKB1/1q4N1 w - - 1 26",
  "2k4r/1p4pp/1p3p2/3Q4/1PP4P/P4P2/4PKB1/1q4N1 b - - 0 26",
  "2k4r/1p4pp/1p3pq1/3Q4/1PP4P/P4P2/4PKB1/6N1 w - - 1 27",
  "2k4r/1p4pp/1p3pq1/3Q4/1PP4P/P4P1B/4PK2/6N1 b - - 2 27",
  "1k5r/1p4pp/1p3pq1/3Q4/1PP4P/P4P1B/4PK2/6N1 w - - 3 28",
  "1k5r/1p4pp/1p2Qpq1/8/1PP4P/P4P1B/4PK2/6N1 b - - 4 28",
  "1k5r/1p4pp/1p2Qp1q/8/1PP4P/P4P1B/4PK2/6N1 w - - 5 29",
  "1k5r/1p4pp/1p1Q1p1q/8/1PP4P/P4P1B/4PK2/6N1 b - - 6 29",
  "k6r/1p4pp/1p1Q1p1q/8/1PP4P/P4P1B/4PK2/6N1 w - - 7 30",
  "k6r/1p4pp/1Q3p1q/8/1PP4P/P4P1B/4PK2/6N1 b - - 0 30",
  "k6r/1p4pp/1Q3p2/8/1PP4q/P4P1B/4PK2/6N1 w - - 0 31",
  "k6r/1p4pp/1Q3p2/8/1PP4q/P4P1B/4P3/5KN1 b - - 1 31",
  "k6r/1p4pp/1Q3p2/8/1Pq5/P4P1B/4P3/5KN1 w - - 0 32",
  "k6r/1p4pp/1Q3p2/8/1Pq5/P4P2/4P1B1/5KN1 b - - 1 32",
  "1k5r/1p4pp/1Q3p2/8/1Pq5/P4P2/4P1B1/5KN1 w - - 2 33",
  "1k5r/1p4pp/1Q3p2/8/1Pq2P2/P7/4P1B1/5KN1 b - - 0 33",
  "1k5r/1p4pp/1Q3p2/8/1P3q2/P7/4P1B1/5KN1 w - - 0 34",
  "1k5r/1p4pp/1Q3p2/8/1P3q2/P7/4P1B1/4K1N1 b - - 1 34",
  "1k5r/1p4pp/1Q3p2/8/1P6/P7/4P1B1/2q1K1N1 w - - 2 35",
  "1k5r/1p4pp/1Q3p2/8/1P6/P7/4PKB1/2q3N1 b - - 3 35",
  "1k5r/1p4pp/1Q3p2/8/1P3q2/P7/4PKB1/6N1 w - - 4 36",
  "1k5r/1p4pp/1Q3p2/8/1P3q2/P7/4P1B1/4K1N1 b - - 5 36",
  "1k5r/1p4pp/1Q3p2/8/1P6/P5q1/4P1B1/4K1N1 w - - 6 37",
  "1k5r/1p4pp/1Q3p2/8/1P6/P5q1/4P1B1/5KN1 b - - 7 37",
  "1k5r/1p4pp/1Q3p2/8/1P3q2/P7/4P1B1/5KN1 w - - 8 38",
  "1k5r/1p4pp/1Q3p2/8/1P3q2/P4B2/4P3/5KN1 b - - 9 38",
  "1k5r/1p4pp/1Q3p2/8/1P6/P4B2/4P3/2q2KN1 w - - 10 39",
  "1k5r/1p4pp/1Q3p2/8/1P6/P4B2/4PK2/2q3N1 b - - 11 39",
  "1k5r/1pq3pp/1Q3p2/8/1P6/P4B2/4PK2/6N1 w - - 12 40",
  "1k5r/1pq3pp/1Q3p2/8/PP6/5B2/4PK2/6N1 b - - 0 40",
  "1k5r/1p4pp/1q3p2/8/PP6/5B2/4PK2/6N1 w - - 0 41",
  "1k5r/1p4pp/1q3p2/8/PP6/5B2/4P3/5KN1 b - - 1 41",
  "1k5r/1p4pp/5p2/8/Pq6/5B2/4P3/5KN1 w - - 0 42",
  "1k5r/1p4pp/5p2/8/Pq6/4PB2/8/5KN1 b - - 0 42",
  "1k5r/1p4pp/5p2/8/P1q5/4PB2/8/5KN1 w - - 1 43",
  "1k5r/1p4pp/5p2/8/P1q5/4PB2/8/4K1N1 b - - 2 43",
  "1k5r/1p4pp/5p2/8/q7/4PB2/8/4K1N1 w - - 0 44",
  "1k5r/1p4pp/5p2/8/q7/4PB2/3K4/6N1 b - - 1 44",
  "1k5r/1p4pp/5p2/8/1q6/4PB2/3K4/6N1 w - - 2 45",
  "1k5r/1p4pp/5p2/8/1q6/4PB2/8/2K3N1 b - - 3 45",
  "1k5r/1p4pp/5p2/8/8/4PB2/8/2K1q1N1 w - - 4 46",
  "1k5r/1p4pp/5p2/8/8/4PB2/1K6/4q1N1 b - - 5 46",
  "1k5r/1p4pp/5p2/8/8/4qB2/1K6/6N1 w - - 0 47",
  "1k5r/1p4pp/5p2/8/8/4q3/1K6/3B2N1 b - - 1 47",
  "1k5r/1p4pp/5p2/8/8/8/1K6/3B2q1 w - - 0 48",
  "1k5r/1p4pp/5p2/8/8/8/8/K2B2q1 b - - 1 48",
  "1k5r/1p4pp/5p2/8/3q4/8/8/K2B4 w - - 2 49",
  "1k5r/1p4pp/5p2/8/3q4/8/8/1K1B4 b - - 3 49",
  "1k5r/1p4pp/5p2/8/8/8/8/1K1q4 w - - 0 50",
  "1k5r/1p4pp/5p2/8/8/8/K7/3q4 b - - 1 50",
  "1k5r/1p4pp/5p2/3q4/8/8/K7/8 w - - 2 51",
  "1k5r/1p4pp/5p2/3q4/8/8/8/K7 b - - 3 51",
  "1k1r4/1p4pp/5p2/3q4/8/8/8/K7 w - - 4 52",
  "1k1r4/1p4pp/5p2/3q4/8/8/8/1K6 b - - 5 52",
  "1k1r4/1p4pp/5p2/8/3q4/8/8/1K6 w - - 6 53",
  "1k1r4/1p4pp/5p2/8/3q4/8/K7/8 b - - 7 53",
  "1k1r4/1p4p1/5p1p/8/3q4/8/K7/8 w - - 0 54",
  "1k1r4/1p4p1/5p1p/8/3q4/K7/8/8 b - - 1 54",
  "1k1r4/1p6/5p1p/6p1/3q4/K7/8/8 w - g6 0 55",
  "1k1r4/1p6/5p1p/6p1/3q4/1K6/8/8 b - - 1 55",
  "1k1r4/1p6/5p1p/8/3q2p1/1K6/8/8 w - - 0 56",
  "1k1r4/1p6/5p1p/8/3q2p1/8/2K5/8 b - - 1 56",
  "1k2r3/1p6/5p1p/8/3q2p1/8/2K5/8 w - - 2 57",
  "1k2r3/1p6/5p1p/8/3q2p1/8/8/2K5 b - - 3 57",
  "1k6/1p6/5p1p/8/3q2p1/8/4r3/2K5 w - - 4 58",
  "1k6/1p6/5p1p/8/3q2p1/8/4r3/1K6 b - - 5 58",
  "1k6/1p6/5p1p/8/6p1/8/1q2r3/1K6 w - - 6 59"
];

const NAMES = [
  'Alvin', 'Andile', 'Amu', 'Amukele',
  'Anele', 'Ayanda', 'Azana', 'Arnold',
  'Amanda', 'Blessing', 'Alostro',
  'Bulelani', 'Busi', 'Busisiwe', 'Bongizizwe',
  'Barry', 'Ben', 'Ben', 'Benny',
  'Benard', 'Bantu', 'Camagwin', 'Cindy',
  'Carlos', 'Calvin', 'Carlton', 'Desmond',
  'Dudu', 'Duduzile', 'Dumi', 'Dumezweni',
  'Damara', 'Daniel', 'David', 'Don',
  'Donald', 'Donny', 'Elvis', 'Elijah',
  'Ellen', 'Eliza', 'Elizabeth', 'Ezra',
  'Fungai', 'Farai', 'Fezile', 'Freddy',
  'Frederick', 'Lunga', 'Langa', 'Lungile',
  'Mayibongwe', 'Slibaziso', 'Xolani', 'Zolani',
  'Zola', 'Zingelwayo', 'Zweli', 'Zwelithini', 'Sisa'
];

const SURNAMES = [
  'Bhebhe', 'Baloyi', 'Bhungane', 'Cele',
  'Carter', 'Chess', 'Dube', 'Dawson',
  'Ncube', 'Dread', 'Gasa', 'Gumede',
  'Mthuli', 'Gumbo', 'Hlabangana', 'Hadebe',
  'Jama', 'Khoza', 'Khuzwayo', 'Khumalo',
  'Luthuli', 'Luveve', 'Lwethu', 'Lembe',
  'Masego', 'Moyo', 'Magwegwe', 'Mafu',
  'Manzini', 'Mhlophe', 'Mlevu', 'Mthembu',
  'Msipha', 'Msolo', 'Mbatha', 'Mnkandla',
  'Ndlovu', 'Ndiweni', 'Nxumalo', 'Phondo',
  'Phongwane', 'Qwabe', 'Sangweni', 'Tshabalala',
  'Tshuma', 'Vela', 'Vilakazi', 'Zilankatha',
  'Zwide', 'Zweni', 'Zwane', 'Takawira',
];

const NICKNAMES = [
  'Star Lord', 'Thanos', 'Vera', 'Intunta', 'FRTNX', 'ellehook', 'Insingo',
  'Chess God', 'Insukamini', 'Inzwananzi', 'Hlokohloko', 'Tshetshe', 'Dibinhlangu',
  'Godlwayo', 'Inxa', 'Intemba', 'Indinana', 'Induba', 'Inhlambane', 'Inqama',
  'Insinda', 'Isiphezi'
];

const selectPlayerName = () => {
  const types = ['FULLNAME', 'FULLNAME', 'FULLNAME', 'NICKNAME'];
  const type = types[random(0, types.length)];

  if (type === 'NICKNAME') {
    return NICKNAMES[random(0, NICKNAMES.length)];
  }

  if (type === 'FULLNAME') {
    const name = NAMES[random(0, NAMES.length)];
    const surname = SURNAMES[random(0, SURNAMES.length)];

    const playerName = `${name} ${surname}`;
    return playerName;
  }
}

const ChessClock = (props) => {
  return (
    <>
      <Grid container xs={12}>
        <Grid item xs={8}>
          <Typography>
            {props.playerName}
          </Typography>
        </Grid>
      </Grid>
    </>
  )
};

const ChessMatch = (props) => {
  const [values, setValues] = useState({
    playerOne: selectPlayerName(),
    playerTwo: selectPlayerName(),
    fen: startingPointOptions[random(0, startingPointOptions.length)],
    gameOver: false
  });

  const [gameOver, setGameOver] = useState(false);

  const interval = useRandomInterval(() => {
    let previousFen = values.fen;
    const game = new Game(previousFen);
    const gameState = game.exportJson();

    if (gameState.isFinished) {
      setGameOver(true);
      return;
    }
    else {
      game.aiMove(1);
      const incomingFen = game.exportFEN();
      setValues({ ...values, fen: incomingFen });
      previousFen = incomingFen;
    }
  }, 1000, 3000);

  useEffect(() => {
    interval.start();

    if (values.gameOver) {
      return interval.stop();
    }

    return () => interval.stop();
  }, []);

  if (gameOver) {
    console.log('gameOver value:', gameOver)
    // handleGameOver();
    // setValues({
    //     ...values,
    //     playerOne: 'player 1.2',
    //     playerTwo: 'player 2.2',
    //     fen: startingPointOptions[random(0, startingPointOptions.length)],
    //     gameOver: false
    // });
  }

  return (
    <div>
      <ChessClock playerName={values.playerOne} />
      <Chessboard arePiecesDraggable={false} position={values.fen} />
      <ChessClock playerName={values.playerTwo} />
    </div>
  );
};

export default ChessMatch;