import { IUser } from "../../domain/entities/user.model";
export interface IUserRepository {
    getUserByEmail(email: string): Promise<IUser | null>;
    getUserByUsername(username: string): Promise<IUser | null>;
    createUser(userData: Partial<IUser>): Promise<IUser>;
    getUserById(id: string): Promise<IUser | null>;
    getAllUsers(): Promise<IUser[]>;
    getUsersPaginated(page: number, limit: number): Promise<{
        users: IUser[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    getAdminUsers(): Promise<IUser[]>;
    updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
    deleteUser(id: string): Promise<boolean>;
}
export declare class UserRepository implements IUserRepository {
    createUser(userData: Partial<IUser>): Promise<IUser>;
    getUserByEmail(email: string): Promise<IUser | null>;
    getUserByUsername(username: string): Promise<IUser | null>;
    getUserById(id: string): Promise<IUser | null>;
    getAllUsers(): Promise<IUser[]>;
    getUsersPaginated(page: number, limit: number): Promise<{
        users: IUser[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    getAdminUsers(): Promise<IUser[]>;
    updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
    deleteUser(id: string): Promise<boolean>;
}
//# sourceMappingURL=user.repository.d.ts.map