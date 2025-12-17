import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { userModel } from '../models/User';
import { refreshTokenModel } from '../models/RefreshToken';
import { passwordResetTokenModel } from '../models/PasswordResetToken';

const JWT_SECRET = process.env.JWT_SECRET || 'a7a6da7%$%$@#%$@%^#@%672365264';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export class AuthService {

    async register(data: { email: string; password: string; full_name?: string }) {
        const existingUser = await userModel.findByEmail(data.email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newUser = await userModel.create({
            email: data.email,
            hashed_password: hashedPassword,
            full_name: data.full_name,
            is_active: true,
            role: 'user',
        });

        const { hashed_password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    async login(data: { username: string; password: string }) {
        const user = await userModel.findByEmail(data.username);

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValidPassword = await bcrypt.compare(data.password, user.hashed_password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        const tokens = this.generateTokens(user.id, user.email, user.role);

        await refreshTokenModel.create({
            user_id: user.id,
            token: tokens.refresh_token,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        };
    }

    async refreshTokens(refreshToken: string) {
        try {
            jwt.verify(refreshToken, JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid refresh token');
        }

        const storedToken = await refreshTokenModel.findByToken(refreshToken);
        if (!storedToken) {
            throw new Error('Invalid refresh token');
        }

        if (storedToken.revoked_at) {
            throw new Error('Revoked token');
        }

        if (new Date() > storedToken.expires_at) {
            throw new Error('Token expired');
        }

        const user = await userModel.findById(storedToken.user_id);
        if (!user) {
            throw new Error('User not found');
        }

        // Revoke old token
        await refreshTokenModel.update(storedToken.id, { revoked_at: new Date() });

        const tokens = this.generateTokens(user.id, user.email, user.role);

        await refreshTokenModel.create({
            user_id: user.id,
            token: tokens.refresh_token,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        };
    }

    async requestPasswordReset(email: string): Promise<string> {
        const user = await userModel.findByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);

        await passwordResetTokenModel.create({
            user_id: user.id,
            token: token,
            expires_at: expiresAt
        });

        return token;
    }

    async resetPassword(token: string, newPassword: string) {
        const resetToken = await passwordResetTokenModel.findByToken(token);
        if (!resetToken) {
            throw new Error('Invalid or expired password reset token');
        }

        if (resetToken.used_at || new Date() > resetToken.expires_at) {
            throw new Error('Invalid or expired password reset token');
        }

        const user = await userModel.findById(resetToken.user_id);
        if (!user) {
            throw new Error('User not found');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await userModel.update(resetToken.user_id, { hashed_password: hashedPassword });

        await passwordResetTokenModel.update(resetToken.id, { used_at: new Date() });

        return {
            email: user.email,
            full_name: user.full_name
        };
    }

    async logout(refreshToken: string) {
        const storedToken = await refreshTokenModel.findByToken(refreshToken);
        if (storedToken) {
            await refreshTokenModel.update(storedToken.id, { revoked_at: new Date() });
        }
    }

    private generateTokens(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role };

        const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
        const refresh_token = jwt.sign({ sub: userId, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

        return {
            access_token,
            token_type: 'bearer',
            refresh_token
        };
    }
}


export const authService = new AuthService();
