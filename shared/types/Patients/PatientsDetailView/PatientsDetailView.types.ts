export type PatientsDetailViewPatientInfoType = {
  id: number;
  name: string;
  age: string;
  email: string;
  gender: "MALE" | "FEMALE";
};

export type PatientsDetailViewRequestType = {
  id: number;
};

export type PatientsIterationDetailsType = {
  iteration_code: string;
  left_sign_image_url: string;
  right_sign_image_url: string;
  front_sign_image_url: string;
};

export type PatientsDetailViewResponseType = {
  iteration_details: PatientsIterationDetailsType[];
};
