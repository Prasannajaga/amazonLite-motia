import { BaseModel } from './BaseModel';

export interface PasswordResetTokenEntity {
    id: string;
    user_id: string;
    token: string;
    expires_at: Date;
    used_at: Date | null;
    created_at: Date;
}

export class PasswordResetToken extends BaseModel<PasswordResetTokenEntity> {
    protected tableName = 'password_reset_tokens';

    async findByToken(token: string): Promise<PasswordResetTokenEntity | null> {
        return this.withClient(async (client) => {
            const result = await client.query(
                `SELECT * FROM ${this.tableName} WHERE token = $1`,
                [token]
            );
            return result.rows[0] || null;
        });
    }
}

export const passwordResetTokenModel = new PasswordResetToken();
