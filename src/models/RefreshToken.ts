import { BaseModel } from './BaseModel';

export interface RefreshTokenEntity {
    id: string;
    user_id: string;
    token: string;
    expires_at: Date;
    revoked_at: Date | null;
    created_at: Date;
}

export class RefreshToken extends BaseModel<RefreshTokenEntity> {
    protected tableName = 'refresh_tokens';

    async findByToken(token: string): Promise<RefreshTokenEntity | null> {
        return this.withClient(async (client) => {
            const result = await client.query(
                `SELECT * FROM ${this.tableName} WHERE token = $1`,
                [token]
            );
            return result.rows[0] || null;
        });
    }
}

export const refreshTokenModel = new RefreshToken();
