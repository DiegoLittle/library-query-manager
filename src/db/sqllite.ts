import { Entity, MikroORM, Property, PrimaryKey } from "@mikro-orm/core";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";



@Entity()
export class RepoEntity {
    @PrimaryKey()
    id!: string

    @Property()
    name!: string;

    @Property()
    user!: string;

    @Property()
    url: string = '';

    @Property()
    github_data: string = '';

    @Property()
    setup: string = '';

    @Property()
    topics: string = '';

    @Property()
    inodes: string = '';

    @Property()
    fullUrl: string = '';

    @Property()
    dependents: string = '';

    @Property()
    config: string = '';

    @Property()
    tree: string = '';
    

    constructor(data: RepoEntity) {
        Object.assign(this, data);
    }
}


export async function setupDB(dbPath:string) {
    const orm: MikroORM = await MikroORM.init({
        metadataProvider: TsMorphMetadataProvider,
        entities: [RepoEntity],
        dbName: dbPath,
        type: "sqlite",
        debug: false
      });
      await orm.getSchemaGenerator().ensureDatabase();
    //   await orm.getSchemaGenerator().dropSchema();
    try {
        await orm.getSchemaGenerator().createSchema()
    } catch (error) {
    }
    orm.close(true)


}


export async function findRepo(dbPath: string, url: string) { 
    const orm: MikroORM = await MikroORM.init({
        metadataProvider: TsMorphMetadataProvider,
        entities: [RepoEntity],
        dbName: dbPath,
        type: "sqlite",
        debug: false
    });
    const fork = orm.em.fork()
    const test = await fork.find(RepoEntity, {})
    const res = await fork.findOne(RepoEntity, { url: url })
    orm.close(true)
    return res
}



    // CREATE TABLE repo(id STRING PRIMARY KEY, name STRING, user STRING, url STRING, github_data STRING, setup STRING, topics STRING, inodes STRING, fullUrl STRING, dependents STRING, config STRING) 
const repoInsert = `
INSERT INTO repo (id, name, user, url, github_data, setup, topics, inodes, fullUrl, dependents, config)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`