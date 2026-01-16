export interface Note {
    id: string;
    title: string;
    user: string;
    content: string;
    createdAt: Date;
    checked: boolean;
}