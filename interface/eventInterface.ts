

export interface EventSchema {
    id: string;
    userId: string;
    actionType: string;
    actionName: string;
    payload: any;
}