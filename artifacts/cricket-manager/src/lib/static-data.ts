// Static data mirrored from api-server/src/lib/players.ts
// Allows the app to run without a backend API server.

export interface Player {
  id: number;
  name: string;
  role: "batsman" | "bowler" | "allrounder" | "wicketkeeper";
  country: string;
  battingRating: number;
  bowlingRating: number;
  keepingRating: number;
  overallRating: number;
  age: number;
  salary: number;
}

const ALL_PLAYERS: Player[] = [
  // India
  { id: 1,   name: "Rohit Sharma",          role: "batsman",      country: "India",         battingRating: 780, bowlingRating: 200,  keepingRating: 0,    overallRating: 780, age: 37, salary: 160 },
  { id: 2,   name: "Virat Kohli",           role: "batsman",      country: "India",         battingRating: 770, bowlingRating: 200,  keepingRating: 0,    overallRating: 770, age: 36, salary: 175 },
  { id: 3,   name: "Shubman Gill",          role: "batsman",      country: "India",         battingRating: 720, bowlingRating: 100,  keepingRating: 0,    overallRating: 720, age: 25, salary: 125 },
  { id: 4,   name: "KL Rahul",              role: "wicketkeeper", country: "India",         battingRating: 640, bowlingRating: 0,    keepingRating: 900,  overallRating: 640, age: 33, salary: 130 },
  { id: 5,   name: "Rishabh Pant",          role: "wicketkeeper", country: "India",         battingRating: 680, bowlingRating: 0,    keepingRating: 900,  overallRating: 680, age: 27, salary: 160 },
  { id: 6,   name: "Hardik Pandya",         role: "allrounder",   country: "India",         battingRating: 550, bowlingRating: 800,  keepingRating: 0,    overallRating: 750, age: 31, salary: 145 },
  { id: 7,   name: "Ravindra Jadeja",       role: "allrounder",   country: "India",         battingRating: 450, bowlingRating: 900,  keepingRating: 0,    overallRating: 780, age: 36, salary: 135 },
  { id: 8,   name: "R. Ashwin",             role: "allrounder",   country: "India",         battingRating: 350, bowlingRating: 900,  keepingRating: 0,    overallRating: 750, age: 38, salary: 120 },
  { id: 9,   name: "Jasprit Bumrah",        role: "bowler",       country: "India",         battingRating: 50,  bowlingRating: 1000, keepingRating: 0,    overallRating: 900, age: 31, salary: 170 },
  { id: 10,  name: "Mohammed Shami",        role: "bowler",       country: "India",         battingRating: 80,  bowlingRating: 900,  keepingRating: 0,    overallRating: 800, age: 34, salary: 115 },
  { id: 11,  name: "Yuzvendra Chahal",      role: "bowler",       country: "India",         battingRating: 50,  bowlingRating: 700,  keepingRating: 0,    overallRating: 700, age: 34, salary: 100 },
  { id: 12,  name: "Ishan Kishan",          role: "wicketkeeper", country: "India",         battingRating: 600, bowlingRating: 0,    keepingRating: 800,  overallRating: 620, age: 26, salary: 90  },
  { id: 13,  name: "Suryakumar Yadav",      role: "batsman",      country: "India",         battingRating: 820, bowlingRating: 100,  keepingRating: 0,    overallRating: 820, age: 34, salary: 155 },
  { id: 14,  name: "Kuldeep Yadav",         role: "bowler",       country: "India",         battingRating: 50,  bowlingRating: 800,  keepingRating: 0,    overallRating: 730, age: 30, salary: 95  },
  { id: 15,  name: "Axar Patel",            role: "allrounder",   country: "India",         battingRating: 350, bowlingRating: 800,  keepingRating: 0,    overallRating: 680, age: 31, salary: 90  },
  // Australia
  { id: 16,  name: "David Warner",          role: "batsman",      country: "Australia",     battingRating: 750, bowlingRating: 100,  keepingRating: 0,    overallRating: 750, age: 38, salary: 145 },
  { id: 17,  name: "Steve Smith",           role: "batsman",      country: "Australia",     battingRating: 820, bowlingRating: 300,  keepingRating: 0,    overallRating: 820, age: 35, salary: 160 },
  { id: 18,  name: "Pat Cummins",           role: "bowler",       country: "Australia",     battingRating: 300, bowlingRating: 900,  keepingRating: 0,    overallRating: 850, age: 32, salary: 155 },
  { id: 19,  name: "Mitchell Starc",        role: "bowler",       country: "Australia",     battingRating: 150, bowlingRating: 900,  keepingRating: 0,    overallRating: 850, age: 35, salary: 140 },
  { id: 20,  name: "Adam Zampa",            role: "bowler",       country: "Australia",     battingRating: 80,  bowlingRating: 800,  keepingRating: 0,    overallRating: 720, age: 32, salary: 95  },
  { id: 21,  name: "Travis Head",           role: "batsman",      country: "Australia",     battingRating: 780, bowlingRating: 200,  keepingRating: 0,    overallRating: 780, age: 31, salary: 120 },
  { id: 22,  name: "Glenn Maxwell",         role: "allrounder",   country: "Australia",     battingRating: 520, bowlingRating: 700,  keepingRating: 0,    overallRating: 740, age: 36, salary: 130 },
  { id: 23,  name: "Matthew Wade",          role: "wicketkeeper", country: "Australia",     battingRating: 400, bowlingRating: 0,    keepingRating: 800,  overallRating: 580, age: 37, salary: 80  },
  { id: 24,  name: "Marcus Stoinis",        role: "allrounder",   country: "Australia",     battingRating: 450, bowlingRating: 600,  keepingRating: 0,    overallRating: 650, age: 35, salary: 95  },
  { id: 25,  name: "Josh Hazlewood",        role: "bowler",       country: "Australia",     battingRating: 50,  bowlingRating: 900,  keepingRating: 0,    overallRating: 800, age: 34, salary: 125 },
  // England
  { id: 26,  name: "Jos Buttler",           role: "wicketkeeper", country: "England",       battingRating: 760, bowlingRating: 0,    keepingRating: 900,  overallRating: 760, age: 34, salary: 140 },
  { id: 27,  name: "Ben Stokes",            role: "allrounder",   country: "England",       battingRating: 580, bowlingRating: 800,  keepingRating: 0,    overallRating: 820, age: 33, salary: 155 },
  { id: 28,  name: "Joe Root",              role: "batsman",      country: "England",       battingRating: 900, bowlingRating: 500,  keepingRating: 0,    overallRating: 900, age: 34, salary: 150 },
  { id: 29,  name: "Jofra Archer",          role: "bowler",       country: "England",       battingRating: 120, bowlingRating: 800,  keepingRating: 0,    overallRating: 780, age: 30, salary: 130 },
  { id: 30,  name: "Adil Rashid",           role: "bowler",       country: "England",       battingRating: 100, bowlingRating: 700,  keepingRating: 0,    overallRating: 700, age: 37, salary: 95  },
  { id: 31,  name: "Sam Curran",            role: "allrounder",   country: "England",       battingRating: 350, bowlingRating: 800,  keepingRating: 0,    overallRating: 650, age: 27, salary: 105 },
  { id: 32,  name: "Jonny Bairstow",        role: "wicketkeeper", country: "England",       battingRating: 520, bowlingRating: 0,    keepingRating: 800,  overallRating: 680, age: 35, salary: 115 },
  { id: 33,  name: "Mark Wood",             role: "bowler",       country: "England",       battingRating: 100, bowlingRating: 800,  keepingRating: 0,    overallRating: 750, age: 34, salary: 110 },
  { id: 34,  name: "Liam Livingstone",      role: "allrounder",   country: "England",       battingRating: 480, bowlingRating: 700,  keepingRating: 0,    overallRating: 650, age: 31, salary: 105 },
  { id: 35,  name: "Phil Salt",             role: "batsman",      country: "England",       battingRating: 680, bowlingRating: 0,    keepingRating: 0,    overallRating: 650, age: 28, salary: 90  },
  { id: 801, name: "James Anderson",       role: "bowler",       country: "England",       battingRating: 80,  bowlingRating: 920,  keepingRating: 0,    overallRating: 870, age: 42, salary: 130 },
  // Pakistan
  { id: 36,  name: "Babar Azam",            role: "batsman",      country: "Pakistan",      battingRating: 720, bowlingRating: 100,  keepingRating: 0,    overallRating: 720, age: 30, salary: 160 },
  { id: 37,  name: "Shaheen Afridi",        role: "bowler",       country: "Pakistan",      battingRating: 120, bowlingRating: 900,  keepingRating: 0,    overallRating: 820, age: 24, salary: 130 },
  { id: 38,  name: "Mohammad Rizwan",       role: "wicketkeeper", country: "Pakistan",      battingRating: 620, bowlingRating: 0,    keepingRating: 900,  overallRating: 700, age: 32, salary: 135 },
  { id: 39,  name: "Shadab Khan",           role: "allrounder",   country: "Pakistan",      battingRating: 320, bowlingRating: 800,  keepingRating: 0,    overallRating: 620, age: 26, salary: 100 },
  { id: 40,  name: "Fakhar Zaman",          role: "batsman",      country: "Pakistan",      battingRating: 590, bowlingRating: 100,  keepingRating: 0,    overallRating: 590, age: 34, salary: 110 },
  { id: 41,  name: "Naseem Shah",           role: "bowler",       country: "Pakistan",      battingRating: 100, bowlingRating: 800,  keepingRating: 0,    overallRating: 750, age: 22, salary: 105 },
  { id: 42,  name: "Imad Wasim",            role: "allrounder",   country: "Pakistan",      battingRating: 280, bowlingRating: 700,  keepingRating: 0,    overallRating: 580, age: 35, salary: 80  },
  { id: 43,  name: "Haris Rauf",            role: "bowler",       country: "Pakistan",      battingRating: 100, bowlingRating: 700,  keepingRating: 0,    overallRating: 700, age: 31, salary: 100 },
  // New Zealand
  { id: 44,  name: "Kane Williamson",       role: "batsman",      country: "New Zealand",   battingRating: 660, bowlingRating: 400,  keepingRating: 0,    overallRating: 660, age: 34, salary: 145 },
  { id: 45,  name: "Trent Boult",           role: "bowler",       country: "New Zealand",   battingRating: 80,  bowlingRating: 800,  keepingRating: 0,    overallRating: 780, age: 35, salary: 120 },
  { id: 46,  name: "Devon Conway",          role: "wicketkeeper", country: "New Zealand",   battingRating: 680, bowlingRating: 0,    keepingRating: 800,  overallRating: 680, age: 33, salary: 110 },
  { id: 47,  name: "Daryl Mitchell",        role: "allrounder",   country: "New Zealand",   battingRating: 580, bowlingRating: 700,  keepingRating: 0,    overallRating: 770, age: 33, salary: 100 },
  { id: 48,  name: "Ish Sodhi",             role: "bowler",       country: "New Zealand",   battingRating: 80,  bowlingRating: 600,  keepingRating: 0,    overallRating: 580, age: 32, salary: 90  },
  // South Africa
  { id: 49,  name: "Quinton de Kock",       role: "wicketkeeper", country: "South Africa",  battingRating: 720, bowlingRating: 0,    keepingRating: 900,  overallRating: 720, age: 32, salary: 135 },
  { id: 50,  name: "Kagiso Rabada",         role: "bowler",       country: "South Africa",  battingRating: 120, bowlingRating: 900,  keepingRating: 0,    overallRating: 820, age: 30, salary: 145 },
  { id: 51,  name: "David Miller",          role: "batsman",      country: "South Africa",  battingRating: 640, bowlingRating: 100,  keepingRating: 0,    overallRating: 640, age: 35, salary: 115 },
  { id: 52,  name: "Anrich Nortje",         role: "bowler",       country: "South Africa",  battingRating: 80,  bowlingRating: 800,  keepingRating: 0,    overallRating: 750, age: 31, salary: 115 },
  { id: 53,  name: "Aiden Markram",         role: "batsman",      country: "South Africa",  battingRating: 590, bowlingRating: 500,  keepingRating: 0,    overallRating: 590, age: 30, salary: 110 },
  { id: 54,  name: "Marco Jansen",          role: "allrounder",   country: "South Africa",  battingRating: 420, bowlingRating: 800,  keepingRating: 0,    overallRating: 680, age: 24, salary: 100 },
  // West Indies
  { id: 55,  name: "Kieron Pollard",        role: "allrounder",   country: "West Indies",   battingRating: 450, bowlingRating: 700,  keepingRating: 0,    overallRating: 680, age: 37, salary: 120 },
  { id: 56,  name: "Andre Russell",         role: "allrounder",   country: "West Indies",   battingRating: 580, bowlingRating: 800,  keepingRating: 0,    overallRating: 780, age: 36, salary: 140 },
  { id: 57,  name: "Nicholas Pooran",       role: "wicketkeeper", country: "West Indies",   battingRating: 680, bowlingRating: 0,    keepingRating: 800,  overallRating: 680, age: 29, salary: 120 },
  { id: 58,  name: "Shimron Hetmyer",       role: "batsman",      country: "West Indies",   battingRating: 620, bowlingRating: 100,  keepingRating: 0,    overallRating: 620, age: 28, salary: 105 },
  { id: 59,  name: "Jason Holder",          role: "allrounder",   country: "West Indies",   battingRating: 320, bowlingRating: 800,  keepingRating: 0,    overallRating: 650, age: 33, salary: 110 },
  { id: 60,  name: "Alzarri Joseph",        role: "bowler",       country: "West Indies",   battingRating: 80,  bowlingRating: 700,  keepingRating: 0,    overallRating: 700, age: 28, salary: 100 },
  // Sri Lanka
  { id: 61,  name: "Wanindu Hasaranga",     role: "allrounder",   country: "Sri Lanka",     battingRating: 350, bowlingRating: 900,  keepingRating: 0,    overallRating: 750, age: 27, salary: 120 },
  { id: 62,  name: "Dasun Shanaka",         role: "allrounder",   country: "Sri Lanka",     battingRating: 350, bowlingRating: 600,  keepingRating: 0,    overallRating: 580, age: 32, salary: 90  },
  { id: 63,  name: "Pathum Nissanka",       role: "batsman",      country: "Sri Lanka",     battingRating: 780, bowlingRating: 100,  keepingRating: 0,    overallRating: 780, age: 26, salary: 90  },
  { id: 64,  name: "Kusal Mendis",          role: "wicketkeeper", country: "Sri Lanka",     battingRating: 620, bowlingRating: 0,    keepingRating: 800,  overallRating: 620, age: 29, salary: 90  },
  // Bangladesh
  { id: 65,  name: "Shakib Al Hasan",       role: "allrounder",   country: "Bangladesh",    battingRating: 480, bowlingRating: 800,  keepingRating: 0,    overallRating: 720, age: 37, salary: 115 },
  { id: 66,  name: "Mushfiqur Rahim",       role: "wicketkeeper", country: "Bangladesh",    battingRating: 550, bowlingRating: 0,    keepingRating: 800,  overallRating: 550, age: 37, salary: 90  },
  { id: 67,  name: "Tamim Iqbal",           role: "batsman",      country: "Bangladesh",    battingRating: 600, bowlingRating: 100,  keepingRating: 0,    overallRating: 600, age: 35, salary: 95  },
  { id: 68,  name: "Mustafizur Rahman",     role: "bowler",       country: "Bangladesh",    battingRating: 50,  bowlingRating: 700,  keepingRating: 0,    overallRating: 700, age: 29, salary: 95  },
  // Afghanistan
  { id: 69,  name: "Rashid Khan",           role: "bowler",       country: "Afghanistan",   battingRating: 200, bowlingRating: 900,  keepingRating: 0,    overallRating: 880, age: 26, salary: 140 },
  { id: 70,  name: "Mohammad Nabi",         role: "allrounder",   country: "Afghanistan",   battingRating: 380, bowlingRating: 700,  keepingRating: 0,    overallRating: 650, age: 40, salary: 90  },
  { id: 71,  name: "Mujeeb Ur Rahman",      role: "bowler",       country: "Afghanistan",   battingRating: 50,  bowlingRating: 800,  keepingRating: 0,    overallRating: 700, age: 23, salary: 95  },
  { id: 72,  name: "Ibrahim Zadran",        role: "batsman",      country: "Afghanistan",   battingRating: 650, bowlingRating: 100,  keepingRating: 0,    overallRating: 650, age: 22, salary: 80  },
  { id: 73,  name: "Faf du Plessis",        role: "batsman",      country: "South Africa",  battingRating: 620, bowlingRating: 100,  keepingRating: 0,    overallRating: 700, age: 40, salary: 130 },
  { id: 74,  name: "AB de Villiers",        role: "batsman",      country: "South Africa",  battingRating: 780, bowlingRating: 100,  keepingRating: 800,  overallRating: 820, age: 41, salary: 170 },
  { id: 75,  name: "Chris Gayle",           role: "batsman",      country: "West Indies",   battingRating: 620, bowlingRating: 400,  keepingRating: 0,    overallRating: 700, age: 45, salary: 135 },
  { id: 76,  name: "Sunil Narine",          role: "allrounder",   country: "West Indies",   battingRating: 520, bowlingRating: 900,  keepingRating: 0,    overallRating: 780, age: 36, salary: 130 },
  { id: 83,  name: "Yashasvi Jaiswal",      role: "batsman",      country: "India",         battingRating: 750, bowlingRating: 100,  keepingRating: 0,    overallRating: 750, age: 24, salary: 110 },
  { id: 84,  name: "Tilak Varma",           role: "batsman",      country: "India",         battingRating: 770, bowlingRating: 100,  keepingRating: 0,    overallRating: 770, age: 22, salary: 90  },
  { id: 89,  name: "Arshdeep Singh",        role: "bowler",       country: "India",         battingRating: 50,  bowlingRating: 800,  keepingRating: 0,    overallRating: 680, age: 26, salary: 95  },
  { id: 97,  name: "Sai Sudharsan",         role: "batsman",      country: "India",         battingRating: 680, bowlingRating: 100,  keepingRating: 0,    overallRating: 680, age: 23, salary: 85  },
  { id: 98,  name: "Rachin Ravindra",       role: "allrounder",   country: "New Zealand",   battingRating: 480, bowlingRating: 700,  keepingRating: 0,    overallRating: 650, age: 25, salary: 100 },
  { id: 99,  name: "Finn Allen",            role: "batsman",      country: "New Zealand",   battingRating: 540, bowlingRating: 100,  keepingRating: 0,    overallRating: 540, age: 25, salary: 90  },
  { id: 104, name: "Mitchell Santner",      role: "allrounder",   country: "New Zealand",   battingRating: 280, bowlingRating: 700,  keepingRating: 0,    overallRating: 600, age: 33, salary: 85  },
  { id: 105, name: "MS Dhoni",              role: "wicketkeeper", country: "India",         battingRating: 620, bowlingRating: 0,    keepingRating: 1000, overallRating: 780, age: 43, salary: 80  },
  { id: 106, name: "Ruturaj Gaikwad",       role: "batsman",      country: "India",         battingRating: 700, bowlingRating: 100,  keepingRating: 0,    overallRating: 700, age: 28, salary: 175 },
  { id: 119, name: "Harry Brook",           role: "batsman",      country: "England",       battingRating: 770, bowlingRating: 300,  keepingRating: 0,    overallRating: 770, age: 26, salary: 115 },
  { id: 122, name: "Abhishek Sharma",       role: "allrounder",   country: "India",         battingRating: 680, bowlingRating: 700,  keepingRating: 0,    overallRating: 910, age: 25, salary: 140 },
  { id: 125, name: "Heinrich Klaasen",      role: "wicketkeeper", country: "South Africa",  battingRating: 700, bowlingRating: 0,    keepingRating: 800,  overallRating: 700, age: 33, salary: 130 },
  { id: 128, name: "Sanju Samson",          role: "wicketkeeper", country: "India",         battingRating: 640, bowlingRating: 0,    keepingRating: 900,  overallRating: 640, age: 30, salary: 160 },
  { id: 132, name: "Shreyas Iyer",          role: "batsman",      country: "India",         battingRating: 660, bowlingRating: 100,  keepingRating: 0,    overallRating: 660, age: 30, salary: 165 },
  { id: 139, name: "Mitchell Marsh",        role: "allrounder",   country: "Australia",     battingRating: 550, bowlingRating: 700,  keepingRating: 0,    overallRating: 700, age: 33, salary: 120 },
  { id: 153, name: "Nathan Lyon",           role: "bowler",       country: "Australia",     battingRating: 120, bowlingRating: 800,  keepingRating: 0,    overallRating: 750, age: 37, salary: 105 },
  { id: 174, name: "Tim Southee",           role: "bowler",       country: "New Zealand",   battingRating: 180, bowlingRating: 800,  keepingRating: 0,    overallRating: 750, age: 35, salary: 100 },
  { id: 175, name: "Matt Henry",            role: "bowler",       country: "New Zealand",   battingRating: 80,  bowlingRating: 800,  keepingRating: 0,    overallRating: 780, age: 33, salary: 105 },
  { id: 177, name: "Temba Bavuma",          role: "batsman",      country: "South Africa",  battingRating: 780, bowlingRating: 100,  keepingRating: 0,    overallRating: 780, age: 34, salary: 120 },
  { id: 191, name: "Shai Hope",             role: "wicketkeeper", country: "West Indies",   battingRating: 650, bowlingRating: 0,    keepingRating: 800,  overallRating: 650, age: 30, salary: 90  },
  { id: 201, name: "Najmul Hossain Shanto", role: "batsman",      country: "Bangladesh",    battingRating: 620, bowlingRating: 100,  keepingRating: 0,    overallRating: 620, age: 26, salary: 85  },
  { id: 206, name: "Mehidy Hasan Miraz",    role: "allrounder",   country: "Bangladesh",    battingRating: 380, bowlingRating: 700,  keepingRating: 0,    overallRating: 650, age: 27, salary: 85  },
  { id: 207, name: "Taskin Ahmed",          role: "bowler",       country: "Bangladesh",    battingRating: 50,  bowlingRating: 700,  keepingRating: 0,    overallRating: 680, age: 29, salary: 85  },
  { id: 210, name: "Rahmanullah Gurbaz",    role: "wicketkeeper", country: "Afghanistan",   battingRating: 680, bowlingRating: 0,    keepingRating: 800,  overallRating: 680, age: 22, salary: 90  },
  { id: 214, name: "Fazalhaq Farooqi",      role: "bowler",       country: "Afghanistan",   battingRating: 50,  bowlingRating: 800,  keepingRating: 0,    overallRating: 720, age: 23, salary: 90  },
  { id: 216, name: "Noor Ahmad",            role: "bowler",       country: "Afghanistan",   battingRating: 50,  bowlingRating: 800,  keepingRating: 0,    overallRating: 820, age: 20, salary: 95  },
  // India — Additional Current
  { id: 312, name: "Suresh Raina",          role: "allrounder",   country: "India",         battingRating: 720, bowlingRating: 600,  keepingRating: 0,    overallRating: 750, age: 38, salary: 95  },
  { id: 313, name: "Dinesh Karthik",        role: "wicketkeeper", country: "India",         battingRating: 620, bowlingRating: 0,    keepingRating: 850,  overallRating: 630, age: 39, salary: 80  },
  { id: 314, name: "Shikhar Dhawan",        role: "batsman",      country: "India",         battingRating: 700, bowlingRating: 100,  keepingRating: 0,    overallRating: 700, age: 39, salary: 85  },
  { id: 315, name: "Deepak Chahar",         role: "allrounder",   country: "India",         battingRating: 350, bowlingRating: 720,  keepingRating: 0,    overallRating: 640, age: 32, salary: 85  },
  { id: 316, name: "Washington Sundar",     role: "allrounder",   country: "India",         battingRating: 400, bowlingRating: 680,  keepingRating: 0,    overallRating: 630, age: 25, salary: 80  },
  { id: 317, name: "Shardul Thakur",        role: "allrounder",   country: "India",         battingRating: 450, bowlingRating: 700,  keepingRating: 0,    overallRating: 640, age: 33, salary: 80  },
  { id: 318, name: "Shivam Dube",           role: "allrounder",   country: "India",         battingRating: 560, bowlingRating: 620,  keepingRating: 0,    overallRating: 640, age: 32, salary: 80  },
  { id: 319, name: "Varun Chakravarthy",    role: "bowler",       country: "India",         battingRating: 50,  bowlingRating: 700,  keepingRating: 0,    overallRating: 650, age: 34, salary: 80  },
  { id: 320, name: "Rinku Singh",           role: "batsman",      country: "India",         battingRating: 650, bowlingRating: 100,  keepingRating: 0,    overallRating: 640, age: 27, salary: 75  },
  // Australia — Additional Current
  { id: 330, name: "Usman Khawaja",         role: "batsman",      country: "Australia",     battingRating: 730, bowlingRating: 100,  keepingRating: 0,    overallRating: 720, age: 38, salary: 100 },
  { id: 331, name: "Cameron Green",         role: "allrounder",   country: "Australia",     battingRating: 600, bowlingRating: 700,  keepingRating: 0,    overallRating: 680, age: 26, salary: 90  },
  { id: 332, name: "Josh Inglis",           role: "wicketkeeper", country: "Australia",     battingRating: 690, bowlingRating: 0,    keepingRating: 760,  overallRating: 700, age: 31, salary: 95  },
  // England — Additional Current
  { id: 340, name: "Chris Woakes",          role: "allrounder",   country: "England",       battingRating: 500, bowlingRating: 750,  keepingRating: 0,    overallRating: 720, age: 36, salary: 100 },
  { id: 341, name: "Moeen Ali",             role: "allrounder",   country: "England",       battingRating: 520, bowlingRating: 720,  keepingRating: 0,    overallRating: 720, age: 37, salary: 100 },
  { id: 342, name: "Zak Crawley",           role: "batsman",      country: "England",       battingRating: 680, bowlingRating: 50,   keepingRating: 0,    overallRating: 680, age: 27, salary: 90  },
  { id: 343, name: "Ollie Pope",            role: "batsman",      country: "England",       battingRating: 700, bowlingRating: 100,  keepingRating: 0,    overallRating: 700, age: 27, salary: 90  },
  // Pakistan — Additional Current
  { id: 353, name: "Saud Shakeel",          role: "batsman",      country: "Pakistan",      battingRating: 680, bowlingRating: 100,  keepingRating: 0,    overallRating: 680, age: 30, salary: 90  },
  { id: 354, name: "Mohammad Nawaz",        role: "allrounder",   country: "Pakistan",      battingRating: 450, bowlingRating: 680,  keepingRating: 0,    overallRating: 620, age: 30, salary: 80  },
  // New Zealand — Additional Current
  { id: 360, name: "Glenn Phillips",        role: "allrounder",   country: "New Zealand",   battingRating: 660, bowlingRating: 700,  keepingRating: 0,    overallRating: 700, age: 27, salary: 90  },
  { id: 361, name: "Lockie Ferguson",       role: "bowler",       country: "New Zealand",   battingRating: 80,  bowlingRating: 800,  keepingRating: 0,    overallRating: 760, age: 34, salary: 90  },
  // South Africa — Additional Current
  { id: 368, name: "Tabraiz Shamsi",        role: "bowler",       country: "South Africa",  battingRating: 80,  bowlingRating: 740,  keepingRating: 0,    overallRating: 720, age: 34, salary: 90  },
  { id: 369, name: "Keshav Maharaj",        role: "allrounder",   country: "South Africa",  battingRating: 300, bowlingRating: 720,  keepingRating: 0,    overallRating: 700, age: 34, salary: 90  },
  { id: 370, name: "Rassie van der Dussen", role: "batsman",      country: "South Africa",  battingRating: 720, bowlingRating: 200,  keepingRating: 0,    overallRating: 720, age: 36, salary: 100 },
  { id: 371, name: "Tristan Stubbs",        role: "batsman",      country: "South Africa",  battingRating: 650, bowlingRating: 100,  keepingRating: 0,    overallRating: 650, age: 25, salary: 80  },
  // West Indies — Additional Current
  { id: 380, name: "Rovman Powell",         role: "batsman",      country: "West Indies",   battingRating: 680, bowlingRating: 200,  keepingRating: 0,    overallRating: 680, age: 31, salary: 90  },
  { id: 381, name: "Romario Shepherd",      role: "allrounder",   country: "West Indies",   battingRating: 520, bowlingRating: 680,  keepingRating: 0,    overallRating: 640, age: 29, salary: 80  },
  // Sri Lanka — Additional Current
  { id: 386, name: "Charith Asalanka",      role: "batsman",      country: "Sri Lanka",     battingRating: 680, bowlingRating: 200,  keepingRating: 0,    overallRating: 680, age: 28, salary: 85  },
  { id: 387, name: "Dhananjaya de Silva",   role: "allrounder",   country: "Sri Lanka",     battingRating: 680, bowlingRating: 680,  keepingRating: 0,    overallRating: 700, age: 33, salary: 90  },
  { id: 388, name: "Lahiru Kumara",         role: "bowler",       country: "Sri Lanka",     battingRating: 50,  bowlingRating: 700,  keepingRating: 0,    overallRating: 660, age: 30, salary: 80  },
  // Bangladesh — Additional
  { id: 390, name: "Mahmudullah",           role: "allrounder",   country: "Bangladesh",    battingRating: 560, bowlingRating: 620,  keepingRating: 0,    overallRating: 680, age: 39, salary: 80  },
  { id: 391, name: "Liton Das",             role: "wicketkeeper", country: "Bangladesh",    battingRating: 620, bowlingRating: 0,    keepingRating: 800,  overallRating: 620, age: 30, salary: 80  },
  // Afghanistan — Additional
  { id: 392, name: "Azmatullah Omarzai",    role: "allrounder",   country: "Afghanistan",   battingRating: 600, bowlingRating: 680,  keepingRating: 0,    overallRating: 650, age: 24, salary: 80  },
  { id: 393, name: "Naveen-ul-Haq",         role: "bowler",       country: "Afghanistan",   battingRating: 150, bowlingRating: 740,  keepingRating: 0,    overallRating: 680, age: 26, salary: 80  },
  // Zimbabwe
  { id: 399, name: "Sikandar Raza",         role: "allrounder",   country: "Zimbabwe",      battingRating: 680, bowlingRating: 700,  keepingRating: 0,    overallRating: 720, age: 38, salary: 85  },
  // Ireland
  { id: 402, name: "Andy Balbirnie",        role: "batsman",      country: "Ireland",       battingRating: 650, bowlingRating: 100,  keepingRating: 0,    overallRating: 640, age: 34, salary: 80  },
  { id: 403, name: "Paul Stirling",         role: "batsman",      country: "Ireland",       battingRating: 680, bowlingRating: 400,  keepingRating: 0,    overallRating: 660, age: 34, salary: 80  },
  { id: 404, name: "Lorcan Tucker",         role: "wicketkeeper", country: "Ireland",       battingRating: 600, bowlingRating: 0,    keepingRating: 800,  overallRating: 600, age: 28, salary: 75  },
  { id: 405, name: "Mark Adair",            role: "allrounder",   country: "Ireland",       battingRating: 540, bowlingRating: 680,  keepingRating: 0,    overallRating: 620, age: 29, salary: 75  },
  // Netherlands
  { id: 407, name: "Bas de Leede",          role: "allrounder",   country: "Netherlands",   battingRating: 620, bowlingRating: 680,  keepingRating: 0,    overallRating: 640, age: 26, salary: 75  },
  { id: 408, name: "Scott Edwards",         role: "wicketkeeper", country: "Netherlands",   battingRating: 620, bowlingRating: 0,    keepingRating: 800,  overallRating: 620, age: 28, salary: 75  },
  { id: 409, name: "Logan van Beek",        role: "allrounder",   country: "Netherlands",   battingRating: 380, bowlingRating: 660,  keepingRating: 0,    overallRating: 580, age: 36, salary: 70  },
  { id: 410, name: "Roelof van der Merwe",  role: "allrounder",   country: "Netherlands",   battingRating: 500, bowlingRating: 700,  keepingRating: 0,    overallRating: 640, age: 41, salary: 75  },
  { id: 411, name: "Max O'Dowd",            role: "batsman",      country: "Netherlands",   battingRating: 600, bowlingRating: 100,  keepingRating: 0,    overallRating: 580, age: 31, salary: 70  },
  { id: 739, name: "Vikramjit Singh",       role: "batsman",      country: "Netherlands",   battingRating: 620, bowlingRating: 80,   keepingRating: 0,    overallRating: 620, age: 23, salary: 70  },
  { id: 740, name: "CN Ackermann",         role: "allrounder",   country: "Netherlands",   battingRating: 650, bowlingRating: 580,  keepingRating: 0,    overallRating: 640, age: 34, salary: 75  },
  { id: 741, name: "AT Nidamanuru",        role: "batsman",      country: "Netherlands",   battingRating: 600, bowlingRating: 80,   keepingRating: 0,    overallRating: 590, age: 30, salary: 65  },
  { id: 742, name: "Shariz Ahmad",         role: "bowler",       country: "Netherlands",   battingRating: 200, bowlingRating: 610,  keepingRating: 0,    overallRating: 600, age: 27, salary: 65  },
  { id: 743, name: "K Klein",              role: "batsman",      country: "Netherlands",   battingRating: 560, bowlingRating: 100,  keepingRating: 0,    overallRating: 550, age: 26, salary: 60  },
  { id: 744, name: "NRJ Croes",            role: "allrounder",   country: "Netherlands",   battingRating: 490, bowlingRating: 520,  keepingRating: 0,    overallRating: 550, age: 29, salary: 60  },
  { id: 745, name: "SA Engelbrecht",       role: "bowler",       country: "Netherlands",   battingRating: 200, bowlingRating: 560,  keepingRating: 0,    overallRating: 550, age: 28, salary: 60  },
  { id: 746, name: "M Levitt",             role: "batsman",      country: "Netherlands",   battingRating: 540, bowlingRating: 100,  keepingRating: 0,    overallRating: 550, age: 25, salary: 60  },
  { id: 747, name: "TJG Pringle",          role: "bowler",       country: "Netherlands",   battingRating: 220, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 27, salary: 60  },
  { id: 748, name: "BE Fletcher",          role: "bowler",       country: "Netherlands",   battingRating: 180, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 30, salary: 60  },
  { id: 749, name: "ZB Lion-Cachet",       role: "bowler",       country: "Netherlands",   battingRating: 200, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 26, salary: 60  },
  { id: 750, name: "DT Doram",             role: "allrounder",   country: "Netherlands",   battingRating: 480, bowlingRating: 500,  keepingRating: 0,    overallRating: 550, age: 28, salary: 60  },
  { id: 751, name: "R Klein",              role: "bowler",       country: "Netherlands",   battingRating: 200, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 27, salary: 60  },
  { id: 752, name: "A Dutt",               role: "bowler",       country: "Netherlands",   battingRating: 180, bowlingRating: 540,  keepingRating: 0,    overallRating: 550, age: 25, salary: 60  },
  { id: 753, name: "JL de Mey",            role: "batsman",      country: "Netherlands",   battingRating: 540, bowlingRating: 100,  keepingRating: 0,    overallRating: 550, age: 29, salary: 60  },
  { id: 754, name: "Prashant Veer",        role: "bowler",       country: "India",         battingRating: 120, bowlingRating: 650,  keepingRating: 0,    overallRating: 610, age: 26, salary: 75  },
  { id: 755, name: "Kartikeya Sharma",     role: "bowler",       country: "India",         battingRating: 100, bowlingRating: 680,  keepingRating: 0,    overallRating: 640, age: 25, salary: 80  },
  { id: 756, name: "Sherfane Rutherford",  role: "allrounder",   country: "West Indies",   battingRating: 680, bowlingRating: 550,  keepingRating: 0,    overallRating: 680, age: 29, salary: 90  },
  // IPL players not yet in database
  { id: 412, name: "Mohammed Siraj",        role: "bowler",       country: "India",         battingRating: 80,  bowlingRating: 780,  keepingRating: 0,    overallRating: 720, age: 31, salary: 100 },
  { id: 413, name: "Rajat Patidar",         role: "batsman",      country: "India",         battingRating: 670, bowlingRating: 100,  keepingRating: 0,    overallRating: 660, age: 31, salary: 90  },
  { id: 414, name: "Jitesh Sharma",         role: "wicketkeeper", country: "India",         battingRating: 580, bowlingRating: 0,    keepingRating: 800,  overallRating: 600, age: 30, salary: 80  },
  { id: 415, name: "Nitish Rana",           role: "batsman",      country: "India",         battingRating: 610, bowlingRating: 300,  keepingRating: 0,    overallRating: 600, age: 31, salary: 80  },
  { id: 416, name: "Riyan Parag",           role: "allrounder",   country: "India",         battingRating: 620, bowlingRating: 580,  keepingRating: 0,    overallRating: 630, age: 23, salary: 80  },
  { id: 417, name: "Dhruv Jurel",           role: "wicketkeeper", country: "India",         battingRating: 570, bowlingRating: 0,    keepingRating: 800,  overallRating: 580, age: 24, salary: 75  },
  { id: 418, name: "Nitish Kumar Reddy",    role: "allrounder",   country: "India",         battingRating: 610, bowlingRating: 630,  keepingRating: 0,    overallRating: 640, age: 21, salary: 80  },
  { id: 419, name: "T Natarajan",           role: "bowler",       country: "India",         battingRating: 80,  bowlingRating: 660,  keepingRating: 0,    overallRating: 620, age: 33, salary: 80  },
  { id: 420, name: "Matheesha Pathirana",   role: "bowler",       country: "Sri Lanka",     battingRating: 80,  bowlingRating: 740,  keepingRating: 0,    overallRating: 700, age: 24, salary: 90  },
  { id: 421, name: "Jake Fraser-McGurk",    role: "batsman",      country: "Australia",     battingRating: 660, bowlingRating: 100,  keepingRating: 0,    overallRating: 660, age: 23, salary: 85  },
  { id: 422, name: "Will Jacks",            role: "allrounder",   country: "England",       battingRating: 640, bowlingRating: 680,  keepingRating: 0,    overallRating: 680, age: 26, salary: 90  },
  { id: 423, name: "Ryan Rickelton",        role: "wicketkeeper", country: "South Africa",  battingRating: 620, bowlingRating: 0,    keepingRating: 800,  overallRating: 630, age: 26, salary: 80  },
  { id: 424, name: "Tushar Deshpande",      role: "bowler",       country: "India",         battingRating: 80,  bowlingRating: 640,  keepingRating: 0,    overallRating: 600, age: 30, salary: 75  },
  { id: 425, name: "Wriddhiman Saha",       role: "wicketkeeper", country: "India",         battingRating: 520, bowlingRating: 0,    keepingRating: 850,  overallRating: 580, age: 40, salary: 70  },
  { id: 426, name: "Ravi Bishnoi",          role: "bowler",       country: "India",         battingRating: 100, bowlingRating: 700,  keepingRating: 0,    overallRating: 660, age: 24, salary: 80  },
  { id: 427, name: "Shahbaz Ahmed",         role: "allrounder",   country: "India",         battingRating: 480, bowlingRating: 650,  keepingRating: 0,    overallRating: 580, age: 30, salary: 75  },
  { id: 428, name: "Naman Dhir",            role: "allrounder",   country: "India",         battingRating: 540, bowlingRating: 560,  keepingRating: 0,    overallRating: 560, age: 24, salary: 70  },
  // Vaibhav Suryavanshi — regular + TOTW (90 rated)
  { id: 429, name: "Vaibhav Suryavanshi",  role: "batsman",      country: "India",         battingRating: 550, bowlingRating: 50,   keepingRating: 0,    overallRating: 550, age: 14, salary: 70  },
  { id: 430, name: "Vaibhav Suryavanshi",  role: "batsman",      country: "India",         battingRating: 900, bowlingRating: 50,   keepingRating: 0,    overallRating: 900, age: 14, salary: 70  },
  // TOTW cards — KL Rahul (92), Sanju Samson (91), Sai Sudharsan (89)
  { id: 757, name: "KL Rahul",             role: "wicketkeeper", country: "India",         battingRating: 920, bowlingRating: 0,    keepingRating: 950,  overallRating: 920, age: 33, salary: 70  },
  { id: 758, name: "Sanju Samson",         role: "wicketkeeper", country: "India",         battingRating: 910, bowlingRating: 0,    keepingRating: 950,  overallRating: 910, age: 30, salary: 70  },
  { id: 759, name: "Sai Sudharsan",        role: "batsman",      country: "India",         battingRating: 890, bowlingRating: 100,  keepingRating: 0,    overallRating: 890, age: 23, salary: 70  },
  // Australia — extended squad
  { id: 431, name: "Dan Christian",        role: "allrounder",   country: "Australia",     battingRating: 400, bowlingRating: 500,  keepingRating: 0,    overallRating: 550, age: 41, salary: 70  },
  { id: 432, name: "Peter Forrest",        role: "batsman",      country: "Australia",     battingRating: 550, bowlingRating: 100,  keepingRating: 0,    overallRating: 550, age: 38, salary: 70  },
  { id: 433, name: "George Bailey",        role: "batsman",      country: "Australia",     battingRating: 550, bowlingRating: 100,  keepingRating: 0,    overallRating: 550, age: 42, salary: 70  },
  { id: 434, name: "Aaron Finch",          role: "batsman",      country: "Australia",     battingRating: 550, bowlingRating: 100,  keepingRating: 0,    overallRating: 550, age: 38, salary: 70  },
  { id: 435, name: "Phillip Hughes",       role: "batsman",      country: "Australia",     battingRating: 550, bowlingRating: 100,  keepingRating: 0,    overallRating: 550, age: 26, salary: 70  },
  { id: 436, name: "Ben Cutting",          role: "allrounder",   country: "Australia",     battingRating: 400, bowlingRating: 500,  keepingRating: 0,    overallRating: 550, age: 37, salary: 70  },
  { id: 437, name: "Kane Richardson",      role: "bowler",       country: "Australia",     battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 34, salary: 70  },
  { id: 438, name: "James Faulkner",       role: "allrounder",   country: "Australia",     battingRating: 400, bowlingRating: 500,  keepingRating: 0,    overallRating: 550, age: 34, salary: 70  },
  { id: 439, name: "Fawad Ahmed",          role: "bowler",       country: "Australia",     battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 42, salary: 70  },
  { id: 440, name: "Nathan Coulter-Nile",  role: "allrounder",   country: "Australia",     battingRating: 350, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 37, salary: 70  },
  { id: 441, name: "Sean Abbott",          role: "bowler",       country: "Australia",     battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 32, salary: 70  },
  { id: 442, name: "Gurinder Sandhu",      role: "bowler",       country: "Australia",     battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 32, salary: 70  },
  { id: 443, name: "Joe Burns",            role: "batsman",      country: "Australia",     battingRating: 550, bowlingRating: 100,  keepingRating: 0,    overallRating: 550, age: 35, salary: 70  },
  { id: 444, name: "Ashton Agar",          role: "allrounder",   country: "Australia",     battingRating: 400, bowlingRating: 500,  keepingRating: 0,    overallRating: 550, age: 31, salary: 70  },
  { id: 445, name: "Scott Boland",         role: "bowler",       country: "Australia",     battingRating: 100, bowlingRating: 860,  keepingRating: 0,    overallRating: 790, age: 37, salary: 90  },
  { id: 446, name: "Joel Paris",           role: "bowler",       country: "Australia",     battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 29, salary: 70  },
  { id: 447, name: "Daniel Morrall",       role: "bowler",       country: "Australia",     battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 28, salary: 70  },
  { id: 448, name: "Joe Mennie",           role: "bowler",       country: "Australia",     battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 35, salary: 70  },
  { id: 449, name: "Chris Tremain",        role: "bowler",       country: "Australia",     battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 33, salary: 70  },
  { id: 450, name: "Chris Lynn",           role: "batsman",      country: "Australia",     battingRating: 550, bowlingRating: 100,  keepingRating: 0,    overallRating: 550, age: 34, salary: 70  },
  { id: 451, name: "Billy Stanlake",       role: "bowler",       country: "Australia",     battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 29, salary: 70  },
  { id: 452, name: "Peter Handscomb",      role: "batsman",      country: "Australia",     battingRating: 550, bowlingRating: 100,  keepingRating: 0,    overallRating: 550, age: 33, salary: 70  },
  { id: 453, name: "Sam Heazlett",         role: "batsman",      country: "Australia",     battingRating: 550, bowlingRating: 100,  keepingRating: 0,    overallRating: 550, age: 29, salary: 70  },
  { id: 454, name: "Hilton Cartwright",    role: "allrounder",   country: "Australia",     battingRating: 400, bowlingRating: 500,  keepingRating: 0,    overallRating: 550, age: 32, salary: 70  },
  { id: 455, name: "Andrew Tye",           role: "bowler",       country: "Australia",     battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 37, salary: 70  },
  { id: 456, name: "Alex Carey",           role: "wicketkeeper", country: "Australia",     battingRating: 650, bowlingRating: 0,    keepingRating: 760,  overallRating: 700, age: 34, salary: 100 },
  { id: 457, name: "Jhye Richardson",      role: "bowler",       country: "Australia",     battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 28, salary: 70  },
  { id: 458, name: "Michael Neser",        role: "allrounder",   country: "Australia",     battingRating: 400, bowlingRating: 700,  keepingRating: 0,    overallRating: 670, age: 36, salary: 80  },
  { id: 459, name: "D'Arcy Short",         role: "allrounder",   country: "Australia",     battingRating: 450, bowlingRating: 450,  keepingRating: 0,    overallRating: 550, age: 33, salary: 70  },
  { id: 460, name: "Jason Behrendorff",    role: "bowler",       country: "Australia",     battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 34, salary: 70  },
  { id: 461, name: "Ashton Turner",        role: "batsman",      country: "Australia",     battingRating: 550, bowlingRating: 100,  keepingRating: 0,    overallRating: 550, age: 31, salary: 70  },
  { id: 462, name: "Marnus Labuschagne",   role: "batsman",      country: "Australia",     battingRating: 550, bowlingRating: 200,  keepingRating: 0,    overallRating: 550, age: 30, salary: 70  },
  { id: 463, name: "Wes Agar",             role: "bowler",       country: "Australia",     battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 28, salary: 70  },
  { id: 464, name: "Ben McDermott",        role: "batsman",      country: "Australia",     battingRating: 550, bowlingRating: 100,  keepingRating: 0,    overallRating: 550, age: 30, salary: 70  },
  { id: 465, name: "Josh Philippe",        role: "wicketkeeper", country: "Australia",     battingRating: 400, bowlingRating: 0,    keepingRating: 700,  overallRating: 550, age: 27, salary: 70  },
  { id: 466, name: "Riley Meredith",       role: "bowler",       country: "Australia",     battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 27, salary: 70  },
  { id: 467, name: "Nathan Ellis",         role: "bowler",       country: "Australia",     battingRating: 100, bowlingRating: 710,  keepingRating: 0,    overallRating: 670, age: 31, salary: 85  },
  { id: 468, name: "Mitchell Swepson",     role: "bowler",       country: "Australia",     battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 30, salary: 70  },
  { id: 469, name: "Matthew Kuhnemann",    role: "bowler",       country: "Australia",     battingRating: 120, bowlingRating: 700,  keepingRating: 0,    overallRating: 660, age: 29, salary: 80  },
  { id: 470, name: "Aaron Hardie",         role: "allrounder",   country: "Australia",     battingRating: 400, bowlingRating: 500,  keepingRating: 0,    overallRating: 550, age: 27, salary: 70  },
  { id: 471, name: "Tim David",            role: "batsman",      country: "Australia",     battingRating: 870, bowlingRating: 100,  keepingRating: 0,    overallRating: 870, age: 29, salary: 70  },
  { id: 472, name: "Tanveer Sangha",       role: "bowler",       country: "Australia",     battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 24, salary: 70  },
  { id: 473, name: "Matthew Short",        role: "batsman",      country: "Australia",     battingRating: 550, bowlingRating: 100,  keepingRating: 0,    overallRating: 550, age: 28, salary: 70  },
  { id: 474, name: "Spencer Johnson",      role: "bowler",       country: "Australia",     battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 28, salary: 70  },
  { id: 475, name: "Xavier Bartlett",      role: "bowler",       country: "Australia",     battingRating: 100, bowlingRating: 720,  keepingRating: 0,    overallRating: 700, age: 27, salary: 85  },
  { id: 476, name: "Lance Morris",         role: "bowler",       country: "Australia",     battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 26, salary: 70  },
  { id: 477, name: "Will Sutherland",      role: "allrounder",   country: "Australia",     battingRating: 400, bowlingRating: 500,  keepingRating: 0,    overallRating: 550, age: 26, salary: 70  },
  { id: 478, name: "Ben Dwarshuis",        role: "bowler",       country: "Australia",     battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 30, salary: 70  },
  { id: 479, name: "Cooper Connolly",      role: "allrounder",   country: "Australia",     battingRating: 400, bowlingRating: 500,  keepingRating: 0,    overallRating: 550, age: 21, salary: 70  },
  { id: 770, name: "Brendan Doggett",     role: "bowler",       country: "Australia",     battingRating: 100, bowlingRating: 610,  keepingRating: 0,    overallRating: 590, age: 32, salary: 70  },
  { id: 771, name: "Todd Murphy",         role: "bowler",       country: "Australia",     battingRating: 120, bowlingRating: 680,  keepingRating: 0,    overallRating: 650, age: 25, salary: 75  },
  { id: 772, name: "Jake Weatherald",     role: "batsman",      country: "Australia",     battingRating: 660, bowlingRating: 100,  keepingRating: 0,    overallRating: 650, age: 31, salary: 80  },
  { id: 773, name: "Beau Webster",        role: "allrounder",   country: "Australia",     battingRating: 650, bowlingRating: 660,  keepingRating: 0,    overallRating: 670, age: 32, salary: 80  },
  // India — extended squad (from list)
  { id: 480, name: "Anshul Kamboj",        role: "bowler",       country: "India",         battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 23, salary: 70  },
  { id: 481, name: "Harshit Rana",         role: "bowler",       country: "India",         battingRating: 100, bowlingRating: 700,  keepingRating: 0,    overallRating: 690, age: 24, salary: 80  },
  { id: 482, name: "Devdutt Padikkal",     role: "batsman",      country: "India",         battingRating: 650, bowlingRating: 100,  keepingRating: 0,    overallRating: 650, age: 25, salary: 80  },
  { id: 483, name: "Akash Deep",           role: "bowler",       country: "India",         battingRating: 100, bowlingRating: 650,  keepingRating: 0,    overallRating: 650, age: 28, salary: 80  },
  { id: 484, name: "S N Khan",             role: "bowler",       country: "India",         battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 30, salary: 70  },
  { id: 485, name: "Prasidh Krishna",      role: "bowler",       country: "India",         battingRating: 100, bowlingRating: 650,  keepingRating: 0,    overallRating: 650, age: 29, salary: 80  },
  { id: 486, name: "Mukesh Kumar",         role: "bowler",       country: "India",         battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 30, salary: 70  },
  { id: 487, name: "KS Bharat",            role: "wicketkeeper", country: "India",         battingRating: 450, bowlingRating: 0,    keepingRating: 750,  overallRating: 550, age: 31, salary: 70  },
  { id: 488, name: "Navdeep Saini",        role: "bowler",       country: "India",         battingRating: 100, bowlingRating: 600,  keepingRating: 0,    overallRating: 600, age: 32, salary: 70  },
  { id: 489, name: "Shahbaz Nadeem",       role: "allrounder",   country: "India",         battingRating: 250, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 33, salary: 70  },
  { id: 490, name: "Mayank Agarwal",       role: "batsman",      country: "India",         battingRating: 840, bowlingRating: 100,  keepingRating: 0,    overallRating: 840, age: 33, salary: 95  },
  { id: 491, name: "Prithvi Shaw",         role: "batsman",      country: "India",         battingRating: 650, bowlingRating: 100,  keepingRating: 0,    overallRating: 650, age: 25, salary: 80  },
  { id: 492, name: "Hanuma Vihari",        role: "batsman",      country: "India",         battingRating: 650, bowlingRating: 300,  keepingRating: 0,    overallRating: 650, age: 31, salary: 80  },
  { id: 493, name: "Karun Nair",           role: "batsman",      country: "India",         battingRating: 600, bowlingRating: 100,  keepingRating: 0,    overallRating: 600, age: 33, salary: 70  },
  { id: 494, name: "Jayant Yadav",         role: "allrounder",   country: "India",         battingRating: 350, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 34, salary: 70  },
  { id: 495, name: "Naman Ojha",           role: "wicketkeeper", country: "India",         battingRating: 400, bowlingRating: 0,    keepingRating: 700,  overallRating: 550, age: 40, salary: 70  },
  { id: 496, name: "Karn Sharma",          role: "bowler",       country: "India",         battingRating: 150, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 36, salary: 70  },
  { id: 497, name: "Pankaj Singh",         role: "bowler",       country: "India",         battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 39, salary: 70  },
  { id: 498, name: "Stuart Binny",         role: "allrounder",   country: "India",         battingRating: 400, bowlingRating: 500,  keepingRating: 0,    overallRating: 550, age: 41, salary: 70  },
  { id: 499, name: "Ajinkya Rahane",       role: "batsman",      country: "India",         battingRating: 840, bowlingRating: 100,  keepingRating: 0,    overallRating: 840, age: 37, salary: 95  },
  { id: 500, name: "Bhuvneshwar Kumar",    role: "bowler",       country: "India",         battingRating: 300, bowlingRating: 780,  keepingRating: 0,    overallRating: 780, age: 35, salary: 95  },
  { id: 501, name: "R Vinay Kumar",        role: "bowler",       country: "India",         battingRating: 200, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 40, salary: 70  },
  { id: 502, name: "Varun Aaron",          role: "bowler",       country: "India",         battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 35, salary: 70  },
  { id: 503, name: "Umesh Yadav",          role: "bowler",       country: "India",         battingRating: 200, bowlingRating: 750,  keepingRating: 0,    overallRating: 750, age: 37, salary: 85  },
  { id: 504, name: "Praveen Kumar",        role: "bowler",       country: "India",         battingRating: 250, bowlingRating: 650,  keepingRating: 0,    overallRating: 650, age: 40, salary: 70  },
  { id: 505, name: "Abhinav Mukund",       role: "batsman",      country: "India",         battingRating: 550, bowlingRating: 100,  keepingRating: 0,    overallRating: 550, age: 35, salary: 70  },
  { id: 506, name: "Jaydev Unadkat",       role: "bowler",       country: "India",         battingRating: 150, bowlingRating: 600,  keepingRating: 0,    overallRating: 600, age: 33, salary: 70  },
  { id: 507, name: "Cheteshwar Pujara",    role: "batsman",      country: "India",         battingRating: 760, bowlingRating: 100,  keepingRating: 0,    overallRating: 760, age: 37, salary: 110 },
  { id: 508, name: "Abhimanyu Mithun",     role: "bowler",       country: "India",         battingRating: 150, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 38, salary: 70  },
  { id: 509, name: "S Badrinath",          role: "batsman",      country: "India",         battingRating: 550, bowlingRating: 100,  keepingRating: 0,    overallRating: 550, age: 43, salary: 70  },
  { id: 510, name: "Pragyan Ojha",         role: "bowler",       country: "India",         battingRating: 150, bowlingRating: 700,  keepingRating: 0,    overallRating: 700, age: 38, salary: 70  },
  { id: 511, name: "Murali Vijay",         role: "batsman",      country: "India",         battingRating: 820, bowlingRating: 100,  keepingRating: 0,    overallRating: 820, age: 40, salary: 85  },
  { id: 512, name: "Amit Mishra",          role: "bowler",       country: "India",         battingRating: 150, bowlingRating: 700,  keepingRating: 0,    overallRating: 700, age: 42, salary: 70  },
  { id: 513, name: "Ishant Sharma",        role: "bowler",       country: "India",         battingRating: 100, bowlingRating: 800,  keepingRating: 0,    overallRating: 800, age: 36, salary: 90  },
  { id: 514, name: "Ramesh Powar",         role: "allrounder",   country: "India",         battingRating: 250, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 47, salary: 70  },
  // England — extended squad
  { id: 515, name: "SJ Cook",             role: "batsman",      country: "England",       battingRating: 550, bowlingRating: 50,   keepingRating: 0,    overallRating: 550, age: 38, salary: 70  },
  { id: 516, name: "Jacob Bethell",       role: "allrounder",   country: "England",       battingRating: 600, bowlingRating: 600,  keepingRating: 0,    overallRating: 550, age: 21, salary: 70  },
  { id: 517, name: "Brydon Carse",        role: "allrounder",   country: "England",       battingRating: 400, bowlingRating: 600,  keepingRating: 0,    overallRating: 550, age: 29, salary: 70  },
  { id: 518, name: "J Hull",              role: "bowler",       country: "England",       battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 25, salary: 70  },
  { id: 519, name: "JL Smith",            role: "batsman",      country: "England",       battingRating: 550, bowlingRating: 100,  keepingRating: 0,    overallRating: 550, age: 24, salary: 70  },
  { id: 520, name: "Gus Atkinson",        role: "allrounder",   country: "England",       battingRating: 350, bowlingRating: 700,  keepingRating: 0,    overallRating: 700, age: 26, salary: 85  },
  { id: 521, name: "Shoaib Bashir",       role: "bowler",       country: "England",       battingRating: 100, bowlingRating: 620,  keepingRating: 0,    overallRating: 620, age: 21, salary: 75  },
  { id: 522, name: "Tom Hartley",         role: "bowler",       country: "England",       battingRating: 150, bowlingRating: 620,  keepingRating: 0,    overallRating: 620, age: 25, salary: 75  },
  { id: 523, name: "Josh Tongue",         role: "bowler",       country: "England",       battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 27, salary: 70  },
  { id: 524, name: "Rehan Ahmed",         role: "bowler",       country: "England",       battingRating: 200, bowlingRating: 650,  keepingRating: 0,    overallRating: 650, age: 21, salary: 80  },
  { id: 525, name: "Jamie Overton",       role: "allrounder",   country: "England",       battingRating: 720, bowlingRating: 840,  keepingRating: 0,    overallRating: 840, age: 30, salary: 70  },
  { id: 526, name: "Matthew Potts",       role: "bowler",       country: "England",       battingRating: 200, bowlingRating: 600,  keepingRating: 0,    overallRating: 600, age: 26, salary: 70  },
  { id: 527, name: "Matt Parkinson",      role: "bowler",       country: "England",       battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 28, salary: 70  },
  { id: 528, name: "Matthew Fisher",      role: "bowler",       country: "England",       battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 28, salary: 70  },
  { id: 529, name: "Saqib Mahmood",       role: "bowler",       country: "England",       battingRating: 150, bowlingRating: 620,  keepingRating: 0,    overallRating: 620, age: 27, salary: 75  },
  { id: 530, name: "Alex Lees",           role: "batsman",      country: "England",       battingRating: 550, bowlingRating: 50,   keepingRating: 0,    overallRating: 550, age: 31, salary: 70  },
  { id: 531, name: "Sam Billings",        role: "wicketkeeper", country: "England",       battingRating: 550, bowlingRating: 0,    keepingRating: 750,  overallRating: 600, age: 33, salary: 75  },
  { id: 532, name: "Ollie Robinson",      role: "bowler",       country: "England",       battingRating: 250, bowlingRating: 700,  keepingRating: 0,    overallRating: 700, age: 31, salary: 90  },
  { id: 533, name: "JR Bracey",           role: "wicketkeeper", country: "England",       battingRating: 400, bowlingRating: 0,    keepingRating: 700,  overallRating: 550, age: 27, salary: 70  },
  { id: 534, name: "Dan Lawrence",        role: "batsman",      country: "England",       battingRating: 600, bowlingRating: 300,  keepingRating: 0,    overallRating: 600, age: 27, salary: 75  },
  { id: 535, name: "A Jones",             role: "batsman",      country: "England",       battingRating: 550, bowlingRating: 50,   keepingRating: 0,    overallRating: 550, age: 28, salary: 70  },
  { id: 536, name: "Dom Sibley",          role: "batsman",      country: "England",       battingRating: 650, bowlingRating: 50,   keepingRating: 0,    overallRating: 650, age: 29, salary: 80  },
  { id: 537, name: "Olly Stone",          role: "bowler",       country: "England",       battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 31, salary: 70  },
  { id: 538, name: "Jason Roy",           role: "batsman",      country: "England",       battingRating: 750, bowlingRating: 100,  keepingRating: 0,    overallRating: 750, age: 34, salary: 95  },
  { id: 539, name: "Joe Denly",           role: "allrounder",   country: "England",       battingRating: 550, bowlingRating: 550,  keepingRating: 0,    overallRating: 600, age: 38, salary: 75  },
  { id: 540, name: "Ben Foakes",          role: "wicketkeeper", country: "England",       battingRating: 620, bowlingRating: 0,    keepingRating: 850,  overallRating: 720, age: 32, salary: 90  },
  { id: 541, name: "Rory Burns",          role: "batsman",      country: "England",       battingRating: 650, bowlingRating: 100,  keepingRating: 0,    overallRating: 650, age: 34, salary: 80  },
  { id: 542, name: "Dom Bess",            role: "allrounder",   country: "England",       battingRating: 300, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 27, salary: 70  },
  { id: 543, name: "Jack Leach",          role: "bowler",       country: "England",       battingRating: 150, bowlingRating: 650,  keepingRating: 0,    overallRating: 650, age: 33, salary: 80  },
  { id: 544, name: "Mason Crane",         role: "bowler",       country: "England",       battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 28, salary: 70  },
  { id: 545, name: "Tom Curran",          role: "allrounder",   country: "England",       battingRating: 350, bowlingRating: 600,  keepingRating: 0,    overallRating: 600, age: 29, salary: 75  },
  { id: 546, name: "Craig Overton",       role: "allrounder",   country: "England",       battingRating: 400, bowlingRating: 600,  keepingRating: 0,    overallRating: 600, age: 30, salary: 75  },
  { id: 547, name: "Mark Stoneman",       role: "batsman",      country: "England",       battingRating: 600, bowlingRating: 50,   keepingRating: 0,    overallRating: 600, age: 37, salary: 75  },
  { id: 548, name: "Tom Westley",         role: "batsman",      country: "England",       battingRating: 550, bowlingRating: 100,  keepingRating: 0,    overallRating: 550, age: 34, salary: 70  },
  { id: 549, name: "Toby Roland-Jones",   role: "bowler",       country: "England",       battingRating: 200, bowlingRating: 600,  keepingRating: 0,    overallRating: 600, age: 35, salary: 75  },
  { id: 550, name: "Dawid Malan",         role: "batsman",      country: "England",       battingRating: 900, bowlingRating: 100,  keepingRating: 0,    overallRating: 900, age: 37, salary: 110 },
  { id: 551, name: "Liam Dawson",         role: "allrounder",   country: "England",       battingRating: 350, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 34, salary: 70  },
  { id: 552, name: "Keaton Jennings",     role: "batsman",      country: "England",       battingRating: 650, bowlingRating: 100,  keepingRating: 0,    overallRating: 650, age: 32, salary: 80  },
  { id: 553, name: "Haseeb Hameed",       role: "batsman",      country: "England",       battingRating: 650, bowlingRating: 50,   keepingRating: 0,    overallRating: 650, age: 28, salary: 80  },
  { id: 554, name: "Zafar Ansari",        role: "allrounder",   country: "England",       battingRating: 300, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 32, salary: 70  },
  { id: 555, name: "Ben Duckett",         role: "batsman",      country: "England",       battingRating: 750, bowlingRating: 100,  keepingRating: 0,    overallRating: 750, age: 30, salary: 95  },
  { id: 556, name: "Jake Ball",           role: "bowler",       country: "England",       battingRating: 150, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 33, salary: 70  },
  { id: 557, name: "James Vince",         role: "batsman",      country: "England",       battingRating: 680, bowlingRating: 100,  keepingRating: 0,    overallRating: 680, age: 33, salary: 85  },
  { id: 558, name: "Alex Hales",          role: "batsman",      country: "England",       battingRating: 780, bowlingRating: 100,  keepingRating: 0,    overallRating: 780, age: 36, salary: 100 },
  { id: 559, name: "Adam Lyth",           role: "batsman",      country: "England",       battingRating: 600, bowlingRating: 100,  keepingRating: 0,    overallRating: 600, age: 37, salary: 75  },
  { id: 560, name: "Sam Robson",          role: "batsman",      country: "England",       battingRating: 550, bowlingRating: 50,   keepingRating: 0,    overallRating: 550, age: 34, salary: 70  },
  { id: 561, name: "Chris Jordan",        role: "bowler",       country: "England",       battingRating: 300, bowlingRating: 650,  keepingRating: 0,    overallRating: 650, age: 36, salary: 80  },
  { id: 562, name: "Boyd Rankin",         role: "bowler",       country: "England",       battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 40, salary: 70  },
  { id: 563, name: "Scott Borthwick",     role: "allrounder",   country: "England",       battingRating: 350, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 35, salary: 70  },
  { id: 564, name: "Gary Ballance",       role: "batsman",      country: "England",       battingRating: 680, bowlingRating: 50,   keepingRating: 0,    overallRating: 680, age: 35, salary: 85  },
  { id: 565, name: "Simon Kerrigan",      role: "bowler",       country: "England",       battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 36, salary: 70  },
  { id: 566, name: "Nick Compton",        role: "batsman",      country: "England",       battingRating: 600, bowlingRating: 50,   keepingRating: 0,    overallRating: 600, age: 41, salary: 75  },
  { id: 567, name: "James Taylor",        role: "batsman",      country: "England",       battingRating: 650, bowlingRating: 50,   keepingRating: 0,    overallRating: 650, age: 35, salary: 80  },
  { id: 568, name: "Samit Patel",         role: "allrounder",   country: "England",       battingRating: 500, bowlingRating: 580,  keepingRating: 0,    overallRating: 600, age: 40, salary: 75  },
  { id: 569, name: "Ajmal Shahzad",       role: "bowler",       country: "England",       battingRating: 200, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 39, salary: 70  },
  // New Zealand — extended squad
  { id: 570, name: "Tom Latham",          role: "wicketkeeper", country: "New Zealand",   battingRating: 830, bowlingRating: 0,    keepingRating: 850,  overallRating: 830, age: 33, salary: 105 },
  { id: 571, name: "Kyle Jamieson",       role: "allrounder",   country: "New Zealand",   battingRating: 550, bowlingRating: 820,  keepingRating: 0,    overallRating: 820, age: 30, salary: 100 },
  { id: 572, name: "Tom Blundell",        role: "wicketkeeper", country: "New Zealand",   battingRating: 740, bowlingRating: 0,    keepingRating: 820,  overallRating: 740, age: 33, salary: 90  },
  { id: 573, name: "Henry Nicholls",      role: "batsman",      country: "New Zealand",   battingRating: 720, bowlingRating: 100,  keepingRating: 0,    overallRating: 720, age: 33, salary: 90  },
  { id: 574, name: "Will Young",          role: "batsman",      country: "New Zealand",   battingRating: 680, bowlingRating: 100,  keepingRating: 0,    overallRating: 680, age: 32, salary: 85  },
  { id: 575, name: "Michael Bracewell",   role: "allrounder",   country: "New Zealand",   battingRating: 580, bowlingRating: 640,  keepingRating: 0,    overallRating: 640, age: 31, salary: 80  },
  { id: 576, name: "Colin de Grandhomme", role: "allrounder",   country: "New Zealand",   battingRating: 580, bowlingRating: 680,  keepingRating: 0,    overallRating: 700, age: 38, salary: 85  },
  { id: 577, name: "Jimmy Neesham",       role: "allrounder",   country: "New Zealand",   battingRating: 560, bowlingRating: 660,  keepingRating: 0,    overallRating: 680, age: 34, salary: 85  },
  { id: 578, name: "Jeet Raval",          role: "batsman",      country: "New Zealand",   battingRating: 600, bowlingRating: 50,   keepingRating: 0,    overallRating: 600, age: 37, salary: 75  },
  { id: 579, name: "Ajaz Patel",          role: "bowler",       country: "New Zealand",   battingRating: 200, bowlingRating: 620,  keepingRating: 0,    overallRating: 620, age: 36, salary: 75  },
  { id: 580, name: "Will Somerville",     role: "bowler",       country: "New Zealand",   battingRating: 200, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 38, salary: 70  },
  { id: 581, name: "Scott Kuggeleijn",    role: "allrounder",   country: "New Zealand",   battingRating: 380, bowlingRating: 500,  keepingRating: 0,    overallRating: 550, age: 34, salary: 70  },
  { id: 582, name: "Ben Sears",           role: "bowler",       country: "New Zealand",   battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 27, salary: 70  },
  { id: 583, name: "Will O'Rourke",       role: "bowler",       country: "New Zealand",   battingRating: 100, bowlingRating: 580,  keepingRating: 0,    overallRating: 580, age: 23, salary: 70  },
  { id: 584, name: "Blair Tickner",       role: "bowler",       country: "New Zealand",   battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 31, salary: 70  },
  { id: 585, name: "Michael Hay",         role: "batsman",      country: "New Zealand",   battingRating: 550, bowlingRating: 50,   keepingRating: 0,    overallRating: 550, age: 31, salary: 70  },
  { id: 586, name: "Zak Foulkes",         role: "bowler",       country: "New Zealand",   battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 24, salary: 70  },
  { id: 587, name: "MD Rae",              role: "batsman",      country: "New Zealand",   battingRating: 550, bowlingRating: 50,   keepingRating: 0,    overallRating: 550, age: 26, salary: 70  },
  { id: 588, name: "Jacob Duffy",         role: "bowler",       country: "New Zealand",   battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 31, salary: 70  },
  { id: 589, name: "Nathan Smith",        role: "allrounder",   country: "New Zealand",   battingRating: 380, bowlingRating: 500,  keepingRating: 0,    overallRating: 550, age: 24, salary: 70  },
  { id: 590, name: "Matthew Fisher",      role: "bowler",       country: "New Zealand",   battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 27, salary: 70  },
  { id: 591, name: "Neil Broom",          role: "batsman",      country: "New Zealand",   battingRating: 550, bowlingRating: 50,   keepingRating: 0,    overallRating: 550, age: 43, salary: 70  },
  { id: 592, name: "Leo Ronchi",          role: "wicketkeeper", country: "New Zealand",   battingRating: 400, bowlingRating: 0,    keepingRating: 700,  overallRating: 550, age: 43, salary: 70  },
  { id: 593, name: "Matt Craig",          role: "allrounder",   country: "New Zealand",   battingRating: 300, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 36, salary: 70  },
  // South Africa — extended squad
  { id: 594, name: "Lungi Ngidi",         role: "bowler",       country: "South Africa",  battingRating: 100, bowlingRating: 700,  keepingRating: 0,    overallRating: 700, age: 29, salary: 90  },
  { id: 595, name: "Dwaine Pretorius",    role: "allrounder",   country: "South Africa",  battingRating: 450, bowlingRating: 620,  keepingRating: 0,    overallRating: 650, age: 35, salary: 80  },
  { id: 596, name: "George Linde",        role: "allrounder",   country: "South Africa",  battingRating: 400, bowlingRating: 640,  keepingRating: 0,    overallRating: 650, age: 31, salary: 80  },
  { id: 597, name: "Kyle Verreynne",      role: "wicketkeeper", country: "South Africa",  battingRating: 620, bowlingRating: 0,    keepingRating: 810,  overallRating: 650, age: 27, salary: 80  },
  { id: 598, name: "Wiaan Mulder",        role: "allrounder",   country: "South Africa",  battingRating: 500, bowlingRating: 630,  keepingRating: 0,    overallRating: 650, age: 27, salary: 80  },
  { id: 599, name: "Sarel Erwee",         role: "batsman",      country: "South Africa",  battingRating: 640, bowlingRating: 50,   keepingRating: 0,    overallRating: 640, age: 34, salary: 80  },
  { id: 600, name: "Tony de Zorzi",       role: "batsman",      country: "South Africa",  battingRating: 640, bowlingRating: 50,   keepingRating: 0,    overallRating: 640, age: 29, salary: 80  },
  { id: 601, name: "David Bedingham",     role: "batsman",      country: "South Africa",  battingRating: 640, bowlingRating: 100,  keepingRating: 0,    overallRating: 640, age: 30, salary: 80  },
  { id: 602, name: "Gerald Coetzee",      role: "bowler",       country: "South Africa",  battingRating: 150, bowlingRating: 650,  keepingRating: 0,    overallRating: 650, age: 25, salary: 80  },
  { id: 603, name: "Dewald Brevis",       role: "batsman",      country: "South Africa",  battingRating: 640, bowlingRating: 100,  keepingRating: 0,    overallRating: 640, age: 21, salary: 80  },
  { id: 604, name: "Andile Phehlukwayo",  role: "allrounder",   country: "South Africa",  battingRating: 450, bowlingRating: 620,  keepingRating: 0,    overallRating: 650, age: 28, salary: 80  },
  { id: 605, name: "Pieter Malan",        role: "batsman",      country: "South Africa",  battingRating: 600, bowlingRating: 50,   keepingRating: 0,    overallRating: 600, age: 35, salary: 75  },
  { id: 606, name: "Zubayr Hamza",        role: "batsman",      country: "South Africa",  battingRating: 600, bowlingRating: 100,  keepingRating: 0,    overallRating: 600, age: 30, salary: 75  },
  { id: 607, name: "Prenelan Subrayen",   role: "bowler",       country: "South Africa",  battingRating: 150, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 32, salary: 70  },
  { id: 608, name: "L Senokwane",         role: "bowler",       country: "South Africa",  battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 24, salary: 70  },
  { id: 609, name: "Codi Yusuf",          role: "allrounder",   country: "South Africa",  battingRating: 380, bowlingRating: 500,  keepingRating: 0,    overallRating: 550, age: 25, salary: 70  },
  { id: 610, name: "Lizaad Williams",     role: "bowler",       country: "South Africa",  battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 30, salary: 70  },
  { id: 611, name: "Lungelo Ngidi",       role: "bowler",       country: "South Africa",  battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 24, salary: 70  },
  { id: 612, name: "Kwena Maphaka",       role: "bowler",       country: "South Africa",  battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 19, salary: 70  },
  { id: 613, name: "Corbin Bosch",        role: "allrounder",   country: "South Africa",  battingRating: 380, bowlingRating: 500,  keepingRating: 0,    overallRating: 550, age: 30, salary: 70  },
  { id: 614, name: "Matthew Breetzke",    role: "batsman",      country: "South Africa",  battingRating: 550, bowlingRating: 50,   keepingRating: 0,    overallRating: 550, age: 25, salary: 70  },
  { id: 615, name: "Shaun von Berg",      role: "bowler",       country: "South Africa",  battingRating: 150, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 40, salary: 70  },
  { id: 616, name: "Rubin van Tonder",    role: "allrounder",   country: "South Africa",  battingRating: 400, bowlingRating: 500,  keepingRating: 0,    overallRating: 550, age: 28, salary: 70  },
  { id: 617, name: "TL Moreki",           role: "bowler",       country: "South Africa",  battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 26, salary: 70  },
  { id: 618, name: "EM Moore",            role: "batsman",      country: "South Africa",  battingRating: 550, bowlingRating: 50,   keepingRating: 0,    overallRating: 550, age: 25, salary: 70  },
  { id: 619, name: "Cashwell Fortuin",    role: "bowler",       country: "South Africa",  battingRating: 150, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 32, salary: 70  },
  { id: 620, name: "R de Swardt",         role: "bowler",       country: "South Africa",  battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 26, salary: 70  },
  { id: 621, name: "Nandre Burger",       role: "bowler",       country: "South Africa",  battingRating: 100, bowlingRating: 580,  keepingRating: 0,    overallRating: 580, age: 25, salary: 70  },
  { id: 622, name: "N Brand",             role: "bowler",       country: "South Africa",  battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 27, salary: 70  },
  { id: 623, name: "Khaya Zondo",         role: "batsman",      country: "South Africa",  battingRating: 550, bowlingRating: 50,   keepingRating: 0,    overallRating: 550, age: 32, salary: 70  },
  { id: 624, name: "GA Stuurman",         role: "bowler",       country: "South Africa",  battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 30, salary: 70  },
  { id: 625, name: "KD Petersen",         role: "batsman",      country: "South Africa",  battingRating: 550, bowlingRating: 50,   keepingRating: 0,    overallRating: 550, age: 41, salary: 70  },
  { id: 626, name: "Lutho Sipamla",       role: "bowler",       country: "South Africa",  battingRating: 100, bowlingRating: 580,  keepingRating: 0,    overallRating: 580, age: 25, salary: 70  },
  { id: 627, name: "Beuran Hendricks",    role: "bowler",       country: "South Africa",  battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 35, salary: 70  },
  { id: 628, name: "Duanne Olivier",      role: "bowler",       country: "South Africa",  battingRating: 100, bowlingRating: 600,  keepingRating: 0,    overallRating: 600, age: 33, salary: 75  },
  { id: 629, name: "PJ Malan",            role: "batsman",      country: "South Africa",  battingRating: 550, bowlingRating: 50,   keepingRating: 0,    overallRating: 550, age: 28, salary: 70  },
  { id: 630, name: "Senuran Muthusamy",   role: "allrounder",   country: "South Africa",  battingRating: 380, bowlingRating: 500,  keepingRating: 0,    overallRating: 550, age: 32, salary: 70  },
  { id: 631, name: "LG Pretorius",        role: "bowler",       country: "South Africa",  battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 27, salary: 70  },
  // Pakistan — extended squad
  { id: 632, name: "Asif Afridi",         role: "bowler",       country: "Pakistan",      battingRating: 150, bowlingRating: 620,  keepingRating: 0,    overallRating: 620, age: 22, salary: 75  },
  { id: 633, name: "Kashif Ali",          role: "batsman",      country: "Pakistan",      battingRating: 550, bowlingRating: 50,   keepingRating: 0,    overallRating: 550, age: 23, salary: 70  },
  { id: 634, name: "Muhammad Hurraira",   role: "allrounder",   country: "Pakistan",      battingRating: 380, bowlingRating: 500,  keepingRating: 0,    overallRating: 550, age: 22, salary: 70  },
  { id: 635, name: "Kamran Ghulam",       role: "batsman",      country: "Pakistan",      battingRating: 600, bowlingRating: 50,   keepingRating: 0,    overallRating: 600, age: 28, salary: 75  },
  { id: 636, name: "Saim Ayub",           role: "batsman",      country: "Pakistan",      battingRating: 700, bowlingRating: 100,  keepingRating: 0,    overallRating: 700, age: 22, salary: 85  },
  { id: 637, name: "Khurram Shahzad",     role: "bowler",       country: "Pakistan",      battingRating: 100, bowlingRating: 630,  keepingRating: 0,    overallRating: 630, age: 25, salary: 75  },
  { id: 638, name: "Aamer Jamal",         role: "allrounder",   country: "Pakistan",      battingRating: 380, bowlingRating: 630,  keepingRating: 0,    overallRating: 630, age: 27, salary: 75  },
  { id: 639, name: "Mohammad Wasim Jr",   role: "bowler",       country: "Pakistan",      battingRating: 200, bowlingRating: 660,  keepingRating: 0,    overallRating: 660, age: 23, salary: 80  },
  { id: 640, name: "Abrar Ahmed",         role: "bowler",       country: "Pakistan",      battingRating: 150, bowlingRating: 660,  keepingRating: 0,    overallRating: 660, age: 26, salary: 80  },
  { id: 641, name: "Zahid Mahmood",       role: "bowler",       country: "Pakistan",      battingRating: 150, bowlingRating: 600,  keepingRating: 0,    overallRating: 600, age: 34, salary: 75  },
  { id: 642, name: "Mohammad Ali",        role: "bowler",       country: "Pakistan",      battingRating: 100, bowlingRating: 580,  keepingRating: 0,    overallRating: 580, age: 30, salary: 70  },
  { id: 643, name: "Salman Agha",         role: "allrounder",   country: "Pakistan",      battingRating: 550, bowlingRating: 600,  keepingRating: 0,    overallRating: 650, age: 30, salary: 80  },
  { id: 644, name: "Abdullah Shafique",   role: "batsman",      country: "Pakistan",      battingRating: 750, bowlingRating: 100,  keepingRating: 0,    overallRating: 750, age: 25, salary: 95  },
  { id: 645, name: "Tayyab Tahir",        role: "batsman",      country: "Pakistan",      battingRating: 600, bowlingRating: 50,   keepingRating: 0,    overallRating: 600, age: 28, salary: 75  },
  { id: 646, name: "Sajid Khan",          role: "bowler",       country: "Pakistan",      battingRating: 200, bowlingRating: 650,  keepingRating: 0,    overallRating: 650, age: 30, salary: 80  },
  { id: 647, name: "Noman Ali",           role: "bowler",       country: "Pakistan",      battingRating: 200, bowlingRating: 700,  keepingRating: 0,    overallRating: 700, age: 39, salary: 85  },
  { id: 648, name: "Imran Butt",          role: "batsman",      country: "Pakistan",      battingRating: 580, bowlingRating: 50,   keepingRating: 0,    overallRating: 580, age: 32, salary: 70  },
  { id: 649, name: "Zafar Gohar",         role: "allrounder",   country: "Pakistan",      battingRating: 380, bowlingRating: 580,  keepingRating: 0,    overallRating: 580, age: 29, salary: 70  },
  { id: 650, name: "Usman Shinwari",      role: "bowler",       country: "Pakistan",      battingRating: 150, bowlingRating: 580,  keepingRating: 0,    overallRating: 580, age: 32, salary: 70  },
  { id: 651, name: "Abid Ali",            role: "batsman",      country: "Pakistan",      battingRating: 680, bowlingRating: 100,  keepingRating: 0,    overallRating: 680, age: 37, salary: 85  },
  { id: 652, name: "Muhammad Musa",       role: "bowler",       country: "Pakistan",      battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 23, salary: 70  },
  { id: 653, name: "Shaheen Shah Afridi", role: "bowler",       country: "Pakistan",      battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 22, salary: 70  },
  { id: 654, name: "Mir Hamza",           role: "bowler",       country: "Pakistan",      battingRating: 100, bowlingRating: 580,  keepingRating: 0,    overallRating: 580, age: 33, salary: 70  },
  { id: 655, name: "Bilal Asif",          role: "bowler",       country: "Pakistan",      battingRating: 150, bowlingRating: 600,  keepingRating: 0,    overallRating: 600, age: 36, salary: 75  },
  { id: 656, name: "Usman Salahuddin",    role: "batsman",      country: "Pakistan",      battingRating: 550, bowlingRating: 50,   keepingRating: 0,    overallRating: 550, age: 33, salary: 70  },
  { id: 657, name: "Imam-ul-Haq",         role: "batsman",      country: "Pakistan",      battingRating: 780, bowlingRating: 50,   keepingRating: 0,    overallRating: 780, age: 29, salary: 100 },
  { id: 658, name: "Faheem Ashraf",       role: "allrounder",   country: "Pakistan",      battingRating: 500, bowlingRating: 620,  keepingRating: 0,    overallRating: 650, age: 30, salary: 80  },
  { id: 659, name: "Haris Sohail",        role: "batsman",      country: "Pakistan",      battingRating: 700, bowlingRating: 300,  keepingRating: 0,    overallRating: 700, age: 35, salary: 85  },
  { id: 660, name: "Hasan Ali",           role: "bowler",       country: "Pakistan",      battingRating: 200, bowlingRating: 700,  keepingRating: 0,    overallRating: 700, age: 31, salary: 90  },
  { id: 662, name: "Mohammad Abbas",      role: "bowler",       country: "Pakistan",      battingRating: 100, bowlingRating: 710,  keepingRating: 0,    overallRating: 710, age: 35, salary: 85  },
  { id: 663, name: "Sharjeel Khan",       role: "batsman",      country: "Pakistan",      battingRating: 680, bowlingRating: 50,   keepingRating: 0,    overallRating: 680, age: 34, salary: 80  },
  // Sri Lanka — extended squad
  { id: 664, name: "Dinesh Chandimal",    role: "wicketkeeper", country: "Sri Lanka",     battingRating: 810, bowlingRating: 0,    keepingRating: 820,  overallRating: 810, age: 35, salary: 100 },
  { id: 665, name: "Kusal Perera",        role: "wicketkeeper", country: "Sri Lanka",     battingRating: 780, bowlingRating: 0,    keepingRating: 820,  overallRating: 780, age: 34, salary: 95  },
  { id: 666, name: "Angelo Mathews",      role: "allrounder",   country: "Sri Lanka",     battingRating: 880, bowlingRating: 650,  keepingRating: 0,    overallRating: 880, age: 37, salary: 110 },
  { id: 667, name: "Lasith Malinga",      role: "bowler",       country: "Sri Lanka",     battingRating: 150, bowlingRating: 880,  keepingRating: 0,    overallRating: 880, age: 41, salary: 100 },
  { id: 668, name: "Rangana Herath",      role: "bowler",       country: "Sri Lanka",     battingRating: 200, bowlingRating: 840,  keepingRating: 0,    overallRating: 840, age: 46, salary: 90  },
  { id: 669, name: "Dimuth Karunaratne",  role: "batsman",      country: "Sri Lanka",     battingRating: 830, bowlingRating: 100,  keepingRating: 0,    overallRating: 830, age: 36, salary: 100 },
  { id: 670, name: "Nuwan Pradeep",       role: "bowler",       country: "Sri Lanka",     battingRating: 100, bowlingRating: 700,  keepingRating: 0,    overallRating: 700, age: 36, salary: 80  },
  { id: 671, name: "Suranga Lakmal",      role: "bowler",       country: "Sri Lanka",     battingRating: 200, bowlingRating: 700,  keepingRating: 0,    overallRating: 700, age: 37, salary: 80  },
  { id: 672, name: "Thisara Perera",      role: "allrounder",   country: "Sri Lanka",     battingRating: 550, bowlingRating: 650,  keepingRating: 0,    overallRating: 680, age: 35, salary: 80  },
  { id: 673, name: "Niroshan Dickwella",  role: "wicketkeeper", country: "Sri Lanka",     battingRating: 650, bowlingRating: 0,    keepingRating: 800,  overallRating: 680, age: 33, salary: 85  },
  { id: 674, name: "Akila Dananjaya",     role: "bowler",       country: "Sri Lanka",     battingRating: 200, bowlingRating: 660,  keepingRating: 0,    overallRating: 660, age: 31, salary: 80  },
  { id: 675, name: "Milinda Siriwardana", role: "allrounder",   country: "Sri Lanka",     battingRating: 450, bowlingRating: 600,  keepingRating: 0,    overallRating: 620, age: 38, salary: 75  },
  { id: 676, name: "Jeffrey Vandersay",   role: "bowler",       country: "Sri Lanka",     battingRating: 200, bowlingRating: 650,  keepingRating: 0,    overallRating: 650, age: 33, salary: 80  },
  { id: 677, name: "Asitha Fernando",     role: "bowler",       country: "Sri Lanka",     battingRating: 100, bowlingRating: 660,  keepingRating: 0,    overallRating: 660, age: 26, salary: 80  },
  { id: 678, name: "Praveen Jayawickrama",role: "bowler",       country: "Sri Lanka",     battingRating: 150, bowlingRating: 650,  keepingRating: 0,    overallRating: 650, age: 27, salary: 80  },
  { id: 679, name: "Bhanuka Rajapaksa",   role: "batsman",      country: "Sri Lanka",     battingRating: 680, bowlingRating: 100,  keepingRating: 0,    overallRating: 680, age: 32, salary: 85  },
  { id: 680, name: "Avishka Fernando",    role: "batsman",      country: "Sri Lanka",     battingRating: 650, bowlingRating: 50,   keepingRating: 0,    overallRating: 650, age: 26, salary: 80  },
  { id: 681, name: "Oshada Fernando",     role: "batsman",      country: "Sri Lanka",     battingRating: 640, bowlingRating: 50,   keepingRating: 0,    overallRating: 640, age: 31, salary: 80  },
  { id: 682, name: "Lakshan Sandakan",    role: "bowler",       country: "Sri Lanka",     battingRating: 150, bowlingRating: 660,  keepingRating: 0,    overallRating: 660, age: 33, salary: 80  },
  { id: 683, name: "Dushmantha Chameera", role: "bowler",       country: "Sri Lanka",     battingRating: 200, bowlingRating: 680,  keepingRating: 0,    overallRating: 680, age: 32, salary: 85  },
  { id: 684, name: "Kasun Rajitha",       role: "bowler",       country: "Sri Lanka",     battingRating: 100, bowlingRating: 620,  keepingRating: 0,    overallRating: 620, age: 29, salary: 75  },
  { id: 685, name: "Sachith Pathirana",   role: "allrounder",   country: "Sri Lanka",     battingRating: 350, bowlingRating: 580,  keepingRating: 0,    overallRating: 580, age: 30, salary: 70  },
  { id: 686, name: "Lakshitha Rasanjana", role: "bowler",       country: "Sri Lanka",     battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 25, salary: 70  },
  { id: 687, name: "Nuwanidu Fernando",   role: "batsman",      country: "Sri Lanka",     battingRating: 600, bowlingRating: 50,   keepingRating: 0,    overallRating: 600, age: 25, salary: 75  },
  { id: 688, name: "Maheesh Theekshana",  role: "bowler",       country: "Sri Lanka",     battingRating: 150, bowlingRating: 700,  keepingRating: 0,    overallRating: 700, age: 23, salary: 85  },
  { id: 689, name: "Dunith Wellalage",    role: "allrounder",   country: "Sri Lanka",     battingRating: 400, bowlingRating: 680,  keepingRating: 0,    overallRating: 680, age: 22, salary: 80  },
  { id: 690, name: "Janith Liyanage",     role: "batsman",      country: "Sri Lanka",     battingRating: 600, bowlingRating: 50,   keepingRating: 0,    overallRating: 600, age: 22, salary: 75  },
  { id: 691, name: "Nuwan Thushara",      role: "bowler",       country: "Sri Lanka",     battingRating: 100, bowlingRating: 630,  keepingRating: 0,    overallRating: 630, age: 29, salary: 75  },
  { id: 692, name: "Sadeera Samarawickrama", role: "wicketkeeper", country: "Sri Lanka",  battingRating: 620, bowlingRating: 0,    keepingRating: 800,  overallRating: 630, age: 29, salary: 75  },
  { id: 693, name: "Shaminda Eranga",     role: "bowler",       country: "Sri Lanka",     battingRating: 100, bowlingRating: 600,  keepingRating: 0,    overallRating: 600, age: 36, salary: 70  },
  { id: 694, name: "Chamika Karunaratne", role: "allrounder",   country: "Sri Lanka",     battingRating: 420, bowlingRating: 620,  keepingRating: 0,    overallRating: 620, age: 28, salary: 75  },
  { id: 696, name: "Lahiru Gamage",       role: "bowler",       country: "Sri Lanka",     battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 34, salary: 70  },
  { id: 697, name: "Pushpakumara",        role: "bowler",       country: "Sri Lanka",     battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 52, salary: 70  },
  { id: 698, name: "Malinga Bandara",     role: "bowler",       country: "Sri Lanka",     battingRating: 150, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 44, salary: 70  },
  { id: 699, name: "Gunathilaka",         role: "batsman",      country: "Sri Lanka",     battingRating: 680, bowlingRating: 200,  keepingRating: 0,    overallRating: 680, age: 32, salary: 85  },
  { id: 700, name: "Dhananjaya Lakshan",  role: "batsman",      country: "Sri Lanka",     battingRating: 550, bowlingRating: 50,   keepingRating: 0,    overallRating: 550, age: 26, salary: 70  },
  { id: 701, name: "Nipun Dhananjaya",    role: "allrounder",   country: "Sri Lanka",     battingRating: 380, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 24, salary: 70  },
  { id: 702, name: "Hasaranga de Silva",  role: "allrounder",   country: "Sri Lanka",     battingRating: 350, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 27, salary: 70  },
  { id: 703, name: "Chaturanga de Silva", role: "allrounder",   country: "Sri Lanka",     battingRating: 380, bowlingRating: 580,  keepingRating: 0,    overallRating: 580, age: 46, salary: 70  },
  { id: 704, name: "Embuldeniya",         role: "bowler",       country: "Sri Lanka",     battingRating: 150, bowlingRating: 660,  keepingRating: 0,    overallRating: 660, age: 27, salary: 80  },
  { id: 705, name: "Malsha Tharaka",      role: "batsman",      country: "Sri Lanka",     battingRating: 550, bowlingRating: 50,   keepingRating: 0,    overallRating: 550, age: 22, salary: 70  },
  { id: 706, name: "Dilshan Madushanka",  role: "bowler",       country: "Sri Lanka",     battingRating: 100, bowlingRating: 640,  keepingRating: 0,    overallRating: 640, age: 24, salary: 80  },
  { id: 707, name: "Nishan Fernando",     role: "allrounder",   country: "Sri Lanka",     battingRating: 380, bowlingRating: 500,  keepingRating: 0,    overallRating: 550, age: 26, salary: 70  },
  { id: 708, name: "Prabath Jayasuriya",  role: "bowler",       country: "Sri Lanka",     battingRating: 150, bowlingRating: 750,  keepingRating: 0,    overallRating: 750, age: 36, salary: 90  },
  { id: 709, name: "RTM Mendis",          role: "batsman",      country: "Sri Lanka",     battingRating: 550, bowlingRating: 50,   keepingRating: 0,    overallRating: 550, age: 27, salary: 70  },
  { id: 710, name: "Kasun Perera",        role: "batsman",      country: "Sri Lanka",     battingRating: 550, bowlingRating: 50,   keepingRating: 0,    overallRating: 550, age: 29, salary: 70  },
  { id: 711, name: "Shehan Jayasuriya",   role: "allrounder",   country: "Sri Lanka",     battingRating: 380, bowlingRating: 500,  keepingRating: 0,    overallRating: 550, age: 28, salary: 70  },
  { id: 712, name: "Ashan Priyanjan",     role: "batsman",      country: "Sri Lanka",     battingRating: 550, bowlingRating: 50,   keepingRating: 0,    overallRating: 550, age: 30, salary: 70  },
  // Bangladesh — extended squad
  { id: 713, name: "Tanzim Hasan Sakib",  role: "bowler",       country: "Bangladesh",    battingRating: 150, bowlingRating: 650,  keepingRating: 0,    overallRating: 650, age: 23, salary: 80  },
  { id: 714, name: "Hasan Mahmud",        role: "bowler",       country: "Bangladesh",    battingRating: 100, bowlingRating: 620,  keepingRating: 0,    overallRating: 620, age: 24, salary: 75  },
  { id: 715, name: "Nahid Rana",          role: "bowler",       country: "Bangladesh",    battingRating: 100, bowlingRating: 600,  keepingRating: 0,    overallRating: 600, age: 22, salary: 75  },
  { id: 716, name: "Zakir Hasan",         role: "batsman",      country: "Bangladesh",    battingRating: 620, bowlingRating: 50,   keepingRating: 0,    overallRating: 620, age: 26, salary: 75  },
  { id: 717, name: "Mohammad Naim",       role: "batsman",      country: "Bangladesh",    battingRating: 630, bowlingRating: 50,   keepingRating: 0,    overallRating: 630, age: 26, salary: 75  },
  { id: 718, name: "Mahmudul Hasan Joy",  role: "batsman",      country: "Bangladesh",    battingRating: 600, bowlingRating: 50,   keepingRating: 0,    overallRating: 600, age: 24, salary: 70  },
  { id: 719, name: "Yasir Ali",           role: "batsman",      country: "Bangladesh",    battingRating: 580, bowlingRating: 100,  keepingRating: 0,    overallRating: 580, age: 27, salary: 70  },
  { id: 720, name: "Shoriful Islam",      role: "bowler",       country: "Bangladesh",    battingRating: 150, bowlingRating: 610,  keepingRating: 0,    overallRating: 610, age: 23, salary: 75  },
  { id: 721, name: "Ebadot Hossain",      role: "bowler",       country: "Bangladesh",    battingRating: 100, bowlingRating: 600,  keepingRating: 0,    overallRating: 600, age: 31, salary: 70  },
  { id: 722, name: "Shadman Islam",       role: "batsman",      country: "Bangladesh",    battingRating: 580, bowlingRating: 50,   keepingRating: 0,    overallRating: 580, age: 29, salary: 70  },
  { id: 723, name: "Nayeem Hasan",        role: "bowler",       country: "Bangladesh",    battingRating: 200, bowlingRating: 630,  keepingRating: 0,    overallRating: 630, age: 24, salary: 75  },
  { id: 724, name: "Khaled Ahmed",        role: "bowler",       country: "Bangladesh",    battingRating: 100, bowlingRating: 580,  keepingRating: 0,    overallRating: 580, age: 27, salary: 70  },
  { id: 725, name: "Mohammad Mithun",     role: "batsman",      country: "Bangladesh",    battingRating: 560, bowlingRating: 100,  keepingRating: 0,    overallRating: 560, age: 34, salary: 70  },
  { id: 726, name: "Nazmul Islam",        role: "allrounder",   country: "Bangladesh",    battingRating: 350, bowlingRating: 560,  keepingRating: 0,    overallRating: 560, age: 31, salary: 70  },
  { id: 727, name: "Ariful Haque",        role: "allrounder",   country: "Bangladesh",    battingRating: 400, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 29, salary: 70  },
  { id: 728, name: "Abu Jayed",           role: "bowler",       country: "Bangladesh",    battingRating: 100, bowlingRating: 560,  keepingRating: 0,    overallRating: 560, age: 31, salary: 70  },
  { id: 729, name: "Sunzamul Islam",      role: "bowler",       country: "Bangladesh",    battingRating: 150, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 36, salary: 70  },
  { id: 730, name: "Mosaddek Hossain",    role: "allrounder",   country: "Bangladesh",    battingRating: 500, bowlingRating: 580,  keepingRating: 0,    overallRating: 600, age: 28, salary: 70  },
  { id: 731, name: "Nurul Hasan",         role: "wicketkeeper", country: "Bangladesh",    battingRating: 500, bowlingRating: 0,    keepingRating: 750,  overallRating: 560, age: 33, salary: 70  },
  { id: 732, name: "Subashis Roy",        role: "bowler",       country: "Bangladesh",    battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 36, salary: 70  },
  { id: 733, name: "Sabbir Rahman",       role: "batsman",      country: "Bangladesh",    battingRating: 620, bowlingRating: 100,  keepingRating: 0,    overallRating: 620, age: 33, salary: 75  },
  { id: 734, name: "Hasan Murad",         role: "bowler",       country: "Bangladesh",    battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 24, salary: 70  },
  { id: 735, name: "Mahidul Islam Ankon", role: "bowler",       country: "Bangladesh",    battingRating: 100, bowlingRating: 550,  keepingRating: 0,    overallRating: 550, age: 22, salary: 70  },
  { id: 736, name: "Jaker Ali",           role: "wicketkeeper", country: "Bangladesh",    battingRating: 550, bowlingRating: 0,    keepingRating: 750,  overallRating: 580, age: 26, salary: 70  },
  { id: 737, name: "Saif Hassan",         role: "batsman",      country: "Bangladesh",    battingRating: 560, bowlingRating: 100,  keepingRating: 0,    overallRating: 560, age: 27, salary: 70  },
  { id: 738, name: "Shahadat Hossain",    role: "bowler",       country: "Bangladesh",    battingRating: 100, bowlingRating: 560,  keepingRating: 0,    overallRating: 560, age: 40, salary: 70  },
  // TOTW — Ryan Rickelton (89)
  { id: 769, name: "Ryan Rickelton",  role: "wicketkeeper", country: "South Africa", battingRating: 890, bowlingRating: 0,   keepingRating: 920, overallRating: 890, age: 26, salary: 70 },
  // Match Winners promotional cards (MW)
  { id: 760, name: "Jimmy Amarnath",  role: "allrounder",   country: "India",        battingRating: 880, bowlingRating: 880, keepingRating: 0,   overallRating: 910, age: 72, salary: 0 },
  { id: 761, name: "Karun Nair",      role: "batsman",      country: "India",        battingRating: 940, bowlingRating: 200, keepingRating: 0,   overallRating: 940, age: 32, salary: 0 },
  { id: 762, name: "Ben Stokes",      role: "allrounder",   country: "England",      battingRating: 920, bowlingRating: 900, keepingRating: 0,   overallRating: 920, age: 33, salary: 0 },
  { id: 763, name: "Brian Lara",      role: "batsman",      country: "West Indies",  battingRating: 970, bowlingRating: 100, keepingRating: 0,   overallRating: 960, age: 55, salary: 0 },
  { id: 764, name: "Mitchell Starc",  role: "bowler",       country: "Australia",    battingRating: 180, bowlingRating: 940, keepingRating: 0,   overallRating: 910, age: 34, salary: 0 },
  { id: 765, name: "AB de Villiers",  role: "batsman",      country: "South Africa", battingRating: 960, bowlingRating: 300, keepingRating: 750, overallRating: 940, age: 41, salary: 0 },
  { id: 766, name: "Kusal Perera",    role: "wicketkeeper", country: "Sri Lanka",    battingRating: 870, bowlingRating: 100, keepingRating: 880, overallRating: 890, age: 33, salary: 0 },
  { id: 767, name: "Stuart Broad",    role: "bowler",       country: "England",      battingRating: 300, bowlingRating: 970, keepingRating: 0,   overallRating: 960, age: 38, salary: 0 },
  { id: 768, name: "Rohit Sharma",    role: "batsman",      country: "India",        battingRating: 940, bowlingRating: 200, keepingRating: 0,   overallRating: 920, age: 37, salary: 0 },
];

export { ALL_PLAYERS as ALL_PLAYERS_EXPORT };

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
  { id: "zimbabwe",     name: "Zimbabwe",      flag: "🇿🇼" },
  { id: "ireland",      name: "Ireland",       flag: "🇮🇪" },
  { id: "netherlands",  name: "Netherlands",   flag: "🇳🇱" },
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

// Player IDs assigned to each IPL franchise (realistic 2024/25 rosters)
export const IPL_TEAM_ROSTERS: Record<string, number[]> = {
  //  Mumbai Indians — Rohit, Ishan, SKY, Tilak, Hardik, TimDavid(TOTW), Bumrah, Jofra, Stoinis, CameronGreen, Pollard, RovmanPowell, NamanDhir, Rickelton, AlzarriJoseph
  mi:   [1,  6,  9,  12, 13, 29,  43,  55,  60,  84,  331, 380, 423, 428, 471],
  //  Chennai Super Kings — Dhoni, Ruturaj, Conway, ShivamDube, Jadeja, DeepakChahar, Pathirana, Santner, MoeenAli, TusharDeshpande, Ashwin, SureshRaina, WashingtonSundar, Pujara, Rahane
  csk:  [7,  8,  46, 98, 104, 105, 106, 312, 315, 318, 341, 420, 424, 499, 507],
  //  Royal Challengers Bengaluru — Kohli, Maxwell, Hazlewood, Hasaranga, Faf, ABdeV, ChrisGayle, FinnAllen, DineshKarthik, GlennPhillips, Siraj, RajatPatidar, WillJacks, AkashDeep, JamieOverton(TOTW)
  rcb:  [2,  22, 25, 61, 73, 74,  75,  99,  313, 360, 412, 413, 422, 483, 525],
  //  Kolkata Knight Riders — Starc, Russell, Narine, PhilSalt, NitishRana, Rinku, VarunC, ShreyasIyer, Gurbaz, Shakib, UmeshYadav, HarshitRana, Sherfane(TOTW), PragyanOjha, Mustafizur
  kkr:  [19, 35, 56, 65, 68, 76,  132, 210, 319, 320, 415, 481, 503, 510, 756],
  //  Delhi Capitals — RPant, KuldeepYadav, AxarPatel, Warner, DarylMitchell, Nortje, MitchellMarsh, ShardulThakur, SaudShakeel, TristanStubbs, JFM, MukeshKumar, PrithviShaw, AmitMishra, IshantSharma
  dc:   [5,  14, 15, 16, 47,  52,  139, 317, 353, 371, 421, 486, 491, 512, 513],
  //  Sunrisers Hyderabad — PatCummins, TravisHead(TOTW), KaneWilliamson, Markram, MarcoJansen, JasonHolder, Nissanka, MohNabi, HarryBrook, AbhishekSharma, HeinrichKlaasen, WashingtonSundar, NitishKumarReddy, TNatarajan, Bhuvneshwar
  srh:  [18, 21, 44, 53, 54,  59,  63,  70,  119, 122, 125, 316, 418, 419, 500],
  //  Rajasthan Royals — Chahal, SteveSmith, AdamZampa, JosButtler, TrentBoult, IshSodhi, Hetmyer, Jaiswal, SanjuSamson, TabraizShamsi, RiyanParag, DhruvJurel, VaibhavS, PrasiddhKrishna, SikandarRaza
  rr:   [11, 17, 20, 26, 45,  48,  58,  83,  128, 368, 416, 417, 429, 485, 399],
  //  Punjab Kings — JoeRoot, SamCurran, LiamLivingstone, Shaheen, Rizwan, Rabada, DShanaka, Mujeeb, Arshdeep, ShikharDhawan, JoshInglis, JiteshSharma, AnshulKamboj, MayankAgarwal, KarunNair
  pbks: [28, 31, 34, 37, 38,  50,  62,  71,  89,  314, 332, 414, 480, 490, 493],
  //  Lucknow Super Giants — KLRahul, Stoinis, AdilRashid, MarkWood, Babar, ImadWasim, QdKock, Pooran, IbrahimZadran, MohNawaz, LockieFerguson, RomarioShepherd, Naveen-ul-Haq, RaviBishnoi, DevduttpPadikkal
  lsg:  [4,   24, 30, 33, 36,  42,  49,  57,  72,  354, 361, 381, 393, 426, 482],
  //  Gujarat Titans — Gill, Shami, MatthewWade, NaseemShah, DavidMiller, Rashid, SaiSudharsan, NathanLyon, MattHenry, NoorAhmad, LahiruKumara, Omarzai, WridhimanSaha, SpencerJohnson, JaydevUnadkat
  gt:   [3,  10, 23, 41, 51,  69,  97,  153, 175, 216, 388, 392, 425, 474, 506],
};

function getPlayersByCountry(countryId: string): Player[] {
  return ALL_PLAYERS.filter(
    (p) => p.country.toLowerCase().replace(/\s+/g, "-") === countryId
  );
}

export function buildCountryXI(countryId: string): Player[] {
  const players = getPlayersByCountry(countryId);
  const sorted = players.sort((a, b) => b.overallRating - a.overallRating);
  if (sorted.length >= 11) return sorted.slice(0, 11);
  const extras = ALL_PLAYERS.filter(
    (p) => p.country.toLowerCase().replace(/\s+/g, "-") !== countryId
  )
    .sort(() => Math.random() - 0.5)
    .slice(0, 11 - sorted.length);
  return [...sorted, ...extras];
}

export function getCountriesWithPlayers() {
  return COUNTRIES.map((c) => ({ ...c, players: buildCountryXI(c.id) }));
}

export function getCountrySquad(countryId: string): Player[] {
  return getPlayersByCountry(countryId).sort((a, b) => b.overallRating - a.overallRating);
}

export function getCountriesWithFullSquad() {
  return COUNTRIES.filter(
    (c) => getPlayersByCountry(c.id).length >= 11
  ).map((c) => ({ ...c, players: buildCountryXI(c.id) }));
}

/** Left-handed batters: their drawn batter is mirrored. Anyone not listed bats right-handed. */
export const LEFT_HANDED_BATTERS = new Set([
  // Australia
  "Alex Carey", "Ashton Agar", "Ben Dwarshuis", "Cooper Connolly", "D'Arcy Short", "David Warner",
  "Jake Weatherald", "Josh Hazlewood", "Matthew Kuhnemann", "Matthew Wade", "Mitchell Starc",
  "Phillip Hughes", "Sam Heazlett", "Todd Murphy", "Travis Head", "Usman Khawaja",
  // New Zealand
  "Ajaz Patel", "Devon Conway", "Henry Nicholls", "Jeet Raval", "Jimmy Neesham", "Michael Bracewell",
  "Mitchell Santner", "Rachin Ravindra", "Tom Latham",
  // South Africa
  "Andile Phehlukwayo", "David Miller", "George Linde", "Kagiso Rabada", "Quinton de Kock", "Ryan Rickelton",
  "Sarel Erwee", "Senuran Muthusamy", "Tony de Zorzi",
  // India
  "Abhinav Mukund", "Abhishek Sharma", "Arshdeep Singh", "Axar Patel", "Devdutt Padikkal", "Ishan Kishan",
  "Nitish Rana", "Ravindra Jadeja", "Rinku Singh", "Rishabh Pant", "Sai Sudharsan", "Shahbaz Ahmed",
  "Shikhar Dhawan", "Shivam Dube", "Suresh Raina", "Tilak Varma", "Vaibhav Suryavanshi", "Washington Sundar",
  "Yashasvi Jaiswal",
  // England
  "Adam Lyth", "Alex Lees", "Ben Duckett", "Ben Stokes", "Dawid Malan", "Gary Ballance", "Jack Leach",
  "Jacob Bethell", "James Anderson", "Keaton Jennings", "Mark Stoneman", "Moeen Ali", "Rory Burns",
  "Sam Curran", "Scott Borthwick", "Stuart Broad", "Tom Hartley", "Zafar Ansari",
  // Pakistan
  "Faheem Ashraf", "Fakhar Zaman", "Haris Sohail", "Imad Wasim", "Imam-ul-Haq", "Mohammad Nawaz", "Saim Ayub",
  "Saud Shakeel", "Shaheen Afridi", "Shaheen Shah Afridi", "Sharjeel Khan", "Zafar Gohar",
  // West Indies
  "Brian Lara", "Chris Gayle", "Nicholas Pooran", "Sherfane Rutherford", "Shimron Hetmyer",
  // Sri Lanka
  "Bhanuka Rajapaksa", "Charith Asalanka", "Dimuth Karunaratne", "Dunith Wellalage", "Kumar Sangakkara",
  "Kusal Perera", "Milinda Siriwardana", "Niroshan Dickwella", "Prabath Jayasuriya", "Rangana Herath",
  "Sachith Pathirana", "Shehan Jayasuriya", "Thisara Perera",
  // Bangladesh
  "Mohammad Naim", "Mustafizur Rahman", "Najmul Hossain Shanto", "Shadman Islam", "Shakib Al Hasan",
  "Shoriful Islam", "Tamim Iqbal", "Zakir Hasan",
  // Netherlands
  "Vikramjit Singh",
]);

/** Spin bowlers (everyone else bowls pace). */
export const SPINNERS = new Set([
  // India
  "Abhishek Sharma", "Amit Mishra", "Axar Patel", "Jayant Yadav", "Karn Sharma", "Kuldeep Yadav", "Pragyan Ojha",
  "R. Ashwin", "Ramesh Powar", "Ravi Bishnoi", "Ravindra Jadeja", "Riyan Parag", "Shahbaz Ahmed", "Shahbaz Nadeem",
  "Suresh Raina", "Varun Chakravarthy", "Washington Sundar", "Yuzvendra Chahal",
  // Australia
  "Adam Zampa", "Ashton Agar", "Cooper Connolly", "D'Arcy Short", "Fawad Ahmed", "Glenn Maxwell", "Matthew Kuhnemann",
  "Mitchell Swepson", "Nathan Lyon", "Shane Warne", "Tanveer Sangha", "Todd Murphy",
  // England
  "Adil Rashid", "Dom Bess", "Jack Leach", "Jacob Bethell", "Joe Denly", "Liam Dawson", "Liam Livingstone", "Mason Crane",
  "Matt Parkinson", "Moeen Ali", "Rehan Ahmed", "Samit Patel", "Scott Borthwick", "Shoaib Bashir", "Simon Kerrigan",
  "Tom Hartley", "Will Jacks", "Zafar Ansari",
  // Pakistan
  "Abrar Ahmed", "Asif Afridi", "Bilal Asif", "Imad Wasim", "Mohammad Nawaz", "Noman Ali", "Sajid Khan", "Salman Agha",
  "Shadab Khan", "Zafar Gohar", "Zahid Mahmood",
  // New Zealand
  "Ajaz Patel", "Glenn Phillips", "Ish Sodhi", "Michael Bracewell", "Mitchell Santner", "Rachin Ravindra", "Will Somerville",
  // South Africa
  "George Linde", "Keshav Maharaj", "Prenelan Subrayen", "Senuran Muthusamy", "Shaun von Berg", "Tabraiz Shamsi",
  // West Indies
  "Sunil Narine",
  // Sri Lanka
  "Akila Dananjaya", "Chaturanga de Silva", "Dhananjaya de Silva", "Dunith Wellalage", "Embuldeniya", "Hasaranga de Silva",
  "Jeffrey Vandersay", "Lakshan Sandakan", "Maheesh Theekshana", "Malinga Bandara", "Milinda Siriwardana",
  "Prabath Jayasuriya", "Pushpakumara", "Rangana Herath", "Sachith Pathirana", "Shehan Jayasuriya", "Wanindu Hasaranga",
  // Bangladesh
  "Hasan Murad", "Mahmudullah", "Mehidy Hasan Miraz", "Mosaddek Hossain", "Nayeem Hasan", "Nazmul Islam",
  "Shakib Al Hasan", "Sunzamul Islam",
  // Afghanistan
  "Mohammad Nabi", "Mujeeb Ur Rahman", "Noor Ahmad", "Rashid Khan",
  // Zimbabwe
  "Sikandar Raza",
  // Netherlands
  "A Dutt", "CN Ackermann", "Roelof van der Merwe", "Shariz Ahmad", "TJG Pringle",
]);

/** Left-arm bowlers, pace and spin (everyone else bowls right-arm). */
export const LEFT_ARM_BOWLERS = new Set([
  // India
  "Abhishek Sharma", "Arshdeep Singh", "Axar Patel", "Jaydev Unadkat", "Kuldeep Yadav", "Pragyan Ojha", "Ravindra Jadeja",
  "Shahbaz Ahmed", "Shahbaz Nadeem", "T Natarajan",
  // Australia
  "Ashton Agar", "Ben Dwarshuis", "Cooper Connolly", "D'Arcy Short", "Jason Behrendorff", "Joel Paris",
  "Matthew Kuhnemann", "Mitchell Starc", "Spencer Johnson",
  // England
  "Jack Leach", "Jacob Bethell", "Liam Dawson", "Sam Curran", "Samit Patel", "Simon Kerrigan", "Tom Hartley", "Zafar Ansari",
  // Pakistan
  "Asif Afridi", "Imad Wasim", "Mir Hamza", "Mohammad Nawaz", "Noman Ali", "Shaheen Afridi", "Shaheen Shah Afridi",
  "Usman Shinwari", "Zafar Gohar",
  // New Zealand
  "Ajaz Patel", "Mitchell Santner", "Rachin Ravindra", "Trent Boult",
  // South Africa
  "Beuran Hendricks", "George Linde", "Keshav Maharaj", "Kwena Maphaka", "Marco Jansen", "Nandre Burger",
  "Senuran Muthusamy", "Tabraiz Shamsi",
  // Sri Lanka
  "Chaturanga de Silva", "Dilshan Madushanka", "Dunith Wellalage", "Embuldeniya", "Lakshan Sandakan",
  "Milinda Siriwardana", "Prabath Jayasuriya", "Pushpakumara", "Rangana Herath", "Sachith Pathirana",
  // Bangladesh
  "Hasan Murad", "Mustafizur Rahman", "Nazmul Islam", "Shakib Al Hasan", "Shoriful Islam", "Sunzamul Islam",
  // Afghanistan
  "Fazalhaq Farooqi", "Noor Ahmad",
  // Netherlands
  "Roelof van der Merwe", "TJG Pringle",
]);

// Icon players — legendary all-time greats (ids 2000+)
export const ICON_PLAYERS: Player[] = [
  { id: 2001, name: "Sachin Tendulkar",    role: "batsman",    country: "India",        battingRating: 970, bowlingRating: 300, keepingRating: 0, overallRating: 970, age: 51, salary: 0 },
  { id: 2002, name: "Donald Bradman",      role: "batsman",    country: "Australia",    battingRating: 970, bowlingRating: 100, keepingRating: 0, overallRating: 970, age: 100, salary: 0 },
  { id: 2003, name: "Ricky Ponting",       role: "batsman",    country: "Australia",    battingRating: 940, bowlingRating: 200, keepingRating: 0, overallRating: 940, age: 50, salary: 0 },
  { id: 2004, name: "Vivian Richards",     role: "batsman",    country: "West Indies",  battingRating: 950, bowlingRating: 400, keepingRating: 0, overallRating: 950, age: 73, salary: 0 },
  { id: 2005, name: "Kumar Sangakkara",    role: "wicketkeeper", country: "Sri Lanka",  battingRating: 930, bowlingRating: 0,   keepingRating: 920, overallRating: 930, age: 47, salary: 0 },
  { id: 2006, name: "Muttiah Muralitharan",role: "bowler",     country: "Sri Lanka",    battingRating: 100, bowlingRating: 970, keepingRating: 0, overallRating: 920, age: 52, salary: 0 },
  { id: 2007, name: "Sunil Gavaskar",      role: "batsman",    country: "India",        battingRating: 920, bowlingRating: 100, keepingRating: 0, overallRating: 920, age: 75, salary: 0 },
  { id: 2008, name: "Shane Warne",         role: "bowler",     country: "Australia",    battingRating: 300, bowlingRating: 960, keepingRating: 0, overallRating: 920, age: 54, salary: 0 },
  { id: 2009, name: "Jacques Kallis",      role: "allrounder", country: "South Africa", battingRating: 940, bowlingRating: 870, keepingRating: 0, overallRating: 950, age: 49, salary: 0 },
  { id: 2010, name: "Brian Lara",          role: "batsman",    country: "West Indies",  battingRating: 960, bowlingRating: 100, keepingRating: 0, overallRating: 920, age: 55, salary: 0 },
];

export function getIconPlayer(id: number): Player | undefined {
  return ICON_PLAYERS.find((p) => p.id === id);
}

// Prime players unlockable via SBCs / Quests (ids 998+)
export const PRIME_PLAYERS: Player[] = [
  { id: 998, name: "Marnus Labuschagne", role: "batsman",    country: "Australia",  battingRating: 930, bowlingRating: 400, keepingRating: 0, overallRating: 930, age: 30, salary: 200 },
  { id: 999, name: "Ross Taylor",        role: "batsman",    country: "New Zealand",battingRating: 870, bowlingRating: 100, keepingRating: 0, overallRating: 870, age: 40, salary: 170 },
  { id: 1000, name: "Mohammed Shami",   role: "bowler",     country: "India",      battingRating: 80,  bowlingRating: 950, keepingRating: 0, overallRating: 890, age: 34, salary: 180 },
  { id: 1001, name: "Sunil Narine",     role: "allrounder", country: "West Indies",battingRating: 560, bowlingRating: 950, keepingRating: 0, overallRating: 860, age: 36, salary: 180 },
  // Pack-obtainable primes
  { id: 1003, name: "Jasprit Bumrah",      role: "bowler",     country: "India",       battingRating: 80,  bowlingRating: 970, keepingRating: 0, overallRating: 910, age: 31, salary: 220 },
  { id: 1004, name: "Ravindra Jadeja",     role: "allrounder", country: "India",       battingRating: 500, bowlingRating: 950, keepingRating: 0, overallRating: 900, age: 36, salary: 210 },
  { id: 1005, name: "Virat Kohli",         role: "batsman",    country: "India",       battingRating: 950, bowlingRating: 200, keepingRating: 0, overallRating: 950, age: 36, salary: 230 },
  { id: 1006, name: "Pat Cummins",         role: "bowler",     country: "Australia",   battingRating: 350, bowlingRating: 960, keepingRating: 0, overallRating: 920, age: 32, salary: 220 },
  { id: 1007, name: "Mitchell Starc",      role: "bowler",     country: "Australia",   battingRating: 180, bowlingRating: 960, keepingRating: 0, overallRating: 930, age: 35, salary: 215 },
  { id: 1008, name: "Steve Smith",         role: "batsman",    country: "Australia",   battingRating: 950, bowlingRating: 350, keepingRating: 0, overallRating: 950, age: 35, salary: 225 },
  { id: 1009, name: "Nathan Lyon",         role: "bowler",     country: "Australia",   battingRating: 150, bowlingRating: 950, keepingRating: 0, overallRating: 920, age: 37, salary: 200 },
  { id: 1010, name: "Joe Root",            role: "batsman",    country: "England",     battingRating: 950, bowlingRating: 520, keepingRating: 0, overallRating: 950, age: 34, salary: 225 },
  { id: 1011, name: "Ben Stokes",          role: "allrounder", country: "England",     battingRating: 620, bowlingRating: 860, keepingRating: 0, overallRating: 910, age: 33, salary: 220 },
  { id: 1012, name: "Babar Azam",          role: "batsman",    country: "Pakistan",    battingRating: 900, bowlingRating: 100, keepingRating: 0, overallRating: 900, age: 30, salary: 210 },
  { id: 1013, name: "Kane Williamson",     role: "batsman",    country: "New Zealand", battingRating: 940, bowlingRating: 420, keepingRating: 0, overallRating: 940, age: 34, salary: 220 },
  { id: 1014, name: "Trent Boult",         role: "bowler",     country: "New Zealand", battingRating: 100, bowlingRating: 930, keepingRating: 0, overallRating: 880, age: 35, salary: 200 },
  { id: 1015, name: "Andre Russell",       role: "allrounder", country: "West Indies", battingRating: 640, bowlingRating: 870, keepingRating: 0, overallRating: 880, age: 36, salary: 200 },
  { id: 1016, name: "James Anderson",     role: "bowler",     country: "England",     battingRating: 80,  bowlingRating: 970, keepingRating: 0, overallRating: 950, age: 42, salary: 250 },
];

export function getPrimePlayer(id: number): Player | undefined {
  return PRIME_PLAYERS.find((p) => p.id === id);
}

// TOTW player IDs — Travis Head, Vaibhav (90), Tim David (87), Jamie Overton (84), Sherfane Rutherford (83), KL Rahul (92), Sanju Samson (91), Sai Sudharsan (89), Ryan Rickelton (89)
export const TOTW_IDS = new Set([21, 430, 471, 525, 756, 757, 758, 759, 769]);

export const MW_IDS = new Set([760, 761, 762, 763, 764, 765, 766, 767, 768]);

// Derived from ALL_PLAYERS — no duplication
export const MW_PLAYERS: Player[] = ALL_PLAYERS.filter(p => MW_IDS.has(p.id));

export function getMWPlayer(id: number): Player | undefined {
  return MW_PLAYERS.find(p => p.id === id);
}

