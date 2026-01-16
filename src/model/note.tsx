export interface Note {
    id: number;
    title: string;
    user: string;
    content: string;
    createdAt: Date;
    checked: boolean;
}