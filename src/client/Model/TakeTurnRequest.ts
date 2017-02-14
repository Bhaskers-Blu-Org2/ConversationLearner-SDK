import { JsonProperty } from 'json-typescript-mapper';

export class TakeTurnRequest
{
    @JsonProperty('text')
    public text : String;

    @JsonProperty('entities')
    public entities : [{}];

    @JsonProperty('context')
    public context : {};
 
    @JsonProperty('action-mask')
    public actionMask : [String];

    public constructor(init?:Partial<TakeTurnRequest>)
    {
        this.text = undefined;
        this.entities = undefined;
        this.context = undefined;      
        this.actionMask = undefined;
        (<any>Object).assign(this, init);
    }

    public ToJSON() : {}
    {
        var json = {};
        if (this.text)  
            json['text'] = this.text;
        if (this.entities)  
            json['entities'] = this.entities;
        if (this.context)  
            json['context'] = this.context;
        if (this.actionMask)  
            json['action-mask'] = this.context;
        return json;
    }
}