import { CreateUserDTO, LoginUserDTO } from "../../dtos/user.dto";
import { IUser } from "../../domain/entities/user.model";
export declare class UserService {
    register(data: CreateUserDTO): Promise<{
        token: string;
        user: any;
    }>;
    login(data: LoginUserDTO): Promise<{
        token: string;
        user: any;
    }>;
    updateProfilePicture(userId: string, profilePictureUrl: string): Promise<IUser>;
    getProfile(userId: string): Promise<any>;
    updateProfile(userId: string, data: Partial<IUser>): Promise<any>;
    sendResetPasswordEmail(email?: string): Promise<IUser>;
    resetPassword(token?: string, newPassword?: string): Promise<IUser>;
}
//# sourceMappingURL=user.service.d.ts.map