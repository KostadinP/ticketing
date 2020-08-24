import {createHash} from 'crypto'

export class Password {
    static async toHash(password: string) {
        return createHash('sha512').update(password).digest('hex');
    }

    static compare(storedPassword: string, suppliedPassword: string) {
        const hashedSuppliedPassword = createHash('sha512').update(suppliedPassword).digest('hex');
        return storedPassword === hashedSuppliedPassword;
    }
}