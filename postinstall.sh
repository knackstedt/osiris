if [[ -f node_modules/material-icon-theme/src/icons/generator/fileGenerator.ts ]]
then
    echo -e \"//@ts-nocheck\n$(cat node_modules/material-icon-theme/src/icons/generator/fileGenerator.ts)\" > node_modules/material-icon-theme/src/icons/generator/fileGenerator.ts
fi
