import { PedigreeData } from "@/lib/types";

const siblingsWon = [
  { position: "BAN 24-510695 M", location: "", points: "" },
  { position: "8th", location: "Sirajganj", points: "805 p" },
  { position: "19th", location: "Rangpur", points: "884 p" },
  { position: "55th", location: "Tetulia", points: "449 p" },
  { position: "BAN 24-510696 V", location: "", points: "" },
  { position: "10th", location: "Sirajganj", points: "805 p" },
  { position: "90th", location: "Sirajganj", points: "1098 p" },
  { position: "BAN 23-500779 V", location: "", points: "" },
  { position: "34th", location: "Tetulia", points: "449 p" },
  { position: "60th", location: "Rangpur", points: "884 p" }
];

const emptyAchievements = [{ position: "", location: "", points: "" }];

export const TEMPLATE_DATA: PedigreeData = {
  main: {
    ringId: "BAN 23 - 500372 M",
    name: "The 372",
    color: "Chequer",
    owner: "Zakir Hossain",
    notes: "Brother / Sister Won :",
    achievements: [...siblingsWon]
  },
  father: {
    ringId: "BAN 20 - 705091 M",
    name: "The 091",
    color: "Chequer",
    owner: "Zakir Hossain",
    notes: "Father to :",
    achievements: [...siblingsWon]
  },
  mother: {
    ringId: "BAN 23 - 500374 V",
    name: "The 374",
    color: "Blue",
    owner: "Zakir Hossain",
    notes: "Winner of",
    achievements: [{ position: "15th", location: "Sirajganj", points: "805 p" }, { position: "Mother to :", location: "", points: "" }, ...siblingsWon]
  },
  grandparents: {
    fatherFather: {
      ringId: "BAN 13 - 46767 M",
      name: "The 767",
      color: "Blue",
      owner: "Zakir Hossain",
      notes: "Winner of",
      achievements: [
        { position: "2nd", location: "Chittagong", points: "933 p" },
        { position: "14th", location: "Chandaish", points: "226 p" },
        { position: "15th", location: "Coxbazar", points: "108 p" },
        { position: "And many more result", location: "", points: "" }
      ]
    },
    fatherMother: {
      ringId: "BAN 10 - 11275 V",
      name: "Marcel - Eijerkamp",
      color: "Chequer",
      owner: "Mynuddin Ahamed",
      notes: "Super Breeder",
      achievements: [
        { position: "G. Daughter", location: "Maximus", points: "" },
        { position: "Full Brother", location: "Magic Gun", points: "" },
        { position: "2 X", location: "1st Prize Winner", points: "" }
      ]
    },
    motherFather: {
      ringId: "BAN 19 - 125245 M",
      name: "The 245",
      color: "Blue",
      owner: "Zakir Hossain",
      notes: "Father to :",
      achievements: [
        { position: "BAN 23 - 500374 V", location: "", points: "" },
        { position: "15th", location: "Sirajganj", points: "805 p" },
        { position: "Grand Father to :", location: "", points: "" },
        { position: "BAN 24-510695 M", location: "", points: "" },
        { position: "8th", location: "Sirajganj", points: "805 p" },
        { position: "19th", location: "Rangpur", points: "884 p" },
        { position: "55th", location: "Tetulia", points: "449 p" }
      ]
    },
    motherMother: {
      ringId: "BAN 15 - 75991 V",
      name: "The 991",
      color: "Check",
      owner: "Jakir Hossain",
      notes: "Nest Brother Won",
      achievements: [
        { position: "BAN 15-75992 M", location: "", points: "" },
        { position: "5th", location: "Chokoria", points: "678 p" },
        { position: "17th", location: "Saidpur", points: "1126 p" },
        { position: "25th", location: "Chowmu.", points: "1092" },
        { position: "Half Bro & Sis Won", location: "", points: "" },
        { position: "BAN 15-71319", location: "", points: "" },
        { position: "1 Nat", location: "Chowmuh", points: "5436 p" }
      ]
    }
  },
  contact: {
    name: "Zakir Hossain",
    addressLine1: "Add: 41/41 Kajla Noyanogo",
    addressLine2: "Jatrabari, Dhaka 1236",
    phone: "+880 18191-57737",
    email: ""
  },
  lineage: [
    {
      ringId: "BAN 11-21998 M",
      name: "The 998",
      color: "Blue",
      owner: "Mynuddin Ahamed",
      notes: "G. Grand Son Machine Gun",
      achievements: []
    },
    {
      ringId: "BAN 10 - 11275 V",
      name: "Marcel - Eijerkamp",
      color: "Chequer",
      owner: "Mynuddin Ahamed",
      notes: "Super Breeder",
      achievements: []
    },
    {
      ringId: "NL 09 - 1904538 M",
      name: "Gr.Boy Super Breeder",
      color: "Red",
      owner: "Marcel Sangers",
      notes: "Son Maximums",
      achievements: []
    },
    {
      ringId: "NL 05 - 2184770 V",
      name: "Azury",
      color: "Chequer",
      owner: "Sangers – Koopman",
      notes: "",
      achievements: []
    },
    {
      ringId: "NL 09 - 1675990 M",
      name: "The 990",
      color: "",
      owner: "Jan & Kathy Lotterman",
      notes: "Blauw Witpen",
      achievements: []
    },
    {
      ringId: "BAN 12 - 37796 V",
      name: "The 796",
      color: "",
      owner: "Zakir Hossain",
      notes: "Daughter Pulp Fiction",
      achievements: [{ position: "Pulp Fiction is full", location: "", points: "" }]
    },
    {
      ringId: "BAN 11-21998 M",
      name: "The 998",
      color: "Blue",
      owner: "Mynuddin Ahamed",
      notes: "G. Grand son",
      achievements: []
    },
    {
      ringId: "NL 10 - 1771918 V",
      name: "The 918",
      color: "Check",
      owner: "Interpalomas Lofts",
      notes: "100% GEBR.JANSSEN",
      achievements: []
    }
  ],
  imageDataUrl: ""
};

const blankPerson = () => ({
  ringId: "",
  name: "",
  color: "",
  owner: "",
  notes: "",
  achievements: [...emptyAchievements]
});

export const EMPTY_DATA: PedigreeData = {
  main: blankPerson(),
  father: blankPerson(),
  mother: blankPerson(),
  grandparents: {
    fatherFather: blankPerson(),
    fatherMother: blankPerson(),
    motherFather: blankPerson(),
    motherMother: blankPerson()
  },
  lineage: Array.from({ length: 8 }, () => blankPerson()),
  contact: {
    name: "",
    addressLine1: "",
    addressLine2: "",
    phone: "",
    email: ""
  },
  imageDataUrl: ""
};
