export const getMimeType = (name: string) =>
    (/\.(ogg|mp3|m4a|flac|wav|aiff|aac|wma|midi?)$/.test(name) && "music") ||
    (/\.(appimage)$/.test(name) && "compressed") ||
    (/\.(pot|potx|pps|ppsx|ppt|pptm|pptx)$/.test(name) && "presentation") ||
    (/\.(odt|rtf|doc|docm|docx|dot|dotm|dotx)$/.test(name) && "richtext") ||
    (/\.(ods|xls|xlsm|xlsx|xps|xlsx|csv)$/.test(name) && "spreadsheet") ||
    (/\.(stp|max|fbx|obj|x3d|vrml|3ds|3mf|stl|dae|dwg|blend)$/.test(name) && "3d-model") ||
    (/\.(mp4|mkv|webm|mpg|avi|mov|flv|wmv|)$/.test(name) && "video");
