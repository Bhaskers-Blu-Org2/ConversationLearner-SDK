import { BlisMemory } from '../BlisMemory';
import { BlisDebug} from '../BlisDebug';
import { Utils} from '../Utils';
import { Memory, FilledEntity, MemoryValue, PredictedEntity, FilledEntityMap } from 'blis-models';

const NEGATIVE_PREFIX = "~";

export class BotMemory 
{
    private static _instance : BotMemory = null;
    private static MEMKEY = "BOTMEMORY";
    private memory : BlisMemory;
    public filledEntities : FilledEntityMap;

    private constructor(init?:Partial<BotMemory>)
    {
        this.filledEntities = new FilledEntityMap();
        (<any>Object).assign(this, init);
    }

    public static Get(blisMemory : BlisMemory) : BotMemory
    {
        if (!BotMemory._instance) {
            BotMemory._instance = new BotMemory();
        }
        BotMemory._instance.memory = blisMemory;
        return BotMemory._instance;
    }

    public async FilledEntityMap() : Promise<FilledEntityMap> {
        await this.Init();
        return this.filledEntities;
    }

    private async Init() : Promise<void>
    {
        if (!this.memory)
        {
            throw "BotMemory called without initialzing memory";
        }
 
        let data = await this.memory.GetAsync(BotMemory.MEMKEY);
        if (data)
        {
            this.Deserialize(data);
        } 
        else {
            this.Clear();
        }
    }

    public Serialize() : string
    {
        return JSON.stringify(this.filledEntities.map);
    }

    private Deserialize(text : string) : void
    {
        if (!text) return null;
        let json = JSON.parse(text);
        this.filledEntities.map = json ? json : {};
    }

    private async Set() : Promise<void>
    {
        if (!this.memory)
        {
            throw "BotMemory called without initialzing memory";
        }
        await this.memory.SetAsync(BotMemory.MEMKEY, this.Serialize());
    }

    public async Clear() : Promise<void>		
    {		
        this.filledEntities = new FilledEntityMap();
        await this.Set();		
    }

    /** Remember a predicted entity */		
    public async RememberEntity(predictedEntity : PredictedEntity) : Promise<void> {		
        let isBucket = predictedEntity.metadata ? predictedEntity.metadata.isBucket : false;		
        await this.Remember(predictedEntity.entityName, predictedEntity.entityId, predictedEntity.entityText, 
            isBucket, predictedEntity.builtinType, predictedEntity.resolution);		
    }

    // Remember value for an entity
    public async Remember(entityName: string, entityId: string, userText: string, 
                            isBucket: boolean = false, builtinType: string = null, resolution: {} = null) : Promise<void> {

        await this.Init();

        if (!this.filledEntities.map[entityName])
        {
            this.filledEntities.map[entityName] = new FilledEntity({entityId: entityId});
        }

        let displayText = builtinType ? Utils.PrebuiltDisplayText(builtinType, resolution, userText) : null;

        const filledEntity = this.filledEntities.map[entityName]
        // Check if entity buckets values
        if (isBucket)
        {
            // Add if not a duplicate
            const containsDuplicateValue = filledEntity.values.some(memoryValue => memoryValue.userText === userText);
            if (!containsDuplicateValue) {
                filledEntity.values.push(new MemoryValue({userText: userText, displayText: displayText, builtinType: builtinType, resolution: resolution}));
            }
        }
        else
        {
            filledEntity.values = [new MemoryValue({userText: userText, displayText: displayText, builtinType: builtinType, resolution: resolution})];
        }
        await this.Set();
    }

    /** Return array of entity names for which I've remembered something */
    public async RememberedNames() : Promise<string[]>
    {
        await this.Init();
        return Object.keys(this.filledEntities);
    }

    /** Return array of entity Ids for which I've remembered something */
    public async FilledEntities() : Promise<FilledEntity[]>
    {
        await this.Init();
        return Object.keys(this.filledEntities.map).map((val) => {return this.filledEntities.map[val]});
    }

    /** Given negative entity name, return positive version **/		
    private PositiveName(negativeName: string) : string		
    {		
        if (negativeName.startsWith(NEGATIVE_PREFIX)) {		
            return negativeName.slice(1);		
        }		
        return null;		
    }

    /** Forget a predicted Entity */		
    public async ForgetEntity(predictedEntity : PredictedEntity) : Promise<void> {		
        let isBucket = predictedEntity.metadata ? predictedEntity.metadata.isBucket : false;		
        let posName = this.PositiveName(predictedEntity.entityName);		
        if (posName) {		
             await this.Forget(posName, predictedEntity.entityText, isBucket);		
        }		
    }

    /** Forget an entity value */
    public async Forget(entityName: string, entityValue : string = null, isBucket : boolean = false) : Promise<void> {
        try {
            // Check if entity buckets values
            await this.Init();
            if (isBucket)
            {
                // Entity might not be in memory
                if (!this.filledEntities.map[entityName]) {
                    return;
                }

                // If no entity Value provide, clear the entity
                if (!entityValue) {
                    delete this.filledEntities.map[entityName];
                }
                else {
                    // Find case insensitive index
                    let lowerCaseNames = this.filledEntities.map[entityName].values.map((mv) => {return mv.userText.toLowerCase();});

                    let index = lowerCaseNames.indexOf(entityValue.toLowerCase());
                    if (index > -1)
                    {
                        this.filledEntities.map[entityName].values.splice(index, 1);
                        if (this.filledEntities.map[entityName].values.length == 0)
                        {
                            delete this.filledEntities.map[entityName];
                        }
                    }    
                }
            }
            else
            {
                delete this.filledEntities.map[entityName];
            }
            await this.Set();
        }
        catch (error)
        {
             BlisDebug.Error(error);
        }  
    }

    public async DumpMemory() : Promise<Memory[]>
    {
        // Check if entity buckets values
        await this.Init();

        let memory : Memory[] = [];
        for (let entityName in this.filledEntities.map)
        {
            memory.push(new Memory({entityName:entityName, entityValues: this.MemoryValues(entityName)}));
        }
        return memory;
    }

    public async Value(entityName: string) : Promise<string> {
        await this.Init()
        return this.filledEntities.EntityValueAsString(entityName);
    }

    public async ValueAsList(entityName: string) : Promise<string[]> {
        await this.Init()
        return this.filledEntities.EntityValueAsList(entityName);
    } 

    public async ValueAsPrebuilt(entityName: string) : Promise<MemoryValue[]> {
        await this.Init()
        return this.MemoryValues(entityName);
    }

    private MemoryValues(entityName : string) : MemoryValue[]
    {
        if (!this.filledEntities.map[entityName]) {
            return [];
        }
        
        return this.filledEntities.map[entityName].values;  
    }
}