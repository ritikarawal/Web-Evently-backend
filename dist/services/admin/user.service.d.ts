import { CreateUserDTO, UpdateUserDTO, GetUsersDTO } from "../../dtos/user.dto";
export declare class AdminUserService {
    createUser(data: CreateUserDTO): Promise<import("../../domain/entities/user.model").IUser>;
    getAllUsers(): Promise<import("../../domain/entities/user.model").IUser[]>;
    getAdminUsers(): Promise<import("../../domain/entities/user.model").IUser[]>;
    getUsersPaginated(data: GetUsersDTO): Promise<{
        users: import("../../domain/entities/user.model").IUser[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    deleteUser(id: string): Promise<boolean>;
    updateUser(id: string, updateData: UpdateUserDTO): Promise<import("../../domain/entities/user.model").IUser | null>;
    getUserById(id: string): Promise<import("../../domain/entities/user.model").IUser>;
}
//# sourceMappingURL=user.service.d.ts.map