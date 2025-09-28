import Dexie, { Table } from 'dexie';
import { Property } from './types';

class VCHDatabase extends Dexie {
    public properties!: Table<Property, string>;
    public keyValuePairs!: Table<{ key: string; value: any }, string>;

    public constructor() {
        super("VCHDatabase");
        this.version(2).stores({
            properties: 'id, name, address',
            keyValuePairs: 'key',
        });
    }

    async setItem(key: string, value: any): Promise<void> {
        await this.keyValuePairs.put({ key, value });
    }

    async getItem<T>(key: string): Promise<T | null> {
        const item = await this.keyValuePairs.get(key);
        return item ? (item.value as T) : null;
    }
}

export const db = new VCHDatabase();

    