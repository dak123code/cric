export interface Player {
  id: number;
  name: string;
  role: "batsman" | "bowler" | "allrounder" | "wicketkeeper";
  country: string;
  battingRating: number;  // 0–990 ICC-style, ÷10 for display
  bowlingRating: number;  // 0–990 ICC-style, ÷10 for display
  keepingRating: number;  // 0–990 ICC-style, ÷10 for display
  overallRating: number;  // 0–990 ICC-style, ÷10 for display (card number)
  age: number;
  salary: number;
}

const ALL_PLAYERS: Player[] = [
  // ── India ─────────────────────────────────────────────────────────────────
  { id: 1,   name: "Rohit Sharma",          role: "batsman",      country: "India",         battingRating: 780, bowlingRating: 200,  keepingRating: 0,   overallRating: 780, age: 37, salary: 160 },
  { id: 2,   name: "Virat Kohli",           role: "batsman",      country: "India",         battingRating: 770, bowlingRating: 200,  keepingRating: 0,   overallRating: 770, age: 36, salary: 175 },
  { id: 3,   name: "Shubman Gill",          role: "batsman",      country: "India",         battingRating: 720, bowlingRating: 100,  keepingRating: 0,   overallRating: 720, age: 25, salary: 125 },
  { id: 4,   name: "KL Rahul",              role: "wicketkeeper", country: "India",         battingRating: 640, bowlingRating: 0,   keepingRating: 900,  overallRating: 640, age: 33, salary: 130 },
  { id: 5,   name: "Rishabh Pant",          role: "wicketkeeper", country: "India",         battingRating: 680, bowlingRating: 0,   keepingRating: 900,  overallRating: 680, age: 27, salary: 160 },
  { id: 6,   name: "Hardik Pandya",         role: "allrounder",   country: "India",         battingRating: 550, bowlingRating: 800,  keepingRating: 0,   overallRating: 750, age: 31, salary: 145 },
  { id: 7,   name: "Ravindra Jadeja",       role: "allrounder",   country: "India",         battingRating: 450, bowlingRating: 900,  keepingRating: 0,   overallRating: 780, age: 36, salary: 135 },
  { id: 8,   name: "R. Ashwin",             role: "allrounder",   country: "India",         battingRating: 350, bowlingRating: 900,  keepingRating: 0,   overallRating: 750, age: 38, salary: 120 },
  { id: 9,   name: "Jasprit Bumrah",        role: "bowler",       country: "India",         battingRating: 50,  bowlingRating: 1000, keepingRating: 0,   overallRating: 900, age: 31, salary: 170 },
  { id: 10,  name: "Mohammed Shami",        role: "bowler",       country: "India",         battingRating: 80,  bowlingRating: 900,  keepingRating: 0,   overallRating: 800, age: 34, salary: 115 },
  { id: 11,  name: "Yuzvendra Chahal",      role: "bowler",       country: "India",         battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 700, age: 34, salary: 100 },
  { id: 12,  name: "Ishan Kishan",          role: "wicketkeeper", country: "India",         battingRating: 600, bowlingRating: 0,   keepingRating: 800,  overallRating: 620, age: 26, salary: 90  },
  { id: 13,  name: "Suryakumar Yadav",      role: "batsman",      country: "India",         battingRating: 820, bowlingRating: 100,  keepingRating: 0,   overallRating: 820, age: 34, salary: 155 },
  { id: 14,  name: "Kuldeep Yadav",         role: "bowler",       country: "India",         battingRating: 50,  bowlingRating: 800,  keepingRating: 0,   overallRating: 730, age: 30, salary: 95  },
  { id: 15,  name: "Axar Patel",            role: "allrounder",   country: "India",         battingRating: 350, bowlingRating: 800,  keepingRating: 0,   overallRating: 680, age: 31, salary: 90  },

  // ── Australia ─────────────────────────────────────────────────────────────
  { id: 16,  name: "David Warner",          role: "batsman",      country: "Australia",     battingRating: 750, bowlingRating: 100,  keepingRating: 0,   overallRating: 750, age: 38, salary: 145 },
  { id: 17,  name: "Steve Smith",           role: "batsman",      country: "Australia",     battingRating: 820, bowlingRating: 300,  keepingRating: 0,   overallRating: 820, age: 35, salary: 160 },
  { id: 18,  name: "Pat Cummins",           role: "bowler",       country: "Australia",     battingRating: 300, bowlingRating: 900,  keepingRating: 0,   overallRating: 850, age: 32, salary: 155 },
  { id: 19,  name: "Mitchell Starc",        role: "bowler",       country: "Australia",     battingRating: 150, bowlingRating: 900,  keepingRating: 0,   overallRating: 850, age: 35, salary: 140 },
  { id: 20,  name: "Adam Zampa",            role: "bowler",       country: "Australia",     battingRating: 80,  bowlingRating: 800,  keepingRating: 0,   overallRating: 720, age: 32, salary: 95  },
  { id: 21,  name: "Travis Head",           role: "batsman",      country: "Australia",     battingRating: 780, bowlingRating: 200,  keepingRating: 0,   overallRating: 780, age: 31, salary: 120 },
  { id: 22,  name: "Glenn Maxwell",         role: "allrounder",   country: "Australia",     battingRating: 520, bowlingRating: 700,  keepingRating: 0,   overallRating: 740, age: 36, salary: 130 },
  { id: 23,  name: "Matthew Wade",          role: "wicketkeeper", country: "Australia",     battingRating: 400, bowlingRating: 0,   keepingRating: 800,  overallRating: 580, age: 37, salary: 80  },
  { id: 24,  name: "Marcus Stoinis",        role: "allrounder",   country: "Australia",     battingRating: 450, bowlingRating: 600,  keepingRating: 0,   overallRating: 650, age: 35, salary: 95  },
  { id: 25,  name: "Josh Hazlewood",        role: "bowler",       country: "Australia",     battingRating: 50,  bowlingRating: 900,  keepingRating: 0,   overallRating: 800, age: 34, salary: 125 },

  // ── England ───────────────────────────────────────────────────────────────
  { id: 26,  name: "Jos Buttler",           role: "wicketkeeper", country: "England",       battingRating: 760, bowlingRating: 0,   keepingRating: 900,  overallRating: 760, age: 34, salary: 140 },
  { id: 27,  name: "Ben Stokes",            role: "allrounder",   country: "England",       battingRating: 580, bowlingRating: 800,  keepingRating: 0,   overallRating: 820, age: 33, salary: 155 },
  { id: 28,  name: "Joe Root",              role: "batsman",      country: "England",       battingRating: 900, bowlingRating: 500,  keepingRating: 0,   overallRating: 900, age: 34, salary: 150 },
  { id: 29,  name: "Jofra Archer",          role: "bowler",       country: "England",       battingRating: 120, bowlingRating: 800,  keepingRating: 0,   overallRating: 780, age: 30, salary: 130 },
  { id: 30,  name: "Adil Rashid",           role: "bowler",       country: "England",       battingRating: 100, bowlingRating: 700,  keepingRating: 0,   overallRating: 700, age: 37, salary: 95  },
  { id: 31,  name: "Sam Curran",            role: "allrounder",   country: "England",       battingRating: 350, bowlingRating: 800,  keepingRating: 0,   overallRating: 650, age: 27, salary: 105 },
  { id: 32,  name: "Jonny Bairstow",        role: "wicketkeeper", country: "England",       battingRating: 520, bowlingRating: 0,   keepingRating: 800,  overallRating: 680, age: 35, salary: 115 },
  { id: 33,  name: "Mark Wood",             role: "bowler",       country: "England",       battingRating: 100, bowlingRating: 800,  keepingRating: 0,   overallRating: 750, age: 34, salary: 110 },
  { id: 34,  name: "Liam Livingstone",      role: "allrounder",   country: "England",       battingRating: 480, bowlingRating: 700,  keepingRating: 0,   overallRating: 650, age: 31, salary: 105 },
  { id: 35,  name: "Phil Salt",             role: "batsman",      country: "England",       battingRating: 680, bowlingRating: 0,   keepingRating: 0,   overallRating: 650, age: 28, salary: 90  },

  // ── Pakistan ──────────────────────────────────────────────────────────────
  { id: 36,  name: "Babar Azam",            role: "batsman",      country: "Pakistan",      battingRating: 720, bowlingRating: 100,  keepingRating: 0,   overallRating: 720, age: 30, salary: 160 },
  { id: 37,  name: "Shaheen Afridi",        role: "bowler",       country: "Pakistan",      battingRating: 120, bowlingRating: 900,  keepingRating: 0,   overallRating: 820, age: 24, salary: 130 },
  { id: 38,  name: "Mohammad Rizwan",       role: "wicketkeeper", country: "Pakistan",      battingRating: 620, bowlingRating: 0,   keepingRating: 900,  overallRating: 700, age: 32, salary: 135 },
  { id: 39,  name: "Shadab Khan",           role: "allrounder",   country: "Pakistan",      battingRating: 320, bowlingRating: 800,  keepingRating: 0,   overallRating: 620, age: 26, salary: 100 },
  { id: 40,  name: "Fakhar Zaman",          role: "batsman",      country: "Pakistan",      battingRating: 590, bowlingRating: 100,  keepingRating: 0,   overallRating: 590, age: 34, salary: 110 },
  { id: 41,  name: "Naseem Shah",           role: "bowler",       country: "Pakistan",      battingRating: 100, bowlingRating: 800,  keepingRating: 0,   overallRating: 750, age: 22, salary: 105 },
  { id: 42,  name: "Imad Wasim",            role: "allrounder",   country: "Pakistan",      battingRating: 280, bowlingRating: 700,  keepingRating: 0,   overallRating: 580, age: 35, salary: 80  },
  { id: 43,  name: "Haris Rauf",            role: "bowler",       country: "Pakistan",      battingRating: 100, bowlingRating: 700,  keepingRating: 0,   overallRating: 700, age: 31, salary: 100 },

  // ── New Zealand ───────────────────────────────────────────────────────────
  { id: 44,  name: "Kane Williamson",       role: "batsman",      country: "New Zealand",   battingRating: 660, bowlingRating: 400,  keepingRating: 0,   overallRating: 660, age: 34, salary: 145 },
  { id: 45,  name: "Trent Boult",           role: "bowler",       country: "New Zealand",   battingRating: 80,  bowlingRating: 800,  keepingRating: 0,   overallRating: 780, age: 35, salary: 120 },
  { id: 46,  name: "Devon Conway",          role: "wicketkeeper", country: "New Zealand",   battingRating: 680, bowlingRating: 0,   keepingRating: 800,  overallRating: 680, age: 33, salary: 110 },
  { id: 47,  name: "Daryl Mitchell",        role: "allrounder",   country: "New Zealand",   battingRating: 580, bowlingRating: 700,  keepingRating: 0,   overallRating: 770, age: 33, salary: 100 },
  { id: 48,  name: "Ish Sodhi",             role: "bowler",       country: "New Zealand",   battingRating: 80,  bowlingRating: 600,  keepingRating: 0,   overallRating: 580, age: 32, salary: 90  },

  // ── South Africa ──────────────────────────────────────────────────────────
  { id: 49,  name: "Quinton de Kock",       role: "wicketkeeper", country: "South Africa",  battingRating: 720, bowlingRating: 0,   keepingRating: 900,  overallRating: 720, age: 32, salary: 135 },
  { id: 50,  name: "Kagiso Rabada",         role: "bowler",       country: "South Africa",  battingRating: 120, bowlingRating: 900,  keepingRating: 0,   overallRating: 820, age: 30, salary: 145 },
  { id: 51,  name: "David Miller",          role: "batsman",      country: "South Africa",  battingRating: 640, bowlingRating: 100,  keepingRating: 0,   overallRating: 640, age: 35, salary: 115 },
  { id: 52,  name: "Anrich Nortje",         role: "bowler",       country: "South Africa",  battingRating: 80,  bowlingRating: 800,  keepingRating: 0,   overallRating: 750, age: 31, salary: 115 },
  { id: 53,  name: "Aiden Markram",         role: "batsman",      country: "South Africa",  battingRating: 590, bowlingRating: 500,  keepingRating: 0,   overallRating: 590, age: 30, salary: 110 },
  { id: 54,  name: "Marco Jansen",          role: "allrounder",   country: "South Africa",  battingRating: 420, bowlingRating: 800,  keepingRating: 0,   overallRating: 680, age: 24, salary: 100 },

  // ── West Indies ───────────────────────────────────────────────────────────
  { id: 55,  name: "Kieron Pollard",        role: "allrounder",   country: "West Indies",   battingRating: 450, bowlingRating: 700,  keepingRating: 0,   overallRating: 680, age: 37, salary: 120 },
  { id: 56,  name: "Andre Russell",         role: "allrounder",   country: "West Indies",   battingRating: 580, bowlingRating: 800,  keepingRating: 0,   overallRating: 780, age: 36, salary: 140 },
  { id: 57,  name: "Nicholas Pooran",       role: "wicketkeeper", country: "West Indies",   battingRating: 680, bowlingRating: 0,   keepingRating: 800,  overallRating: 680, age: 29, salary: 120 },
  { id: 58,  name: "Shimron Hetmyer",       role: "batsman",      country: "West Indies",   battingRating: 620, bowlingRating: 100,  keepingRating: 0,   overallRating: 620, age: 28, salary: 105 },
  { id: 59,  name: "Jason Holder",          role: "allrounder",   country: "West Indies",   battingRating: 320, bowlingRating: 800,  keepingRating: 0,   overallRating: 650, age: 33, salary: 110 },
  { id: 60,  name: "Alzarri Joseph",        role: "bowler",       country: "West Indies",   battingRating: 80,  bowlingRating: 700,  keepingRating: 0,   overallRating: 700, age: 28, salary: 100 },

  // ── Sri Lanka ─────────────────────────────────────────────────────────────
  { id: 61,  name: "Wanindu Hasaranga",     role: "allrounder",   country: "Sri Lanka",     battingRating: 350, bowlingRating: 900,  keepingRating: 0,   overallRating: 750, age: 27, salary: 120 },
  { id: 62,  name: "Dasun Shanaka",         role: "allrounder",   country: "Sri Lanka",     battingRating: 350, bowlingRating: 600,  keepingRating: 0,   overallRating: 580, age: 32, salary: 90  },
  { id: 63,  name: "Pathum Nissanka",       role: "batsman",      country: "Sri Lanka",     battingRating: 780, bowlingRating: 100,  keepingRating: 0,   overallRating: 780, age: 26, salary: 90  },
  { id: 64,  name: "Kusal Mendis",          role: "wicketkeeper", country: "Sri Lanka",     battingRating: 620, bowlingRating: 0,   keepingRating: 800,  overallRating: 620, age: 29, salary: 90  },

  // ── Bangladesh ────────────────────────────────────────────────────────────
  { id: 65,  name: "Shakib Al Hasan",       role: "allrounder",   country: "Bangladesh",    battingRating: 480, bowlingRating: 800,  keepingRating: 0,   overallRating: 720, age: 37, salary: 115 },
  { id: 66,  name: "Mushfiqur Rahim",       role: "wicketkeeper", country: "Bangladesh",    battingRating: 550, bowlingRating: 0,   keepingRating: 800,  overallRating: 550, age: 37, salary: 90  },
  { id: 67,  name: "Tamim Iqbal",           role: "batsman",      country: "Bangladesh",    battingRating: 600, bowlingRating: 100,  keepingRating: 0,   overallRating: 600, age: 35, salary: 95  },
  { id: 68,  name: "Mustafizur Rahman",     role: "bowler",       country: "Bangladesh",    battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 700, age: 29, salary: 95  },

  // ── Afghanistan ───────────────────────────────────────────────────────────
  { id: 69,  name: "Rashid Khan",           role: "bowler",       country: "Afghanistan",   battingRating: 200, bowlingRating: 900,  keepingRating: 0,   overallRating: 880, age: 26, salary: 140 },
  { id: 70,  name: "Mohammad Nabi",         role: "allrounder",   country: "Afghanistan",   battingRating: 380, bowlingRating: 700,  keepingRating: 0,   overallRating: 650, age: 40, salary: 90  },
  { id: 71,  name: "Mujeeb Ur Rahman",      role: "bowler",       country: "Afghanistan",   battingRating: 50,  bowlingRating: 800,  keepingRating: 0,   overallRating: 700, age: 23, salary: 95  },
  { id: 72,  name: "Ibrahim Zadran",        role: "batsman",      country: "Afghanistan",   battingRating: 650, bowlingRating: 100,  keepingRating: 0,   overallRating: 650, age: 22, salary: 80  },

  // ── IPL-specific / global stars ───────────────────────────────────────────
  { id: 73,  name: "Faf du Plessis",        role: "batsman",      country: "South Africa",  battingRating: 620, bowlingRating: 100,  keepingRating: 0,   overallRating: 700, age: 40, salary: 130 },
  { id: 74,  name: "AB de Villiers",        role: "batsman",      country: "South Africa",  battingRating: 780, bowlingRating: 100,  keepingRating: 800,  overallRating: 820, age: 41, salary: 170 },
  { id: 75,  name: "Chris Gayle",           role: "batsman",      country: "West Indies",   battingRating: 620, bowlingRating: 400,  keepingRating: 0,   overallRating: 700, age: 45, salary: 135 },
  { id: 76,  name: "Sunil Narine",          role: "allrounder",   country: "West Indies",   battingRating: 520, bowlingRating: 900,  keepingRating: 0,   overallRating: 780, age: 36, salary: 130 },
  { id: 77,  name: "Dinesh Karthik",        role: "wicketkeeper", country: "India",         battingRating: 520, bowlingRating: 0,   keepingRating: 800,  overallRating: 650, age: 39, salary: 85  },
  { id: 78,  name: "Ambati Rayudu",         role: "batsman",      country: "India",         battingRating: 480, bowlingRating: 100,  keepingRating: 0,   overallRating: 620, age: 39, salary: 80  },
  { id: 79,  name: "Deepak Chahar",         role: "allrounder",   country: "India",         battingRating: 280, bowlingRating: 800,  keepingRating: 0,   overallRating: 650, age: 32, salary: 90  },
  { id: 80,  name: "Krunal Pandya",         role: "allrounder",   country: "India",         battingRating: 320, bowlingRating: 700,  keepingRating: 0,   overallRating: 630, age: 34, salary: 85  },
  { id: 81,  name: "Shivam Dube",           role: "allrounder",   country: "India",         battingRating: 480, bowlingRating: 600,  keepingRating: 0,   overallRating: 660, age: 31, salary: 80  },
  { id: 82,  name: "Rinku Singh",           role: "batsman",      country: "India",         battingRating: 640, bowlingRating: 100,  keepingRating: 0,   overallRating: 660, age: 27, salary: 85  },
  { id: 83,  name: "Yashasvi Jaiswal",      role: "batsman",      country: "India",         battingRating: 750, bowlingRating: 100,  keepingRating: 0,   overallRating: 750, age: 23, salary: 110 },
  { id: 84,  name: "Tilak Varma",           role: "batsman",      country: "India",         battingRating: 770, bowlingRating: 100,  keepingRating: 0,   overallRating: 770, age: 22, salary: 90  },
  { id: 85,  name: "Tristan Stubbs",        role: "batsman",      country: "South Africa",  battingRating: 670, bowlingRating: 100,  keepingRating: 0,   overallRating: 670, age: 24, salary: 85  },
  { id: 86,  name: "Ravichandran Ashwin",   role: "allrounder",   country: "India",         battingRating: 350, bowlingRating: 900,  keepingRating: 0,   overallRating: 720, age: 38, salary: 110 },
  { id: 87,  name: "Mohsin Khan",           role: "bowler",       country: "India",         battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 620, age: 26, salary: 75  },
  { id: 88,  name: "Avesh Khan",            role: "bowler",       country: "India",         battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 620, age: 28, salary: 80  },
  { id: 89,  name: "Arshdeep Singh",        role: "bowler",       country: "India",         battingRating: 50,  bowlingRating: 800,  keepingRating: 0,   overallRating: 680, age: 26, salary: 95  },
  { id: 90,  name: "Prasidh Krishna",       role: "bowler",       country: "India",         battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 630, age: 29, salary: 85  },
  { id: 91,  name: "Ravi Bishnoi",          role: "bowler",       country: "India",         battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 650, age: 24, salary: 85  },
  { id: 92,  name: "Rahul Tripathi",        role: "batsman",      country: "India",         battingRating: 500, bowlingRating: 100,  keepingRating: 0,   overallRating: 600, age: 34, salary: 75  },
  { id: 93,  name: "Nitish Rana",           role: "batsman",      country: "India",         battingRating: 520, bowlingRating: 200,  keepingRating: 0,   overallRating: 600, age: 30, salary: 75  },
  { id: 94,  name: "Venkatesh Iyer",        role: "allrounder",   country: "India",         battingRating: 480, bowlingRating: 600,  keepingRating: 0,   overallRating: 630, age: 30, salary: 80  },
  { id: 95,  name: "Shardul Thakur",        role: "allrounder",   country: "India",         battingRating: 280, bowlingRating: 700,  keepingRating: 0,   overallRating: 640, age: 33, salary: 80  },
  { id: 96,  name: "Umesh Yadav",           role: "bowler",       country: "India",         battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 630, age: 37, salary: 70  },
  { id: 97,  name: "Sai Sudharsan",         role: "batsman",      country: "India",         battingRating: 680, bowlingRating: 100,  keepingRating: 0,   overallRating: 680, age: 23, salary: 85  },
  { id: 98,  name: "Rachin Ravindra",       role: "allrounder",   country: "New Zealand",   battingRating: 480, bowlingRating: 700,  keepingRating: 0,   overallRating: 650, age: 25, salary: 100 },
  { id: 99,  name: "Finn Allen",            role: "batsman",      country: "New Zealand",   battingRating: 540, bowlingRating: 100,  keepingRating: 0,   overallRating: 540, age: 25, salary: 90  },
  { id: 100, name: "Reece Topley",          role: "bowler",       country: "England",       battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 600, age: 30, salary: 85  },

  // ── IPL 2026 Squad additions ───────────────────────────────────────────────
  { id: 101, name: "Ryan Rickelton",        role: "wicketkeeper", country: "South Africa",  battingRating: 580, bowlingRating: 0,   keepingRating: 800,  overallRating: 580, age: 24, salary: 75  },
  { id: 102, name: "Naman Dhir",            role: "batsman",      country: "India",         battingRating: 520, bowlingRating: 300,  keepingRating: 0,   overallRating: 600, age: 23, salary: 70  },
  { id: 103, name: "Robin Minz",            role: "wicketkeeper", country: "India",         battingRating: 450, bowlingRating: 0,   keepingRating: 700,  overallRating: 550, age: 22, salary: 60  },
  { id: 104, name: "Mitchell Santner",      role: "allrounder",   country: "New Zealand",   battingRating: 280, bowlingRating: 700,  keepingRating: 0,   overallRating: 600, age: 33, salary: 85  },
  { id: 105, name: "MS Dhoni",              role: "wicketkeeper", country: "India",         battingRating: 620, bowlingRating: 0,   keepingRating: 1000, overallRating: 780, age: 43, salary: 80  },
  { id: 106, name: "Ruturaj Gaikwad",       role: "batsman",      country: "India",         battingRating: 700, bowlingRating: 100,  keepingRating: 0,   overallRating: 700, age: 28, salary: 175 },
  { id: 107, name: "Matheesha Pathirana",   role: "bowler",       country: "Sri Lanka",     battingRating: 50,  bowlingRating: 800,  keepingRating: 0,   overallRating: 720, age: 23, salary: 120 },
  { id: 108, name: "Khaleel Ahmed",         role: "bowler",       country: "India",         battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 620, age: 31, salary: 75  },
  { id: 109, name: "Rajat Patidar",         role: "batsman",      country: "India",         battingRating: 660, bowlingRating: 100,  keepingRating: 0,   overallRating: 660, age: 32, salary: 110 },
  { id: 110, name: "Tim David",             role: "batsman",      country: "Singapore",     battingRating: 680, bowlingRating: 100,  keepingRating: 0,   overallRating: 680, age: 29, salary: 120 },
  { id: 111, name: "Bhuvneshwar Kumar",     role: "allrounder",   country: "India",         battingRating: 200, bowlingRating: 800,  keepingRating: 0,   overallRating: 650, age: 35, salary: 100 },
  { id: 112, name: "Cameron Green",         role: "allrounder",   country: "Australia",     battingRating: 480, bowlingRating: 700,  keepingRating: 0,   overallRating: 680, age: 26, salary: 130 },
  { id: 113, name: "Jitesh Sharma",         role: "wicketkeeper", country: "India",         battingRating: 550, bowlingRating: 0,   keepingRating: 700,  overallRating: 620, age: 31, salary: 80  },
  { id: 114, name: "Varun Chakaravarthy",   role: "bowler",       country: "India",         battingRating: 50,  bowlingRating: 800,  keepingRating: 0,   overallRating: 700, age: 34, salary: 115 },
  { id: 115, name: "Harshit Rana",          role: "bowler",       country: "India",         battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 640, age: 25, salary: 85  },
  { id: 116, name: "Angkrish Raghuvanshi",  role: "batsman",      country: "India",         battingRating: 580, bowlingRating: 100,  keepingRating: 0,   overallRating: 620, age: 19, salary: 65  },
  { id: 117, name: "Moeen Ali",             role: "allrounder",   country: "England",       battingRating: 380, bowlingRating: 700,  keepingRating: 0,   overallRating: 620, age: 37, salary: 85  },
  { id: 118, name: "Jake Fraser-McGurk",    role: "batsman",      country: "Australia",     battingRating: 680, bowlingRating: 100,  keepingRating: 0,   overallRating: 680, age: 23, salary: 100 },
  { id: 119, name: "Harry Brook",           role: "batsman",      country: "England",       battingRating: 770, bowlingRating: 300,  keepingRating: 0,   overallRating: 770, age: 26, salary: 115 },
  { id: 120, name: "Mukesh Kumar",          role: "bowler",       country: "India",         battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 620, age: 31, salary: 70  },
  { id: 121, name: "T Natarajan",           role: "bowler",       country: "India",         battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 620, age: 34, salary: 75  },
  { id: 122, name: "Abhishek Sharma",       role: "allrounder",   country: "India",         battingRating: 680, bowlingRating: 700,  keepingRating: 0,   overallRating: 910, age: 25, salary: 140 },
  { id: 123, name: "Nitish Kumar Reddy",    role: "allrounder",   country: "India",         battingRating: 480, bowlingRating: 700,  keepingRating: 0,   overallRating: 640, age: 22, salary: 60  },
  { id: 124, name: "Harshal Patel",         role: "allrounder",   country: "India",         battingRating: 180, bowlingRating: 800,  keepingRating: 0,   overallRating: 650, age: 34, salary: 90  },
  { id: 125, name: "Heinrich Klaasen",      role: "wicketkeeper", country: "South Africa",  battingRating: 700, bowlingRating: 0,   keepingRating: 800,  overallRating: 700, age: 33, salary: 130 },
  { id: 126, name: "Mohammed Siraj",        role: "bowler",       country: "India",         battingRating: 50,  bowlingRating: 800,  keepingRating: 0,   overallRating: 720, age: 31, salary: 95  },
  { id: 127, name: "Jaydev Unadkat",        role: "bowler",       country: "India",         battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 600, age: 33, salary: 75  },
  { id: 128, name: "Sanju Samson",          role: "wicketkeeper", country: "India",         battingRating: 640, bowlingRating: 0,   keepingRating: 900,  overallRating: 640, age: 30, salary: 160 },
  { id: 129, name: "Riyan Parag",           role: "allrounder",   country: "India",         battingRating: 520, bowlingRating: 600,  keepingRating: 0,   overallRating: 650, age: 23, salary: 110 },
  { id: 130, name: "Dhruv Jurel",           role: "wicketkeeper", country: "India",         battingRating: 580, bowlingRating: 0,   keepingRating: 800,  overallRating: 620, age: 24, salary: 90  },
  { id: 131, name: "Maheesh Theekshana",    role: "bowler",       country: "Sri Lanka",     battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 700, age: 25, salary: 70  },
  { id: 132, name: "Shreyas Iyer",          role: "batsman",      country: "India",         battingRating: 680, bowlingRating: 100,  keepingRating: 0,   overallRating: 680, age: 30, salary: 165 },
  { id: 133, name: "Prabhsimran Singh",     role: "wicketkeeper", country: "India",         battingRating: 650, bowlingRating: 0,   keepingRating: 800,  overallRating: 650, age: 24, salary: 90  },
  { id: 134, name: "Shashank Singh",        role: "batsman",      country: "India",         battingRating: 580, bowlingRating: 100,  keepingRating: 0,   overallRating: 600, age: 31, salary: 80  },
  { id: 135, name: "Josh Inglis",           role: "wicketkeeper", country: "Australia",     battingRating: 580, bowlingRating: 0,   keepingRating: 800,  overallRating: 580, age: 28, salary: 85  },
  { id: 136, name: "Lockie Ferguson",       role: "bowler",       country: "New Zealand",   battingRating: 50,  bowlingRating: 800,  keepingRating: 0,   overallRating: 700, age: 32, salary: 70  },
  { id: 137, name: "Azmatullah Omarzai",    role: "allrounder",   country: "Afghanistan",   battingRating: 420, bowlingRating: 700,  keepingRating: 0,   overallRating: 620, age: 24, salary: 75  },
  { id: 138, name: "Xavier Bartlett",       role: "bowler",       country: "Australia",     battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 600, age: 27, salary: 60  },
  { id: 139, name: "Mitchell Marsh",        role: "allrounder",   country: "Australia",     battingRating: 550, bowlingRating: 700,  keepingRating: 0,   overallRating: 700, age: 33, salary: 120 },
  { id: 140, name: "Shamar Joseph",         role: "bowler",       country: "West Indies",   battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 620, age: 26, salary: 70  },
  { id: 141, name: "Abdul Samad",           role: "allrounder",   country: "India",         battingRating: 480, bowlingRating: 600,  keepingRating: 0,   overallRating: 620, age: 24, salary: 70  },
  { id: 142, name: "Shahrukh Khan",         role: "batsman",      country: "India",         battingRating: 620, bowlingRating: 100,  keepingRating: 0,   overallRating: 630, age: 30, salary: 80  },
  { id: 143, name: "Gerald Coetzee",        role: "bowler",       country: "South Africa",  battingRating: 100, bowlingRating: 700,  keepingRating: 0,   overallRating: 640, age: 25, salary: 90  },
  { id: 144, name: "Akash Madhwal",         role: "bowler",       country: "India",         battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 620, age: 32, salary: 65  },
  { id: 145, name: "Yash Dayal",            role: "bowler",       country: "India",         battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 600, age: 27, salary: 60  },
  { id: 146, name: "Ayush Badoni",          role: "batsman",      country: "India",         battingRating: 580, bowlingRating: 100,  keepingRating: 0,   overallRating: 620, age: 24, salary: 65  },
  { id: 147, name: "Rahul Tewatia",         role: "allrounder",   country: "India",         battingRating: 450, bowlingRating: 600,  keepingRating: 0,   overallRating: 630, age: 32, salary: 75  },

  // ── New National Team players ──────────────────────────────────────────────
  { id: 148, name: "Marnus Labuschagne",    role: "batsman",      country: "Australia",     battingRating: 640, bowlingRating: 400,  keepingRating: 0,   overallRating: 640, age: 30, salary: 105 },
  { id: 149, name: "Usman Khawaja",         role: "batsman",      country: "Australia",     battingRating: 650, bowlingRating: 100,  keepingRating: 0,   overallRating: 650, age: 37, salary: 110 },
  { id: 150, name: "Alex Carey",            role: "wicketkeeper", country: "Australia",     battingRating: 550, bowlingRating: 0,   keepingRating: 800,  overallRating: 550, age: 34, salary: 85  },
  { id: 151, name: "Sam Konstas",           role: "batsman",      country: "Australia",     battingRating: 550, bowlingRating: 100,  keepingRating: 0,   overallRating: 550, age: 20, salary: 70  },
  { id: 152, name: "Matt Renshaw",          role: "batsman",      country: "Australia",     battingRating: 550, bowlingRating: 100,  keepingRating: 0,   overallRating: 550, age: 28, salary: 75  },
  { id: 153, name: "Nathan Lyon",           role: "bowler",       country: "Australia",     battingRating: 120, bowlingRating: 800,  keepingRating: 0,   overallRating: 750, age: 37, salary: 105 },
  { id: 154, name: "Ben Duckett",           role: "batsman",      country: "England",       battingRating: 700, bowlingRating: 100,  keepingRating: 0,   overallRating: 700, age: 30, salary: 100 },
  { id: 155, name: "Zak Crawley",           role: "batsman",      country: "England",       battingRating: 580, bowlingRating: 100,  keepingRating: 0,   overallRating: 580, age: 27, salary: 90  },
  { id: 156, name: "Ollie Pope",            role: "wicketkeeper", country: "England",       battingRating: 630, bowlingRating: 0,   keepingRating: 800,  overallRating: 630, age: 27, salary: 95  },
  { id: 157, name: "Jamie Smith",           role: "wicketkeeper", country: "England",       battingRating: 620, bowlingRating: 0,   keepingRating: 800,  overallRating: 620, age: 24, salary: 85  },
  { id: 158, name: "Jacob Bethell",         role: "allrounder",   country: "England",       battingRating: 300, bowlingRating: 500,  keepingRating: 0,   overallRating: 460, age: 21, salary: 65  },
  { id: 159, name: "Chris Woakes",          role: "bowler",       country: "England",       battingRating: 280, bowlingRating: 700,  keepingRating: 0,   overallRating: 720, age: 36, salary: 100 },
  { id: 160, name: "Stuart Broad",          role: "bowler",       country: "England",       battingRating: 120, bowlingRating: 800,  keepingRating: 0,   overallRating: 780, age: 38, salary: 90  },
  { id: 161, name: "James Anderson",        role: "bowler",       country: "England",       battingRating: 50,  bowlingRating: 900,  keepingRating: 0,   overallRating: 820, age: 42, salary: 90  },
  { id: 162, name: "Imam-ul-Haq",           role: "batsman",      country: "Pakistan",      battingRating: 550, bowlingRating: 0,   keepingRating: 0,   overallRating: 550, age: 28, salary: 85  },
  { id: 163, name: "Saim Ayub",             role: "batsman",      country: "Pakistan",      battingRating: 650, bowlingRating: 100,  keepingRating: 0,   overallRating: 650, age: 23, salary: 90  },
  { id: 164, name: "Saud Shakeel",          role: "batsman",      country: "Pakistan",      battingRating: 680, bowlingRating: 100,  keepingRating: 0,   overallRating: 680, age: 29, salary: 95  },
  { id: 165, name: "Sahibzada Farhan",      role: "batsman",      country: "Pakistan",      battingRating: 750, bowlingRating: 100,  keepingRating: 0,   overallRating: 750, age: 26, salary: 100 },
  { id: 166, name: "Shan Masood",           role: "batsman",      country: "Pakistan",      battingRating: 600, bowlingRating: 100,  keepingRating: 0,   overallRating: 600, age: 35, salary: 80  },
  { id: 167, name: "Agha Salman",           role: "allrounder",   country: "Pakistan",      battingRating: 320, bowlingRating: 600,  keepingRating: 0,   overallRating: 550, age: 30, salary: 75  },
  { id: 168, name: "Abrar Ahmed",           role: "bowler",       country: "Pakistan",      battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 680, age: 26, salary: 85  },
  { id: 169, name: "Mohammad Hasnain",      role: "bowler",       country: "Pakistan",      battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 620, age: 25, salary: 80  },
  { id: 170, name: "Tom Latham",            role: "wicketkeeper", country: "New Zealand",   battingRating: 590, bowlingRating: 0,   keepingRating: 800,  overallRating: 590, age: 32, salary: 90  },
  { id: 171, name: "Glenn Phillips",        role: "wicketkeeper", country: "New Zealand",   battingRating: 620, bowlingRating: 500,  keepingRating: 800,  overallRating: 620, age: 27, salary: 95  },
  { id: 172, name: "Will Young",            role: "batsman",      country: "New Zealand",   battingRating: 580, bowlingRating: 100,  keepingRating: 0,   overallRating: 580, age: 31, salary: 80  },
  { id: 173, name: "Mark Chapman",          role: "batsman",      country: "New Zealand",   battingRating: 550, bowlingRating: 200,  keepingRating: 0,   overallRating: 550, age: 31, salary: 75  },
  { id: 174, name: "Tim Southee",           role: "bowler",       country: "New Zealand",   battingRating: 180, bowlingRating: 800,  keepingRating: 0,   overallRating: 750, age: 35, salary: 100 },
  { id: 175, name: "Matt Henry",            role: "bowler",       country: "New Zealand",   battingRating: 80,  bowlingRating: 800,  keepingRating: 0,   overallRating: 780, age: 33, salary: 105 },
  { id: 176, name: "Kyle Jamieson",         role: "bowler",       country: "New Zealand",   battingRating: 200, bowlingRating: 700,  keepingRating: 0,   overallRating: 670, age: 30, salary: 95  },
  { id: 177, name: "Temba Bavuma",          role: "batsman",      country: "South Africa",  battingRating: 780, bowlingRating: 100,  keepingRating: 0,   overallRating: 780, age: 34, salary: 120 },
  { id: 178, name: "Tony de Zorzi",         role: "batsman",      country: "South Africa",  battingRating: 620, bowlingRating: 100,  keepingRating: 0,   overallRating: 620, age: 28, salary: 85  },
  { id: 179, name: "Wiaan Mulder",          role: "allrounder",   country: "South Africa",  battingRating: 350, bowlingRating: 700,  keepingRating: 0,   overallRating: 550, age: 27, salary: 80  },
  { id: 180, name: "Tabraiz Shamsi",        role: "bowler",       country: "South Africa",  battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 650, age: 34, salary: 85  },
  { id: 181, name: "Keshav Maharaj",        role: "bowler",       country: "South Africa",  battingRating: 120, bowlingRating: 700,  keepingRating: 0,   overallRating: 680, age: 34, salary: 90  },
  { id: 182, name: "Lungi Ngidi",           role: "bowler",       country: "South Africa",  battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 700, age: 29, salary: 95  },
  { id: 183, name: "Charith Asalanka",      role: "batsman",      country: "Sri Lanka",     battingRating: 650, bowlingRating: 300,  keepingRating: 0,   overallRating: 650, age: 28, salary: 85  },
  { id: 184, name: "Dinesh Chandimal",      role: "wicketkeeper", country: "Sri Lanka",     battingRating: 550, bowlingRating: 0,   keepingRating: 800,  overallRating: 550, age: 35, salary: 75  },
  { id: 185, name: "Dhananjaya de Silva",   role: "allrounder",   country: "Sri Lanka",     battingRating: 450, bowlingRating: 700,  keepingRating: 0,   overallRating: 650, age: 33, salary: 85  },
  { id: 186, name: "Kamindu Mendis",        role: "allrounder",   country: "Sri Lanka",     battingRating: 480, bowlingRating: 600,  keepingRating: 0,   overallRating: 680, age: 25, salary: 90  },
  { id: 187, name: "Angelo Mathews",        role: "allrounder",   country: "Sri Lanka",     battingRating: 420, bowlingRating: 600,  keepingRating: 0,   overallRating: 600, age: 37, salary: 80  },
  { id: 188, name: "Dilshan Madushanka",    role: "bowler",       country: "Sri Lanka",     battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 650, age: 25, salary: 80  },
  { id: 189, name: "Dushmantha Chameera",   role: "bowler",       country: "Sri Lanka",     battingRating: 80,  bowlingRating: 700,  keepingRating: 0,   overallRating: 620, age: 34, salary: 75  },
  { id: 190, name: "Nuwan Thushara",        role: "bowler",       country: "Sri Lanka",     battingRating: 50,  bowlingRating: 600,  keepingRating: 0,   overallRating: 580, age: 28, salary: 70  },
  { id: 191, name: "Shai Hope",             role: "wicketkeeper", country: "West Indies",   battingRating: 650, bowlingRating: 0,   keepingRating: 800,  overallRating: 650, age: 30, salary: 90  },
  { id: 192, name: "Brandon King",          role: "batsman",      country: "West Indies",   battingRating: 600, bowlingRating: 100,  keepingRating: 0,   overallRating: 600, age: 27, salary: 80  },
  { id: 193, name: "Amir Jangoo",           role: "batsman",      country: "West Indies",   battingRating: 550, bowlingRating: 100,  keepingRating: 0,   overallRating: 550, age: 24, salary: 65  },
  { id: 194, name: "Johnson Charles",       role: "batsman",      country: "West Indies",   battingRating: 580, bowlingRating: 100,  keepingRating: 0,   overallRating: 580, age: 36, salary: 70  },
  { id: 195, name: "Sherfane Rutherford",   role: "allrounder",   country: "West Indies",   battingRating: 400, bowlingRating: 500,  keepingRating: 0,   overallRating: 550, age: 25, salary: 70  },
  { id: 196, name: "Rovman Powell",         role: "allrounder",   country: "West Indies",   battingRating: 420, bowlingRating: 500,  keepingRating: 0,   overallRating: 600, age: 30, salary: 80  },
  { id: 197, name: "Roston Chase",          role: "allrounder",   country: "West Indies",   battingRating: 400, bowlingRating: 600,  keepingRating: 0,   overallRating: 580, age: 31, salary: 75  },
  { id: 198, name: "Akeal Hosein",          role: "bowler",       country: "West Indies",   battingRating: 100, bowlingRating: 800,  keepingRating: 0,   overallRating: 820, age: 28, salary: 100 },
  { id: 199, name: "Gudakesh Motie",        role: "bowler",       country: "West Indies",   battingRating: 80,  bowlingRating: 700,  keepingRating: 0,   overallRating: 650, age: 27, salary: 80  },
  { id: 200, name: "Jayden Seales",         role: "bowler",       country: "West Indies",   battingRating: 50,  bowlingRating: 600,  keepingRating: 0,   overallRating: 600, age: 23, salary: 75  },
  { id: 201, name: "Najmul Hossain Shanto", role: "batsman",      country: "Bangladesh",    battingRating: 620, bowlingRating: 100,  keepingRating: 0,   overallRating: 620, age: 26, salary: 85  },
  { id: 202, name: "Litton Das",            role: "wicketkeeper", country: "Bangladesh",    battingRating: 580, bowlingRating: 0,   keepingRating: 800,  overallRating: 580, age: 29, salary: 80  },
  { id: 203, name: "Towhid Hridoy",         role: "batsman",      country: "Bangladesh",    battingRating: 600, bowlingRating: 100,  keepingRating: 0,   overallRating: 600, age: 24, salary: 75  },
  { id: 204, name: "Tanzid Hasan",          role: "batsman",      country: "Bangladesh",    battingRating: 550, bowlingRating: 100,  keepingRating: 0,   overallRating: 550, age: 23, salary: 65  },
  { id: 205, name: "Mahedi Hasan",          role: "allrounder",   country: "Bangladesh",    battingRating: 280, bowlingRating: 600,  keepingRating: 0,   overallRating: 520, age: 28, salary: 65  },
  { id: 206, name: "Mehidy Hasan Miraz",    role: "allrounder",   country: "Bangladesh",    battingRating: 380, bowlingRating: 700,  keepingRating: 0,   overallRating: 650, age: 27, salary: 85  },
  { id: 207, name: "Taskin Ahmed",          role: "bowler",       country: "Bangladesh",    battingRating: 50,  bowlingRating: 700,  keepingRating: 0,   overallRating: 680, age: 29, salary: 85  },
  { id: 208, name: "Shoriful Islam",        role: "bowler",       country: "Bangladesh",    battingRating: 50,  bowlingRating: 600,  keepingRating: 0,   overallRating: 580, age: 24, salary: 70  },
  { id: 209, name: "Hasan Mahmud",          role: "bowler",       country: "Bangladesh",    battingRating: 50,  bowlingRating: 600,  keepingRating: 0,   overallRating: 550, age: 25, salary: 65  },
  { id: 210, name: "Rahmanullah Gurbaz",    role: "wicketkeeper", country: "Afghanistan",   battingRating: 680, bowlingRating: 0,   keepingRating: 800,  overallRating: 680, age: 22, salary: 90  },
  { id: 211, name: "Gulbadin Naib",         role: "allrounder",   country: "Afghanistan",   battingRating: 350, bowlingRating: 600,  keepingRating: 0,   overallRating: 550, age: 33, salary: 70  },
  { id: 212, name: "Najibullah Zadran",     role: "batsman",      country: "Afghanistan",   battingRating: 580, bowlingRating: 100,  keepingRating: 0,   overallRating: 580, age: 29, salary: 75  },
  { id: 213, name: "Hashmatullah Shahidi",  role: "batsman",      country: "Afghanistan",   battingRating: 550, bowlingRating: 100,  keepingRating: 0,   overallRating: 550, age: 32, salary: 70  },
  { id: 214, name: "Fazalhaq Farooqi",      role: "bowler",       country: "Afghanistan",   battingRating: 50,  bowlingRating: 800,  keepingRating: 0,   overallRating: 720, age: 23, salary: 90  },
  { id: 215, name: "Naveen-ul-Haq",         role: "bowler",       country: "Afghanistan",   battingRating: 80,  bowlingRating: 700,  keepingRating: 0,   overallRating: 680, age: 26, salary: 85  },
  { id: 216, name: "Noor Ahmad",            role: "bowler",       country: "Afghanistan",   battingRating: 50,  bowlingRating: 800,  keepingRating: 0,   overallRating: 820, age: 20, salary: 95  },
];

// ── IPL 2026 Squad Map ────────────────────────────────────────────────────────
export const IPL_SQUAD_MAP: Record<string, number[]> = {
  mi:   [1, 13, 84, 6, 9, 45, 100, 101, 102, 103, 104],
  csk:  [7, 105, 106, 107, 108, 79, 81, 31, 46, 98, 95],
  rcb:  [2, 109, 35, 34, 25, 110, 111, 112, 80, 113, 145],
  kkr:  [76, 56, 82, 94, 49, 114, 115, 116, 60, 117, 93],
  dc:   [4, 15, 14, 85, 73, 118, 119, 120, 121, 52, 65],
  srh:  [21, 18, 122, 123, 124, 125, 12, 126, 53, 127, 20],
  rr:   [83, 128, 129, 130, 58, 29, 61, 131, 11, 144, 47],
  pbks: [132, 133, 134, 89, 22, 24, 135, 136, 137, 138, 54],
  lsg:  [5, 57, 51, 139, 91, 88, 141, 140, 87, 146, 59],
  gt:   [3, 97, 69, 10, 26, 50, 90, 142, 143, 147, 62],
};

export function getAllPlayers(): Player[] {
  return ALL_PLAYERS;
}

export function getRandomPool(count: number = 30): Player[] {
  const shuffled = [...ALL_PLAYERS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getPlayersByCountry(countryId: string): Player[] {
  return ALL_PLAYERS.filter(p => p.country.toLowerCase().replace(/\s+/g, "-") === countryId);
}

export function getPlayerById(id: number): Player | undefined {
  return ALL_PLAYERS.find(p => p.id === id);
}

export const COUNTRIES = [
  { id: "india",        name: "India",        flag: "🇮🇳" },
  { id: "australia",    name: "Australia",     flag: "🇦🇺" },
  { id: "england",      name: "England",       flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: "pakistan",     name: "Pakistan",      flag: "🇵🇰" },
  { id: "new-zealand",  name: "New Zealand",   flag: "🇳🇿" },
  { id: "south-africa", name: "South Africa",  flag: "🇿🇦" },
  { id: "west-indies",  name: "West Indies",   flag: "🏝️" },
  { id: "sri-lanka",    name: "Sri Lanka",     flag: "🇱🇰" },
  { id: "bangladesh",   name: "Bangladesh",    flag: "🇧🇩" },
  { id: "afghanistan",  name: "Afghanistan",   flag: "🇦🇫" },
];

export const IPL_TEAMS = [
  { id: "mi",   name: "Mumbai Indians",             shortName: "MI",   color: "#004BA0" },
  { id: "csk",  name: "Chennai Super Kings",         shortName: "CSK",  color: "#F9CD05" },
  { id: "rcb",  name: "Royal Challengers Bengaluru", shortName: "RCB",  color: "#EC1C24" },
  { id: "kkr",  name: "Kolkata Knight Riders",       shortName: "KKR",  color: "#3A225D" },
  { id: "dc",   name: "Delhi Capitals",              shortName: "DC",   color: "#0078BC" },
  { id: "srh",  name: "Sunrisers Hyderabad",         shortName: "SRH",  color: "#F26522" },
  { id: "rr",   name: "Rajasthan Royals",            shortName: "RR",   color: "#E5017C" },
  { id: "pbks", name: "Punjab Kings",                shortName: "PBKS", color: "#DD1F2D" },
  { id: "lsg",  name: "Lucknow Super Giants",        shortName: "LSG",  color: "#A4C639" },
  { id: "gt",   name: "Gujarat Titans",              shortName: "GT",   color: "#1C4B9B" },
];

export function buildCountryXI(countryId: string): Player[] {
  const players = getPlayersByCountry(countryId);
  if (players.length >= 11) {
    return players.sort((a, b) => b.overallRating - a.overallRating).slice(0, 11);
  }
  const extra = getAllPlayers()
    .filter(p => p.country.toLowerCase().replace(/\s+/g, "-") !== countryId)
    .sort(() => Math.random() - 0.5)
    .slice(0, 11 - players.length);
  return [...players, ...extra];
}

export function buildIPLSquad(teamId: string): Player[] {
  const ids = IPL_SQUAD_MAP[teamId] ?? [];
  if (ids.length > 0) {
    const squad = ids.map(id => ALL_PLAYERS.find(p => p.id === id)).filter(Boolean) as Player[];
    if (squad.length >= 11) return squad;
  }
  const shuffled = [...ALL_PLAYERS].sort(() => Math.random() - 0.5);
  const wk = shuffled.filter(p => p.role === "wicketkeeper").slice(0, 3);
  const batsmen = shuffled.filter(p => p.role === "batsman").slice(0, 6);
  const allrounders = shuffled.filter(p => p.role === "allrounder").slice(0, 5);
  const bowlers = shuffled.filter(p => p.role === "bowler").slice(0, 6);
  return [...wk, ...batsmen, ...allrounders, ...bowlers];
}

export function selectXIFromSquad(squad: Player[]): Player[] {
  const wk = squad.filter(p => p.role === "wicketkeeper").sort((a, b) => b.overallRating - a.overallRating).slice(0, 1);
  const batsmen = squad.filter(p => p.role === "batsman").sort((a, b) => b.overallRating - a.overallRating).slice(0, 4);
  const allrounders = squad.filter(p => p.role === "allrounder").sort((a, b) => b.overallRating - a.overallRating).slice(0, 3);
  const bowlers = squad.filter(p => p.role === "bowler").sort((a, b) => b.overallRating - a.overallRating).slice(0, 3);
  return [...wk, ...batsmen, ...allrounders, ...bowlers].slice(0, 11);
}
