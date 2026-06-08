import User from "../models/user.model";
import {
  CreateUserData,
  LoginData,
  SignupData,
  UpdateUserData,
} from "../validators/user.validator";

const createUser = async (data: SignupData): Promise<number> => {
  const { passwordRepeat, ...rest } = data;
  const existingUser = await User.findByEmail(rest.email);

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const user = new User(rest);
  await user.save();

  return user.user_id!;
};

const loginUser = async (data: LoginData): Promise<User | null> => {
  const user = await User.findByEmail(data.email);
  if (!user) {
    return null;
  }
  const isPasswordValid = await User.verifyPassword(
    data.password,
    user.password,
  );
  if (!isPasswordValid) {
    return null;
  }

  return user;
};

const getAllUsers = async (search?: string): Promise<User[]> => {
  return await User.findAll(search);
};

const createUserByAdmin = async (data: CreateUserData): Promise<number> => {
  const existingUser = await User.findByEmail(data.email);

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const user = new User({
    email: data.email,
    name: data.name,
    password: data.password,
    isAdmin: data.isAdmin || 0,
  });
  await user.save();

  return user.user_id!;
};

const getUserById = async (userId: number): Promise<User | null> => {
  return await User.findById(userId);
};

const updateUser = async (
  userId: number,
  data: UpdateUserData,
): Promise<void> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.name = data.name;
  user.email = data.email;
  user.isAdmin = data.isAdmin || 0;

  if (data.password) {
    user.password = data.password;
  }

  await user.save();
};

const deleteUser = async (userId: number): Promise<void> => {
  await User.delete(userId);
};

export {
  createUser,
  loginUser,
  getAllUsers,
  createUserByAdmin,
  getUserById,
  updateUser,
  deleteUser,
};
