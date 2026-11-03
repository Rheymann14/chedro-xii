export type UserRole = 'admin' | 'editor';

export type User = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
    idleTimeoutMinutes: number;
};
