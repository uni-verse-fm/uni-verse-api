export const data2list = (data: Object) => Object.entries(data).map(user => user[1]);

export default class RepoMockModel {

    items: any[];

    constructor(private data: Object, 
        private simpleId?: number, 
        private createId?: number){
        this.items = data2list(data);
    }

    find = () => this.items;
    findOne = () => this.items[this.simpleId || 0];
    findById = () => this.items[this.simpleId || 0];
    deleteOne = () => this.items[this.simpleId || 0];
    create = () => this.items[this.createId || 1];
    save = () => Promise.resolve();
};

