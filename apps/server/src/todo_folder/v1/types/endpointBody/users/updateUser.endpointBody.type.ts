export type UpdateUserEndpointBody = {
  userId: number;
  lastname: string;
  firstname: string;
  mail: string;
  rawPassword: string;
  adressCountry: string;
  adressRegionCode: string;
  adressCity: string;
  adressLocation: string;
  adressPrecision: string;
};
