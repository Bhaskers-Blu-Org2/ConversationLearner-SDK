
export const BLIS_INTENT_WRAPPER = "BLIS_INTENT_WRAPPER";

export const TakeTurnModes =
{
    CALLBACK : "lu_callback",
    TEACH :  "teach",
    ACTION :  "action",
    ERROR : "error"
}

export const ActionTypes =
{
    TEXT : "TEXT",
    API_LOCAL : "API_LOCAL",
    API_AZURE : "API_AZURE",
    INTENT : "INTENT",
    CARD : "CARD"
}

export const ActionTypes_v1 =
{
    TEXT : "text",
    API : "api",
    CARD : "card"
}

export const APITypes_v1 =
{
    AZURE : "AZURE",
    LOCAL : "LOCAL",
    INTENT: "INTENT"
}

export const EntityTypes =
{
    LOCAL : "LOCAL",
    LUIS : "LUIS"
}

export const TeachStep =
{
    LABELENTITY : "label_entity",
    LABELACTION : "label_action"
}

export const TeachAction =
{
    RETRAIN : "retrain",
    PICKACTION : "pickaction"
}

export const SaveStep =
{
    INPUT : "input",
    ENTITY : "entity",
    RESPONSES : "response",
    APICALLS : "api",
    CHOICES: "choices"
}

// Internal commands. (Not for user)
export const APICalls =
{
    SETTASK : "setTask",
    AZUREFUNCTION: "azureFunction",
    FIREINTENT: "fireIntent"
}

export const ActionCommand =
{
    SUGGEST : "*",
    REQUIRE : "+",
    BLOCK : "-",
    SUBSTITUTE: "$",
    BUCKET: "#",
    NEGATIVE: "~",       // Remove the entity
    TERMINAL: "WAIT",
    DEBUG: "/d"
}
