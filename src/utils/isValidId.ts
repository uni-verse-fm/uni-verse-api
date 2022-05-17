import { BadRequestException } from "@nestjs/common";

export const isValidId = (id: string): void => {
    if(!/^[0-9a-fA-F]{24}$/.test(id)) throw new NonValidIdException;
}

export class NonValidIdException extends Error {
    constructor() {
        super("Not valid id");
    }
}