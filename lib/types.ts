export type Achievement = {
  position: string;
  location: string;
  points: string;
};

export type PedigreePerson = {
  ringId: string;
  name: string;
  color: string;
  owner: string;
  notes: string;
  achievements: Achievement[];
};

export type ContactBlock = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  phone: string;
};

export type PedigreeData = {
  main: PedigreePerson;
  father: PedigreePerson;
  mother: PedigreePerson;
  grandparents: {
    fatherFather: PedigreePerson;
    fatherMother: PedigreePerson;
    motherFather: PedigreePerson;
    motherMother: PedigreePerson;
  };
  lineage: PedigreePerson[];
  contact: ContactBlock;
  imageDataUrl: string;
};

export type PedigreeAction =
  | { type: "SET_FIELD"; path: string; value: string }
  | { type: "SET_IMAGE"; value: string }
  | { type: "ADD_ACHIEVEMENT"; personPath: string }
  | { type: "REMOVE_ACHIEVEMENT"; personPath: string; index: number }
  | { type: "SET_ACHIEVEMENT_FIELD"; personPath: string; index: number; key: keyof Achievement; value: string }
  | { type: "RESET_TEMPLATE" }
  | { type: "CLEAR_FORM" }
  | { type: "LOAD_DATA"; payload: PedigreeData };
