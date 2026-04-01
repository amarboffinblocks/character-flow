import { FormData } from "@/types/form-types";

export const characterSchema: FormData[] = [
    {
        name: "avatar",
        type: "file",
        required: true,
        label: "Avatar",
        rules: {
            accept: ["png", "jpg"]
        },
        cols: 12,
        row: 4,
        rows: "3",
    },
    {
        name: "characterName",
        type: "text",
        label: "Character Name",
        required: true,
        placeholder: "Enter your character's name",
        rules: {
            min: 4,
            max: 20
        },
        cols: 12,
        row: 4,
        rows: "3",
    },
    {
        name: "visiable",
        type: "toggle",
        required: true,
        rules: {
            options: [
                { label: "Public", value: "public" },
                { label: "Private", value: "private" },],
        },
        cols: 4,
        row: 4,
        defaultValue: "private",
    },

    {
        name: "rating",
        type: "toggle",
        required: true,
        rules: {
            options: [
                { label: "NSFW", value: "NSFW" },
                { label: "SFW", value: "SFW" },],
        },
        cols: 4,
        row: 4,
        defaultValue: "SFW",
    },
    {
        name: "favourite",
        type: "checkbox",
        required: true,
        label: 'Add To Favourites',
        cols: 4,
        row: 4,
        defaultValue: false,
    },
    // {
    //     name: "lorebook",
    //     type: "select",
    //     required: true,
    //     label: "Link to Lorebook",
    //     placeholder: "Link to Lorebook",
    //     cols: 6,
    //     row: 4,
    //     rules: {
    //         options: [
    //             { label: "Luna AI", value: "8f3c2a7e-4c91-4e6a-9c77-1d8f6b4a2e91" },
    //             { label: "Astro Bot", value: "8f3c2a7e-4c91-4e6a-9c77-1d8f6b4a2e92" },
    //             { label: "Neo Guide", value: "8f3c2a7e-4c91-4e6a-9c77-1d8f6b4a2e93" },
    //             { label: "Zara Mentor", value: "8f3c2a7e-4c91-4e6a-9c77-1d8f6b4a2e94" },
    //         ],
    //     },
    //     rows: "3",

    // }, {
    //     name: "persona",
    //     type: "select",
    //     required: true,
    //     label: "Link to Persona",
    //     placeholder: "Link to Persona",
    //     cols: 6,
    //     row: 4,
    //     rules: {
    //         options: [
    //             { label: "Luna AI", value: "8f3c2a7e-4c91-4e6a-9c77-1d8f6b4a2e95" },
    //             { label: "Astro Bot", value: "8f3c2a7e-4c91-4e6a-9c77-1d8f6b4a2e96" },
    //             { label: "Neo Guide", value: "8f3c2a7e-4c91-4e6a-9c77-1d8f6b4a2e97" },
    //             { label: "Zara Mentor", value: "8f3c2a7e-4c91-4e6a-9c77-1d8f6b4a2e98" },
    //         ],
    //     },
    //     // defaultValue: "astro-bot",
    //     rows: "3",

    // }, 
    {
        name: "persona",
        type: "form-link-to",
        required: false,
        label: "Select Persona",
        placeholder: "Connect to Persona",
        cols: 6,
        row: 4,
        rules: {
            model: "persona",
            maxCount: 1,
            multiSelect: false,
        },
        rows: "3",

    },
    {
        name: "lorebook",
        type: "form-link-to",
        required: false,
        label: "Select Lorebook",
        placeholder: "Connect to Lorebook",
        cols: 6,
        row: 4,
        rules: {
            model: "lorebook",
            maxCount: 1,
            multiSelect: false,
        },
        rows: "3",

    },
    {
        name: "tags",
        type: "multi-select",
        label: "Choose Characters Tags",
        required: true,
        placeholder: "Single words describing your Character or Scenario.",
        rules: {
            model: "tags"
        },
        cols: 12,
        row: 4,
        rows: "3",

    },

    {
        name: "description",
        type: "textarea",
        label: "Description",
        required: true,
        placeholder: "Describe your Character, Scenario, or Universe here. For Characters please describe their physical and mental characteristics. For Scenario’s, Worlds, or Universe, use this place to establish the foundation. Link Lorebooks to further enhance the experience. ",
        cols: 12,
        row: 4,
        rows: "3",
        tokens: true,
    },
    {
        name: "scenario",
        type: "textarea",
        label: "Scenario",
        required: true,
        placeholder: "The scenario describes the current circumstances of the chat. It should also describe the context of the interaction.",
        cols: 12,
        row: 4,
        rows: "3",

        tokens: true,
    },
    {
        name: "personality",
        type: "textarea",
        label: "Personality Summary",
        required: true,
        placeholder: "A short summary of your Character’s personality. This can also be used to set a tone for the chat if creating or editing a Scenario, World, Universe.",
        cols: 12,
        row: 4,
        rows: "3",

        tokens: true,
    },
    {
        name: "firstMessage",
        type: "textarea",
        label: "First Message",
        required: true,
        placeholder: "This is the first message that you will see and will begin everything.",
        cols: 12,
        row: 4,
        rows: "2",

        tokens: true,
    },
    {
        name: "alternateMessages",
        type: "multi-entries",
        label: "Alternate Messages",
        required: true,
        placeholder: "This is exactly like the First Message, but allows you to change the opening, creating a whole new experience.",
        cols: 12,
        row: 4,
        rows: "3",
        tokens: true,
    },
    {
        name: "exampleDialogue",
        type: "example-dialogues",
        label: "Example Dialogue",
        required: true,
        placeholder: "Example Dialogues helps the model to speak and act as your character, scenario, world or universe would. PLEASE NOTE, each Example Dialogue will start with <START>, then on the next line the dialogue. Multiple Example Dialogues can be added.",
        cols: 12,
        row: 4,
        rows: "3",
        tokens: true,
    },
    {
        name: "authorNotes",
        type: "textarea",
        label: "Author Notes",
        required: true,
        placeholder: "This section does not impact the Character or Universe you are creating. This is used for any notes the Author or Creator of the Character Card wishes to add.",
        cols: 12,
        row: 4,
        rows: "3",
        tokens: false,
    },
    {
        name: "characterNotes",
        type: "textarea",
        label: "Character Notes",
        required: true,
        placeholder: "This section does not impact the Character or Universe you are creating. This is used for any notes the Author or Creator wishes to add that are specific to this Character Card.",
        cols: 12,
        row: 4,
        rows: "3",
        tokens: false,
    },
];