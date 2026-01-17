export interface Note {
    id: string;
    title: string;
    user: string;
    content: string;
    createdAt: number;
    updatedAt: number;
    checked: boolean;
    deleted?: boolean;
}