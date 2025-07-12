export interface LoggedInUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  access_token: string;
  refresh_token: string;
}

export interface LoggedOutUserResponse {
  message: string;
}

export interface CreatedUserResponse {
  id: string;
  email: string;
  createdAt: Date;
}