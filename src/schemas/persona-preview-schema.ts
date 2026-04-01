import { FormData } from "@/types/form-types";

export const personaPreviewSchema: FormData[] = [

    {
        name: "name",
        type: "text",
        label: "Persona Name",
        disabled: true,
        placeholder: "Enter the persona name",
        rules: {
            min: 4,
            max: 20
        },
        cols: 12,
        row: 4,
        rows: "3",

    },

    {
        name: "tags",
        type: "text",
        label: "Persona Tags",
        placeholder: "Single words that describe your persona",
        cols: 12,
        row: 4,
        rows: "3",
        disabled: true,


    },
    {
        name: "lorebook",
        type: "text",
        label: "Select Lorebook",
        placeholder: "Connect to Lorebook",
        cols: 12,
        row: 4,
        rows: "3",
        disabled: true,


    },
    {
        name: "details",
        type: "textarea",
        label: "Persona Details",
        placeholder: "Enter your persona details here. The character will use this information to understand how you want to be represented.",

        cols: 12,
        row: 4,
        rows: "3",
        disabled: true,

        tokens: true,
    },



]