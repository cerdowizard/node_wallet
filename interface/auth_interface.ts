
export interface CreatedUserEventSchema {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  createdAt: Date;
}

export interface LoginUserEventSchema {
  id: string;
  email: string;
}