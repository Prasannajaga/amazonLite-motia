import { BaseModel } from './BaseModel';

export interface UserEntity {
    id: string;
    email: string;
    hashed_password: string;
    full_name?: string | null;
    is_active: boolean;
    is_verified: boolean;
    role: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date | null;
}

export class User extends BaseModel<UserEntity> {
    protected tableName = 'users';

    async findByEmail(email: string): Promise<UserEntity | null> {
        return this.withClient(async (client) => {
            const result = await client.query(
                `SELECT * FROM ${this.tableName} WHERE email = $1`,
                [email]
            );
            return result.rows[0] || null;
        });
    }
}

export const userModel = new User();
