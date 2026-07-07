export type AssignableUser = {
    id: number;
    name: string;
};

export type UserListResponse = {
    success: boolean;
    message: string;
    data: AssignableUser[];
};